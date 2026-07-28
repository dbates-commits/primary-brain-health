import { test, expect, type FrameLocator, type Page } from "@playwright/test";
import { reachConsentStep, submitConsent } from "./helpers/booking";

/**
 * The onboarding money-path through Stripe: marketing booking → email confirm →
 * details → consent → Stripe test payment. Each case drives the whole flow with
 * a fresh user and ends at the charge outcome — success or a decline shown in
 * Stripe's Embedded Checkout. That's the boundary the funnel controls; the
 * post-payment Linus enrollment and app handoff are out of scope.
 *
 * Writes to the database and drives Stripe, so it only runs when the operator
 * opted in with E2E_FULL_FLOW=1 — otherwise skipped (not failed), since a
 * missing test DB or Stripe key would be a false red.
 *
 * Prereqs when E2E_FULL_FLOW=1 (see e2e/README.md):
 *   - DATABASE_URL → a dedicated test DB / Neon branch (NEVER prod/preview)
 *   - Stripe TEST keys + an ACTIVE assessment price
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

// Accepted Stripe test cards across brands. HSA/FSA cards are ordinary branded
// cards — Stripe test mode has no distinct HSA/FSA number and the funnel doesn't
// flag them (the `is_hsa_fsa` column is an unwired placeholder) — so this set is
// the HSA/FSA coverage: a normal card charge, whatever the brand.
const ACCEPTED_CARDS = [
  { label: "Visa", number: "4242424242424242" },
  { label: "Mastercard", number: "5555555555554444" },
];

// Decline test cards: Stripe refuses the charge and Checkout surfaces the reason
// in-frame; the payment never succeeds.
const DECLINED_CARDS = [
  {
    label: "generic decline",
    number: "4000000000000002",
    message: /card was declined|declined/i,
  },
  {
    label: "insufficient funds",
    number: "4000000000009995",
    message: /insufficient funds/i,
  },
];

/**
 * Drive signup → email confirm → details → consent for a fresh user and stop on
 * the payment step, returning the Stripe embedded-checkout frame. Resend is
 * disabled for the run, so the confirmation link is read back from the marketing
 * server log rather than an inbox.
 */
async function reachPaymentStep(page: Page): Promise<FrameLocator> {
  await reachConsentStep(page);
  await submitConsent(page);
  return page.frameLocator('iframe[name="embedded-checkout"]');
}

/**
 * Fill the Stripe card fields (stable ids in the embedded-checkout frame) and
 * submit. Opts out of Link "save my info", which otherwise forces a required
 * phone number and blocks the card charge.
 */
async function payWith(stripe: FrameLocator, cardNumber: string): Promise<void> {
  await expect(stripe.locator("#cardNumber")).toBeVisible({ timeout: 30_000 });
  await stripe.locator("#cardNumber").fill(cardNumber);
  await stripe.locator("#cardExpiry").fill("1234");
  await stripe.locator("#cardCvc").fill("123");
  const cardName = stripe.locator("#billingName");
  if (await cardName.count()) {
    await cardName.fill("Ada Lovelace");
  }
  const postal = stripe.locator("#billingPostalCode");
  if (await postal.count()) {
    await postal.fill("02101");
  }
  const saveInfo = stripe.getByLabel(/save my info/i);
  if ((await saveInfo.count()) && (await saveInfo.isChecked())) {
    await saveInfo.uncheck();
  }
  await stripe.locator('button[type="submit"]').click();
}

test.describe("onboarding payment", () => {
  test.skip(
    !FULL_FLOW,
    "Set E2E_FULL_FLOW=1 with a test DB + Stripe test keys to run the money path.",
  );

  for (const card of ACCEPTED_CARDS) {
    test(`accepted: ${card.label} → payment success`, async ({ page }) => {
      // The flow spans signup, email confirm, details, consent and a real Stripe
      // charge, so the default 30s per-test budget is far too short.
      test.setTimeout(120_000);
      const stripe = await reachPaymentStep(page);
      await payWith(stripe, card.number);
      await expect(stripe.getByText(/thanks for your payment/i)).toBeVisible({
        timeout: 30_000,
      });
    });
  }

  for (const card of DECLINED_CARDS) {
    test(`declined: ${card.label} → error, no charge`, async ({ page }) => {
      test.setTimeout(120_000);
      const stripe = await reachPaymentStep(page);
      await payWith(stripe, card.number);
      // Stripe shows the decline reason in-frame and never reaches success.
      await expect(stripe.getByText(card.message)).toBeVisible({
        timeout: 30_000,
      });
      await expect(stripe.getByText(/thanks for your payment/i)).toHaveCount(0);
    });
  }
});

import { test, expect } from "@playwright/test";
import { waitForConfirmUrl } from "./helpers/confirm";

/**
 * The whole onboarding money-path: marketing booking → Stripe test payment →
 * app handoff → /assessments "Welcome Back". This writes to the database and
 * drives Stripe + Linus, so it only runs when the operator has stood up the test
 * env and opted in with E2E_FULL_FLOW=1. Without that it's skipped (not failed),
 * because a missing test DB / Stripe key / Linus US-IP would be a false red.
 *
 * Prereqs when E2E_FULL_FLOW=1 (see e2e/README.md):
 *   - DATABASE_URL → a dedicated test DB / Neon branch (NEVER prod/preview)
 *   - Stripe TEST keys + an ACTIVE assessment price
 *   - Linus sandbox reachable from a US IP (run on a US VPN; no stub)
 *
 * Verified end-to-end against a live run through the Stripe payment success; the
 * done → handoff → /assessments assertions await a run with Linus staging up
 * (it was returning 503 when this landed).
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

test.describe("onboarding happy path", () => {
  test.skip(
    !FULL_FLOW,
    "Set E2E_FULL_FLOW=1 with a test DB + Stripe test keys + Linus sandbox to run the money path.",
  );

  test("booking → payment → handoff → assessments", async ({ page }) => {
    // The full flow drives real Stripe + Linus + DB across two apps, so the
    // default 30s per-test budget is far too short.
    test.setTimeout(120_000);

    const stamp = Date.now();
    const email = `e2e+${stamp}@example.com`;
    const firstName = "Ada";

    // --- Marketing: open the modal at signup ---
    await page.goto("/");
    await page.getByRole("button", { name: "Book Basic Assessment" }).click();

    await page.getByLabel("First Name").fill(firstName);
    await page.getByLabel("Last Name").fill("Lovelace");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Continue" }).click();

    // --- Confirm email (signup gates on it) ---
    // Resend is disabled for the run, so the confirmation link is logged rather
    // than mailed. Grab it from the marketing server log and visit it: that
    // stamps the address verified and resumes the modal at the details step.
    await expect(
      page.getByRole("heading", { name: /email confirmation/i }),
    ).toBeVisible();
    const confirmUrl = await waitForConfirmUrl();
    await page.goto(confirmUrl);

    // --- Details ---
    await page.getByLabel("Date of birth").fill("1990-01-15");
    await page.getByLabel("ZIP code").fill("02101");
    await page.getByLabel("Phone number").fill("(555) 000-0000");
    await page.getByLabel("Gender").selectOption({ index: 1 });
    await page.getByLabel("State of residence").selectOption({ label: "Massachusetts" });
    await page.getByLabel("Highest level of education").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Submit" }).click();

    // --- Consent ---
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /continue with payment/i }).click();

    // --- Payment (Stripe Embedded Checkout) ---
    // The card fields render directly in the embedded-checkout iframe with
    // stable ids; the submit button lives in that frame too. Wait for the card
    // field before filling — the step shows "Loading payment…" until Stripe
    // mounts.
    const stripe = page.frameLocator('iframe[name="embedded-checkout"]');
    await expect(stripe.locator("#cardNumber")).toBeVisible({ timeout: 30_000 });
    await stripe.locator("#cardNumber").fill("4242424242424242");
    await stripe.locator("#cardExpiry").fill("1234");
    await stripe.locator("#cardCvc").fill("123");
    // Billing name / postal are only present when Checkout collects them.
    const cardName = stripe.locator("#billingName");
    if (await cardName.count()) {
      await cardName.fill("Ada Lovelace");
    }
    const postal = stripe.locator("#billingPostalCode");
    if (await postal.count()) {
      await postal.fill("02101");
    }
    // "Save my information for faster checkout" (Stripe Link) is on by default
    // and makes the phone number required, which blocks the card payment. Opt
    // out so the plain card charge goes through.
    const saveInfo = stripe.getByLabel(/save my info/i);
    if ((await saveInfo.count()) && (await saveInfo.isChecked())) {
      await saveInfo.uncheck();
    }
    // The submit button reads "Pay $149.00"; target it by type to avoid the
    // Link wallet button above it.
    await stripe.locator('button[type="submit"]').click();

    // --- Done step → continue to the app ---
    // Payment confirmation + fulfillment (register/enroll with Linus) runs
    // before the done step renders, so allow generous time.
    await expect(
      page.getByRole("button", { name: /continue to your assessments/i }),
    ).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: /continue to your assessments/i }).click();

    // --- App: post-payment handoff lands on /assessments ---
    await expect(page).toHaveURL(/\/assessments/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: new RegExp(`Welcome Back, ${firstName}`, "i") }),
    ).toBeVisible();
  });
});

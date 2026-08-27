import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  BOOKING_COOKIE,
  RESUME_URL,
  bookingUserId,
  confirmEmail,
  fillDetails,
  openFromOverview,
  signUp,
  submitConsent,
} from "./helpers/booking";
import { waitForSignInUrl } from "./helpers/confirm";
import { payWith, stripeFrame } from "./helpers/stripe";

/**
 * Abandoning the booking flow and coming back, after every step.
 *
 * The other specs each walk the funnel once, straight through. This one stops
 * after every step, leaves, returns, and asserts what the server resolved — the
 * thing the overview pane and the stepper exist for. It ends by paying and
 * returning once more, to prove a finished booking is sent to `/welcome` rather
 * than back into the modal.
 *
 * The step is recomputed from persisted state every time, never from anything
 * the browser holds (`resolveBookingResumeState`), so each return is a real
 * assertion about the database and not about client state that happened to
 * survive.
 *
 * One leg drops the booking cookie and recovers by signing in. That is the path
 * a customer takes when they come back the next day: the cookie lives two hours
 * and the confirmation link is single-use, so the magic link is the only way
 * back in. It is also the only automated cover for `resolveActorId`'s session
 * fallback reaching *every* action rather than only the reads.
 *
 * Writes to the database and drives Stripe, so it only runs under
 * E2E_FULL_FLOW=1 — see e2e/README.md for the prereqs.
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

const VISA = "4242424242424242";

/** The overview, named by the accessible name `Modal` gets on that pane. */
function overviewPane(page: Page): Locator {
  return page.getByRole("dialog", { name: "Your onboarding steps" });
}

/**
 * The step list's own account of where things stand.
 *
 * Read from the `sr-only` status word rather than the icons, which are all
 * `aria-hidden` — the icons are decoration, the word is the statement.
 */
async function expectOverview(
  page: Page,
  expected: { cta: string; rows: string[] },
): Promise<void> {
  const overview = overviewPane(page);
  await expect(
    overview.getByRole("heading", { name: "Welcome Back!" }),
  ).toBeVisible({ timeout: 20_000 });

  const rows = overview.getByRole("listitem");
  await expect(rows).toHaveCount(expected.rows.length);
  for (const [i, status] of expected.rows.entries()) {
    await expect(rows.nth(i)).toContainText(status);
  }

  // `exact`: the details row's edit button is labelled "… — completed, edit",
  // which substring-matches the CTA's name. The two never coexist, but the
  // locator shouldn't depend on that.
  await expect(
    overview.getByRole("button", { name: expected.cta, exact: true }),
  ).toBeVisible();
}

/** Which tab the step pane says is current. */
async function expectCurrentTab(page: Page, label: string): Promise<void> {
  await expect(
    page.locator('nav[aria-label="Booking progress"] [aria-current="step"]'),
  ).toContainText(label);
}

test.describe("resuming an abandoned booking", () => {
  test.skip(
    !FULL_FLOW,
    "Set E2E_FULL_FLOW=1 with a test DB + Stripe test keys to run the resume path.",
  );

  test("every return lands on the step the server resolved", async ({
    page,
    context,
  }) => {
    // Longer than the money path's 120s: this walks the same flow with a
    // navigation and a fresh resume between every step.
    test.setTimeout(240_000);

    // ---- 1. Sign up, and stop at the gate --------------------------------
    const email = await signUp(page);
    const userId = await bookingUserId(context);

    // The gate is a precondition, not a step: no overview to survey and no
    // progress band, because nothing is behind them yet.
    await expect(overviewPane(page)).toHaveCount(0);
    await expect(page.locator('nav[aria-label="Booking progress"]')).toHaveCount(
      0,
    );

    // ---- 2. Leave while still unconfirmed --------------------------------
    await page.goto("about:blank");
    await page.goto(RESUME_URL);

    await expect(
      page.getByRole("heading", { name: /email confirmation/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(overviewPane(page)).toHaveCount(0);

    // ---- 3. Confirm the address ------------------------------------------
    // The route redirects to the resume URL, so this is itself a return.
    await confirmEmail(page, userId);
    await expectOverview(page, {
      cta: "Complete Personal Information",
      rows: ["Current step", "Not started", "Not started", "Not started"],
    });

    // ---- 4. Leave again, having done nothing since ------------------------
    // `reload`, not `goto`: the URL is already exactly this, and a same-URL
    // navigation including the fragment never remounts, so the resume would
    // not re-run and the assertion would pass on stale client state.
    await page.reload();
    await expectOverview(page, {
      cta: "Complete Personal Information",
      rows: ["Current step", "Not started", "Not started", "Not started"],
    });

    // ---- 5. Do the details step -------------------------------------------
    await openFromOverview(page, "Complete Personal Information");
    await expectCurrentTab(page, "Personal Information");
    await fillDetails(page);
    await expect(page.getByRole("checkbox")).toBeVisible();

    // ---- 6. Leave with one step behind them --------------------------------
    await page.reload();
    await expectOverview(page, {
      cta: "Sign Consent Form",
      rows: ["Completed", "Current step", "Not started", "Not started"],
    });

    // Details is the only step you may go back into, and the lock on the others
    // is structural: they render nothing clickable at all — not a disabled
    // button, nothing focusable — so there is no click to refuse.
    const rows = overviewPane(page).getByRole("listitem");
    await expect(
      rows.nth(0).getByRole("button", { name: /Personal Information.*edit/i }),
    ).toBeVisible();
    for (const locked of [1, 2, 3]) {
      await expect(rows.nth(locked).getByRole("button")).toHaveCount(0);
    }

    // ---- 7. Do the consent step --------------------------------------------
    await openFromOverview(page, "Sign Consent Form");
    await expectCurrentTab(page, "Sign Consent Form");
    await submitConsent(page);
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible({
      timeout: 30_000,
    });

    // ---- 8. Leave, and lose the cookie -------------------------------------
    // Two hours pass. `resolveBookingUserId` now returns null, the resolver
    // answers null with it, and the modal silently never opens — which is
    // exactly what a returning customer sees, and why the signup form offers
    // them a way to sign in.
    await context.clearCookies({ name: BOOKING_COOKIE });
    await page.reload();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // ---- 9. Sign back in ---------------------------------------------------
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page
      .getByRole("button", { name: "Email me a sign-in link" })
      .click();
    await page.goto(await waitForSignInUrl(email));

    // Auth.js lands them on /welcome, which bounces an unpaid visitor to the
    // resume URL. Nothing about their progress moved while they were away.
    await page.waitForURL(/booking=resume/, { timeout: 30_000 });
    await expectOverview(page, {
      cta: "Complete Payment",
      rows: ["Completed", "Completed", "Current step", "Not started"],
    });

    // ---- 10. Pay -----------------------------------------------------------
    await openFromOverview(page, "Complete Payment");
    await expectCurrentTab(page, "Complete Payment Details");

    const stripe = stripeFrame(page);
    await payWith(stripe, VISA);
    await expect(stripe.getByText(/thanks for your payment/i)).toBeVisible({
      timeout: 30_000,
    });
    await page.waitForURL(/\/welcome$/, { timeout: 30_000 });

    // ---- 11. Come back one last time ---------------------------------------
    // A finished booking resolves to `done`, which is not a modal step — the
    // flow sends them to the screen it stands for instead of reopening. This
    // is also what stops a paid customer re-entering payment, which has no
    // already-paid guard (pbh-ypf).
    await page.goto(RESUME_URL);
    await page.waitForURL(/\/welcome$/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /choose how to start/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

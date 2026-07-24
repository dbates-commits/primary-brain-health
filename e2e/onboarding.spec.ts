import { test, expect } from "@playwright/test";

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
 *   - Linus sandbox reachable from a US IP (or stubbed)
 *
 * Selectors are role/label based; a few may need tightening on first green run.
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

test.describe("onboarding happy path", () => {
  test.skip(
    !FULL_FLOW,
    "Set E2E_FULL_FLOW=1 with a test DB + Stripe test keys + Linus sandbox to run the money path.",
  );

  test("booking → payment → handoff → assessments", async ({ page }) => {
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

    // --- Details ---
    await page.getByLabel("Date of birth").fill("1990-01-15");
    await page.getByLabel("ZIP code").fill("02101");
    await page.getByLabel("Phone number").fill("(555) 000-0000");
    await page.getByLabel("Gender").selectOption({ index: 1 });
    await page.getByLabel("State of residence").selectOption({ label: "Massachusetts" });
    await page.getByLabel("Highest level of education").selectOption({ index: 1 });
    await page.getByRole("button", { name: /continue/i }).click();

    // --- Consent ---
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /continue|accept|agree/i }).click();

    // --- Payment (Stripe Embedded Checkout lives in an iframe) ---
    const stripe = page.frameLocator('iframe[title*="Secure" i], iframe[name^="embedded-checkout"]');
    await stripe.getByLabel(/card number/i).fill("4242424242424242");
    await stripe.getByLabel(/expir/i).fill("12 / 34");
    await stripe.getByLabel(/cvc/i).fill("123");
    await stripe.getByLabel(/zip|postal/i).fill("02101");
    await page.getByRole("button", { name: /pay \$/i }).click();

    // --- Done step → continue to the app ---
    await expect(
      page.getByRole("button", { name: /continue to your assessments/i }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: /continue to your assessments/i }).click();

    // --- App: post-payment handoff lands on /assessments ---
    await expect(page).toHaveURL(/\/assessments/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: new RegExp(`Welcome Back, ${firstName}`, "i") }),
    ).toBeVisible();
  });
});

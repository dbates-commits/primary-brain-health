import { test, expect } from "@playwright/test";

/**
 * Env-free smoke: the marketing booking section renders, offers one package, and
 * carries the signup form that starts the flow. No DB write, no Stripe, no
 * Linus — this is the check that the harness and the booking entry point work at
 * all. Submitting the form creates an account, so that path lives in
 * onboarding.spec.ts, which has the test secrets to do it.
 */
test.describe("booking entry (smoke)", () => {
  test("landing shows the $149 package and its signup form", async ({
    page,
  }) => {
    await page.goto("/");
    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();

    await expect(booking.getByText("$149")).toBeVisible();
    await expect(booking.getByRole("heading", { name: "Includes" })).toBeVisible();

    await expect(booking.getByLabel("First Name")).toBeVisible();
    await expect(booking.getByLabel("Last Name")).toBeVisible();
    await expect(booking.getByLabel("Email")).toBeVisible();
    await expect(booking.getByRole("button")).toBeEnabled();
  });

  test("the retired $449 package is not offered", async ({ page }) => {
    await page.goto("/");
    await page.locator("#booking").scrollIntoViewIfNeeded();

    // The package still exists in the catalog so historical purchases keep
    // resolving to the clinical track — it must simply never be sellable here.
    await expect(page.getByText("$449")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /comprehensive/i }),
    ).toHaveCount(0);
  });
});

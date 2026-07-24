import { test, expect } from "@playwright/test";

/**
 * Env-free smoke: the marketing booking section renders and a package CTA opens
 * the modal at the signup step. No DB write, no Stripe, no Linus — this is the
 * check that the harness and the booking entry point work at all. The full
 * money-path lives in onboarding.spec.ts and needs test secrets.
 */
test.describe("booking entry (smoke)", () => {
  test("landing shows both package cards", async ({ page }) => {
    await page.goto("/");
    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "Book Basic Assessment" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Book Comprehensive Assessment" }),
    ).toBeVisible();
  });

  test("a package CTA opens the modal at signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Basic Assessment" }).click();

    // Signup is the first modal step: first/last name + email.
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue" }),
    ).toBeVisible();
  });
});

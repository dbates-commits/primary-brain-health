import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { waitForConfirmUrl } from "./confirm";

/**
 * The signed, HttpOnly cookie the booking flow uses as identity. Named here at
 * the wire level on purpose: an E2E asserting authorization should break if the
 * cookie the browser actually receives changes name.
 */
export const BOOKING_COOKIE = "pbh_booking_session";

/**
 * A never-before-seen address per signup. The random suffix is the load-bearing
 * part: tests run in parallel workers, each with its own module instance, so a
 * timestamp-plus-counter alone collides when two workers start in the same
 * millisecond — and signup then fails with "an account with this email already
 * exists".
 */
let seq = 0;
export function uniqueEmail(): string {
  seq += 1;
  return `e2e+${Date.now()}-${seq}-${randomUUID().slice(0, 8)}@example.com`;
}

/**
 * Drive signup → email confirm → details for a fresh user and stop on the
 * consent step. Resend is disabled for the run, so the confirmation link is read
 * back from the marketing server log rather than an inbox.
 */
export async function reachConsentStep(page: Page): Promise<void> {
  const email = uniqueEmail();

  await page.goto("/");
  await page.getByRole("button", { name: "Book Basic Assessment" }).click();
  await page.getByLabel("First Name").fill("Ada");
  await page.getByLabel("Last Name").fill("Lovelace");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("heading", { name: /email confirmation/i }),
  ).toBeVisible();
  const confirmUrl = await waitForConfirmUrl();
  await page.goto(confirmUrl);

  await page.getByLabel("Date of birth").fill("1990-01-15");
  await page.getByLabel("ZIP code").fill("02101");
  await page.getByLabel("Phone number").fill("(555) 000-0000");
  await page.getByLabel("Gender").selectOption({ index: 1 });
  await page
    .getByLabel("State of residence")
    .selectOption({ label: "Massachusetts" });
  await page.getByLabel("Highest level of education").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("checkbox")).toBeVisible();
}

/** Tick the agreement box and submit the consent step. */
export async function submitConsent(page: Page): Promise<void> {
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /continue with payment/i }).click();
}

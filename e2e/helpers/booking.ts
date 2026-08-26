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
/**
 * Click through the overview pane into the step it points at.
 *
 * The pane leads any open where the booking already has progress behind it
 * (Figma 2063:583) — so, returning from the confirmation link, but not the
 * signup that precedes it. Asserting the label rather than clicking whatever is
 * there is deliberate: it is what would catch the pane offering an action the
 * customer cannot actually take.
 */
async function startFromOverview(page: Page, cta: string): Promise<void> {
  const overview = page.getByRole("dialog");
  await expect(overview.getByRole("heading", { name: /^Welcome/ })).toBeVisible();
  await overview.getByRole("button", { name: cta }).click();
}

export async function reachConsentStep(page: Page): Promise<void> {
  const email = uniqueEmail();

  await page.goto("/");

  // Signup is on the page now, not behind a card CTA. Scope to the section:
  // "First Name" also labels a field in the details step, so an unscoped
  // locator would go ambiguous the moment the modal opens.
  const booking = page.locator("#booking");
  await booking.getByLabel("First Name").fill("Ada");
  await booking.getByLabel("Last Name").fill("Lovelace");
  await booking.getByLabel("Email").fill(email);
  await booking.getByRole("button", { name: /book your assessment/i }).click();

  // Straight to the gate: signup shows the confirmation step and nothing else.
  // The overview is for someone coming back to progress they already have.
  await expect(
    page.getByRole("heading", { name: /email confirmation/i }),
  ).toBeVisible();
  const confirmUrl = await waitForConfirmUrl();
  await page.goto(confirmUrl);

  // Back from the link, so the overview says "Welcome Back!" and points at the
  // details step.
  await startFromOverview(page, "Complete Personal Information");

  // The details step's name fields arrive prefilled from signup — left as they
  // are here, which is the "booking for myself" path.
  const modal = page.getByRole("dialog");
  await modal.getByLabel("Birthday").fill("1990-01-15");
  await modal.getByLabel("ZIP Code").fill("02101");
  await modal.getByLabel("Phone Number").fill("(555) 000-0000");
  await modal.getByLabel("Gender").selectOption({ index: 1 });
  await modal
    .getByLabel("Highest Level of education")
    .selectOption({ index: 1 });
  await modal.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("checkbox")).toBeVisible();
}

/** Tick the agreement box and submit the consent step. */
export async function submitConsent(page: Page): Promise<void> {
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /continue with payment/i }).click();
}

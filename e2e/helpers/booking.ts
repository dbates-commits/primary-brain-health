import { randomUUID } from "node:crypto";
import { expect, type BrowserContext, type Page } from "@playwright/test";
import { waitForConfirmUrlForUser } from "./confirm";

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
export async function openFromOverview(page: Page, cta: string): Promise<void> {
  const overview = page.getByRole("dialog");
  // A longer wait than the default. The pane is opened by a mount effect that
  // first calls a server action, so the first test in a run waits on a cold
  // compile of the whole client bundle before that request is even made — well
  // past the 5s default, and only ever on the first one.
  await expect(overview.getByRole("heading", { name: /^Welcome/ })).toBeVisible({
    timeout: 20_000,
  });
  await overview.getByRole("button", { name: cta }).click();
}

/**
 * Where the booking flow reopens. Bare `/` will not do it: the resume effect
 * early-returns unless the marker is in the query string, so a customer who
 * simply retypes the address gets the signup form and no modal. Both server-side
 * producers of the marker — the confirmation route and `/welcome`'s unpaid
 * bounce — emit exactly this.
 */
export const RESUME_URL = "/?booking=resume#booking";

/**
 * This browser's booking user id, read out of the signed cookie.
 *
 * The cookie is `<userId>.<expiryMs>.<hmac>` and is HttpOnly, so the page cannot
 * read it — but the test's context can. Used to scope the log scrape to this
 * signup's confirmation link rather than whatever was logged last.
 */
export async function bookingUserId(context: BrowserContext): Promise<string> {
  const [cookie] = (await context.cookies()).filter(
    (c) => c.name === BOOKING_COOKIE,
  );
  expect(cookie, "signup should have issued the booking cookie").toBeTruthy();
  return cookie.value.split(".")[0];
}

/**
 * Fill and submit the on-page signup form, stopping at the confirmation gate.
 *
 * Deliberately does not consume the emailed link — a test that wants to leave
 * while still unverified needs to stop here. Returns the address, which the
 * sign-in leg needs.
 */
export async function signUp(page: Page): Promise<string> {
  const email = uniqueEmail();

  await page.goto("/");

  // Signup is on the page, not behind a card CTA. Scope to the section:
  // "First Name" also labels a field in the details step, so an unscoped
  // locator would go ambiguous the moment the modal opens.
  const booking = page.locator("#booking");
  await booking.getByLabel("First Name").fill("Ada");
  await booking.getByLabel("Last Name").fill("Lovelace");
  await booking.getByLabel("Email").fill(email);
  await booking.getByRole("button", { name: /book your assessment/i }).click();

  await expect(
    page.getByRole("heading", { name: /email confirmation/i }),
  ).toBeVisible({ timeout: 20_000 });

  return email;
}

/**
 * Redeem this user's confirmation link.
 *
 * Also a "come back": the route redirects to the resume URL, so returning from
 * the email and returning after abandoning are the same navigation.
 */
export async function confirmEmail(
  page: Page,
  userId: string,
): Promise<void> {
  await page.goto(await waitForConfirmUrlForUser(userId));
}

/** Fill and submit the details step that is already on screen. */
export async function fillDetails(page: Page): Promise<void> {
  // The name fields arrive prefilled from signup — left as they are here, which
  // is the "booking for myself" path.
  const modal = page.getByRole("dialog");
  await modal.getByLabel("Birthday").fill("1990-01-15");
  await modal.getByLabel("ZIP Code").fill("02101");
  await modal.getByLabel("Phone Number").fill("(555) 000-0000");
  await modal.getByLabel("Gender").selectOption({ index: 1 });
  await modal
    .getByLabel("Highest Level of education")
    .selectOption({ index: 1 });
  await modal.getByRole("button", { name: "Submit" }).click();
}

/** Drive signup → email confirm → details, stopping on the consent step. */
export async function reachConsentStep(page: Page): Promise<void> {
  await signUp(page);
  await confirmEmail(page, await bookingUserId(page.context()));

  // Back from the link, so the overview leads and points at the details step.
  await openFromOverview(page, "Complete Personal Information");
  await fillDetails(page);

  await expect(page.getByRole("checkbox")).toBeVisible();
}

/** Tick the agreement box and submit the consent step. */
export async function submitConsent(page: Page): Promise<void> {
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /continue with payment/i }).click();
}

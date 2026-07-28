import { test, expect } from "@playwright/test";
import { BOOKING_COOKIE, reachConsentStep, submitConsent } from "./helpers/booking";

/**
 * Authorization regression for pbh-9yb.2: booking mutations act on the account
 * named by the signed, HttpOnly booking cookie and on nothing else.
 *
 * Before the fix, the account came from a hidden `userId` field, so anyone
 * holding another customer's id could write a consent record — a legal artifact
 * — onto their account. This drives the real browser against the real action;
 * the cookie is the only thing changed.
 *
 * Needs the database (signup → confirm → details), so it runs under the same
 * E2E_FULL_FLOW opt-in as the money path. It touches no Stripe.
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

test.describe("booking authorization", () => {
  test.skip(
    !FULL_FLOW,
    "Set E2E_FULL_FLOW=1 with a test DB to run the authorization path.",
  );

  test("consent with a forged or absent booking cookie writes nothing", async ({
    page,
    context,
  }) => {
    test.setTimeout(120_000);
    await reachConsentStep(page);

    const [real] = (await context.cookies()).filter(
      (c) => c.name === BOOKING_COOKIE,
    );
    expect(real, "signup should have issued the booking cookie").toBeTruthy();
    expect(real.httpOnly, "booking cookie must not be readable by script").toBe(
      true,
    );

    // Forged: a real user id and expiry with the signature replaced — i.e.
    // exactly what an attacker who learned a user id can produce.
    const [userId, expiry] = real.value.split(".");
    await context.addCookies([
      { ...real, value: `${userId}.${expiry}.${"0".repeat(64)}` },
    ]);
    await submitConsent(page);
    await expect(
      page.getByText(/couldn.t find your booking/i),
    ).toBeVisible();

    // Absent: same refusal, no crash. The step is still on screen, so this
    // submits with no cookie at all rather than testing the resume path.
    await context.clearCookies({ name: BOOKING_COOKIE });
    await submitConsent(page);
    await expect(
      page.getByText(/couldn.t find your booking/i),
    ).toBeVisible();

    // Nothing was written: with the genuine cookie back, the flow still resumes
    // at consent. Had either attempt landed a `consents` row, this would resume
    // at payment instead.
    await context.addCookies([real]);
    await page.goto("/?booking=resume#booking");
    await expect(
      page.getByRole("button", { name: /continue with payment/i }),
    ).toBeVisible();
  });
});

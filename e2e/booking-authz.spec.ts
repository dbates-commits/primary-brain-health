import { test, expect } from "@playwright/test";
import { BOOKING_COOKIE, reachConsentStepSeeded, submitConsent } from "./helpers/booking";

/**
 * Authorization regression for pbh-9yb.2: booking mutations act on the account
 * named by the signed, HttpOnly booking cookie and on nothing else.
 *
 * Before the fix, the account came from a hidden `userId` field, so anyone
 * holding another customer's id could write a consent record — a legal artifact
 * — onto their account. This drives the real browser against the real action;
 * the cookie is the only thing changed.
 *
 * Needs the database, so it runs under the same E2E_FULL_FLOW opt-in as the
 * money path. It touches no Stripe and no Auth0: the account is seeded verified
 * and the genuine cookie is minted by the test (`helpers/seed.ts`), because the
 * signup journey now goes out to an identity provider that emails a code to a
 * human. The two specs that are *about* that journey are still switched off —
 * see pbh-mgr — but this one never was about it. Its subject is which account a
 * booking mutation writes to, and every byte that decides that is still real:
 * the cookie on the wire, the server's HMAC, and the action behind the form.
 */
const FULL_FLOW = process.env.E2E_FULL_FLOW === "1";

test.describe("booking authorization", () => {
  test.skip(!FULL_FLOW, "Set E2E_FULL_FLOW=1 with a test DB to run the authorization path.");

  test("consent with a forged or absent booking cookie writes nothing", async ({
    page,
    context,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    await reachConsentStepSeeded(page, baseURL!);

    const [real] = (await context.cookies()).filter((c) => c.name === BOOKING_COOKIE);
    expect(real, "the booking cookie should be in the jar").toBeTruthy();
    expect(real.httpOnly, "booking cookie must not be readable by script").toBe(true);

    // Forged: a real user id and expiry with the signature replaced — i.e.
    // exactly what an attacker who learned a user id can produce.
    const [userId, expiry] = real.value.split(".");
    await context.addCookies([{ ...real, value: `${userId}.${expiry}.${"0".repeat(64)}` }]);
    await submitConsent(page);
    await expect(page.getByText(/couldn.t find your booking/i)).toBeVisible();

    // Absent: same refusal, no crash. The step is still on screen, so this
    // submits with no cookie at all rather than testing the resume path.
    await context.clearCookies({ name: BOOKING_COOKIE });
    await submitConsent(page);
    await expect(page.getByText(/couldn.t find your booking/i)).toBeVisible();

    // Nothing was written: with the genuine cookie back, the flow still resumes
    // at consent. Had either attempt landed a `consents` row, this would resume
    // at payment instead.
    await context.addCookies([real]);
    // `reload`, not `goto`. The page is already at this exact URL — the confirm
    // route redirected here — and a `goto` to the same URL including its
    // fragment is a same-document navigation in Chrome, so nothing remounts and
    // the resume path never re-runs. The assertion below then passed on state
    // left over from before the cookie was cleared, rather than on anything the
    // server resolved.
    await page.reload();
    // The overview leads every open, and it is itself the assertion: it names
    // the step the server resolved to. Had either refused attempt landed a
    // `consents` row, this would read "Complete Payment" instead.
    const overview = page.getByRole("dialog");
    await expect(overview.getByRole("heading", { name: "Welcome Back!" })).toBeVisible();
    await overview.getByRole("button", { name: "Sign Consent Form" }).click();
    await expect(page.getByRole("button", { name: /continue with payment/i })).toBeVisible();
  });
});

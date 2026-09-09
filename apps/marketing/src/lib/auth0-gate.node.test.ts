import { describe, expect, it } from "vitest";
import { auth0SignInAddress } from "./auth0-gate";

/**
 * The Auth0 half of the login-only gate. Worth a test of its own because it is
 * the single check standing between `allowDangerousEmailAccountLinking` and an
 * account takeover — see the comment on `auth0SignInAddress`, and the "Auth0"
 * section of `docs/auth.md`.
 */
describe("auth0SignInAddress", () => {
  it("returns the verified profile email", () => {
    expect(
      auth0SignInAddress({ email: "a@example.com", email_verified: true }),
    ).toBe("a@example.com");
  });

  it("refuses an unverified address", () => {
    expect(
      auth0SignInAddress({ email: "a@example.com", email_verified: false }),
    ).toBeNull();
  });

  it("refuses a profile with no email_verified claim at all", () => {
    expect(auth0SignInAddress({ email: "a@example.com" })).toBeNull();
  });

  // The reason the check is `!== true` rather than truthy: a connection that
  // sends the flag as a string makes every value truthy, "false" included.
  it.each(["true", "false", 1, {}])(
    "refuses email_verified of %j, which is not the boolean true",
    (claim) => {
      expect(
        auth0SignInAddress({
          email: "a@example.com",
          email_verified: claim,
        }),
      ).toBeNull();
    },
  );

  it("falls back to the adapter's email when the profile omits one", () => {
    expect(auth0SignInAddress({ email_verified: true }, "b@example.com")).toBe(
      "b@example.com",
    );
  });

  it("refuses when neither source has an address", () => {
    expect(auth0SignInAddress({ email_verified: true })).toBeNull();
    expect(auth0SignInAddress({ email: "  ", email_verified: true })).toBeNull();
    expect(auth0SignInAddress(null)).toBeNull();
    expect(auth0SignInAddress(undefined)).toBeNull();
  });
});

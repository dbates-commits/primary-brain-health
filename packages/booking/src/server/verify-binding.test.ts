import { beforeAll, describe, expect, it } from "vitest";

import { createBookingSessionValue } from "./booking-session";
import {
  issueVerifyBinding,
  readVerifyBinding,
  VERIFY_BINDING_COOKIE,
  VERIFY_BINDING_TTL_SECONDS,
} from "./verify-binding";

/**
 * The binding that ties one trip out to Auth0 to the address it is supposed to
 * prove. Tested for the same reason `auth0SignInAddress` is: it is a gate, and
 * the `signIn` callback believes whatever it returns.
 */

/** Minimal stand-in for the cookie jar both real callers satisfy. */
function jar() {
  const store = new Map<string, string>();
  return {
    get: (name: string) => {
      const value = store.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name: string, value: string) => store.set(name, value),
    value: () => store.get(VERIFY_BINDING_COOKIE),
  };
}

function issued(email: string): string {
  const j = jar();
  issueVerifyBinding(j, email);
  return j.value()!;
}

beforeAll(() => {
  process.env.BOOKING_RESUME_SECRET = "test-secret-for-verify-binding";
});

describe("readVerifyBinding", () => {
  it("round-trips the address it was issued for", () => {
    expect(readVerifyBinding(issued("ada@example.com"))).toBe("ada@example.com");
  });

  it("normalizes, so a capitalized sign-in still matches", () => {
    expect(readVerifyBinding(issued("  Ada@Example.COM "))).toBe("ada@example.com");
  });

  it("refuses a tampered address", () => {
    const [, expiry, sig] = issued("ada@example.com").split(".");
    const forged = Buffer.from("mallory@example.com", "utf8").toString("base64url");
    expect(readVerifyBinding(`${forged}.${expiry}.${sig}`)).toBeNull();
  });

  it("refuses a tampered expiry", () => {
    const [encoded, expiry, sig] = issued("ada@example.com").split(".");
    expect(readVerifyBinding(`${encoded}.${Number(expiry) + 60_000}.${sig}`)).toBeNull();
  });

  it("refuses an expired binding", () => {
    const value = issued("ada@example.com");
    const [encoded, , sig] = value.split(".");
    expect(readVerifyBinding(`${encoded}.${Date.now() - 1}.${sig}`)).toBeNull();
  });

  it("refuses a booking session cookie presented as a binding", () => {
    // Same three-part shape and the same key. The domain tag is what separates
    // them: without it, a customer's own identity cookie would parse here.
    expect(readVerifyBinding(createBookingSessionValue("usr_1"))).toBeNull();
  });

  it("refuses absent, empty and malformed values", () => {
    expect(readVerifyBinding(undefined)).toBeNull();
    expect(readVerifyBinding("")).toBeNull();
    expect(readVerifyBinding("not-a-binding")).toBeNull();
  });

  it("lives as long as the Auth0 leg it describes", () => {
    const [, expiry] = issued("ada@example.com").split(".");
    const seconds = Math.round((Number(expiry) - Date.now()) / 1000);
    expect(seconds).toBeGreaterThan(VERIFY_BINDING_TTL_SECONDS - 5);
    expect(seconds).toBeLessThanOrEqual(VERIFY_BINDING_TTL_SECONDS);
  });
});

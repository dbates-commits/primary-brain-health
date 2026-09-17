import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  consentSignals,
  makeConsentChoice,
  parseConsentCookie,
  serializeConsentChoice,
} from "./consent";

describe("consent signals", () => {
  it("never grants advertising storage, in either decision", () => {
    for (const decision of ["granted", "denied"] as const) {
      const signals = consentSignals(decision);
      expect(signals.ad_storage).toBe("denied");
      expect(signals.ad_user_data).toBe("denied");
      expect(signals.ad_personalization).toBe("denied");
    }
  });

  it("ties analytics_storage to the decision and nothing else", () => {
    expect(consentSignals("granted").analytics_storage).toBe("granted");
    expect(consentSignals("denied").analytics_storage).toBe("denied");
  });
});

describe("parseConsentCookie", () => {
  it("round-trips a choice", () => {
    const choice = makeConsentChoice("granted", new Date("2026-09-17T10:00:00Z"));
    expect(parseConsentCookie(serializeConsentChoice(choice))).toEqual(choice);
  });

  // Each of these has to read as "no answer yet", not as a grant: a cookie we
  // cannot positively understand must never fail open into tracking.
  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["not JSON", "not-json"],
    ["not an object", encodeURIComponent('"granted"')],
    ["a bare true", encodeURIComponent(JSON.stringify({ analytics: true, version: CONSENT_VERSION, decidedAt: "2026-09-17T10:00:00Z" }))],
    ["an unknown decision", encodeURIComponent(JSON.stringify({ analytics: "maybe", version: CONSENT_VERSION, decidedAt: "2026-09-17T10:00:00Z" }))],
    ["an undated answer", encodeURIComponent(JSON.stringify({ analytics: "granted", version: CONSENT_VERSION }))],
  ])("returns null for %s", (_label, value) => {
    expect(parseConsentCookie(value as string | undefined)).toBeNull();
  });

  it("discards a grant given against an older disclosure", () => {
    const stale = encodeURIComponent(
      JSON.stringify({
        analytics: "granted",
        version: CONSENT_VERSION - 1,
        decidedAt: "2026-09-17T10:00:00Z",
      }),
    );
    expect(parseConsentCookie(stale)).toBeNull();
  });
});

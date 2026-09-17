/**
 * The stored cookie-consent choice, and the Google Consent Mode v2 signals it
 * translates into.
 *
 * Pure and browser-free on purpose: the rules about what a missing, malformed
 * or out-of-date choice means are the compliance surface here, so they are
 * testable without a DOM (`consent.node.test.ts`). Reading and writing the
 * cookie lives in `consent-storage.ts`, which is the only browser-only half.
 */

/** First-party, readable by the server if a future send needs to honour it. */
export const CONSENT_COOKIE = "pbh_cookie_consent";

/**
 * Bump when the disclosure changes materially. An older stamp is treated as no
 * answer at all and the banner asks again: consent is to a specific statement
 * about a specific collection, not a permanent flag on the browser.
 */
export const CONSENT_VERSION = 1;

/**
 * Six months. Long enough not to nag, short enough that a stale opt-in does not
 * outlive the session it was given in.
 */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export type ConsentDecision = "granted" | "denied";

export interface ConsentChoice {
  analytics: ConsentDecision;
  version: number;
  /** ISO 8601, so an audit can say when the answer was given. */
  decidedAt: string;
}

/**
 * Consent Mode v2 signals. `functionality_storage` and `security_storage` stay
 * granted in both states: they cover the session and anti-fraud cookies the
 * booking flow cannot work without, which are not what the banner is asking
 * about.
 */
export function consentSignals(decision: ConsentDecision) {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: decision,
    functionality_storage: "granted",
    security_storage: "granted",
  } as const;
}

/**
 * Read a stored choice back. Anything we cannot positively read as a current,
 * well-formed grant or refusal comes back null — which the banner treats as
 * unanswered and Consent Mode treats as denied. A corrupted cookie must never
 * fail open.
 */
export function parseConsentCookie(value: string | undefined): ConsentChoice | null {
  if (!value) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }
  const { analytics, version, decidedAt } = parsed as Record<string, unknown>;
  if (analytics !== "granted" && analytics !== "denied") {
    return null;
  }
  if (version !== CONSENT_VERSION) {
    return null;
  }
  if (typeof decidedAt !== "string" || Number.isNaN(Date.parse(decidedAt))) {
    return null;
  }
  return { analytics, version, decidedAt };
}

export function serializeConsentChoice(choice: ConsentChoice): string {
  return encodeURIComponent(JSON.stringify(choice));
}

export function makeConsentChoice(
  analytics: ConsentDecision,
  now: Date = new Date(),
): ConsentChoice {
  return { analytics, version: CONSENT_VERSION, decidedAt: now.toISOString() };
}

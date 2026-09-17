import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  consentSignals,
  makeConsentChoice,
  parseConsentCookie,
  serializeConsentChoice,
  type ConsentChoice,
  type ConsentDecision,
} from "./consent";

/**
 * The browser half of consent: the cookie, and the Consent Mode update that has
 * to follow every change to it.
 *
 * Kept apart from `consent.ts` so the rules stay node-testable, and kept out of
 * the components so there is exactly one place that can write the choice.
 */

/** Dispatched when the customer asks to revisit their choice (footer link). */
export const OPEN_COOKIE_CHOICES_EVENT = "pbh:open-cookie-choices";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * What the app knows about the choice right now. `"unknown"` is the honest
 * answer during SSR and the first render after it: the cookie is only legible
 * in the browser, so the server cannot tell a refusal from an unanswered
 * visitor, and rendering the banner on that guess would flash it at every
 * customer who already answered.
 */
export type ConsentStatus = "unknown" | "none" | "granted" | "denied";

let status: ConsentStatus = "unknown";
const listeners = new Set<() => void>();

/**
 * The consent choice as an external store, read through `useSyncExternalStore`.
 *
 * The cookie genuinely is state outside React — another tab can change it, and
 * it exists before the app mounts — and subscribing to it is what keeps the
 * banner out of the "read the DOM, then setState in an effect" cascade.
 */
export function subscribeConsentStatus(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getConsentStatus(): ConsentStatus {
  if (status === "unknown") {
    const stored = readConsentChoice();
    status = stored ? stored.analytics : "none";
  }
  return status;
}

export function getServerConsentStatus(): ConsentStatus {
  return "unknown";
}

export function readConsentChoice(): ConsentChoice | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsentCookie(match?.slice(CONSENT_COOKIE.length + 1));
}

/**
 * Record the choice and tell Consent Mode about it in the same breath.
 *
 * `SameSite=Lax` and no `HttpOnly`: the banner itself has to read it on the
 * next visit. It carries no identifier — just the answer — so there is nothing
 * in it worth protecting from script.
 */
export function writeConsentChoice(analytics: ConsentDecision): ConsentChoice {
  const choice = makeConsentChoice(analytics);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  status = analytics;
  document.cookie = `${CONSENT_COOKIE}=${serializeConsentChoice(choice)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  updateConsentMode(analytics);
  for (const listener of listeners) {
    listener();
  }
  return choice;
}

/**
 * Push a Consent Mode v2 update.
 *
 * Safe before gtag.js exists: the defaults script in the document head creates
 * `dataLayer` and the `gtag` shim, and everything queued there is replayed when
 * — and only when — the tag itself loads. The shim is re-created here rather
 * than assumed, so a consent update can never be the thing that throws if the
 * head script was blocked.
 *
 * It pushes the `arguments` object, not an array: that is the shape gtag.js
 * reads commands in, and a plain array is not reliably equivalent.
 */
export function updateConsentMode(analytics: ConsentDecision): void {
  const layer = (window.dataLayer = window.dataLayer ?? []);
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      layer.push(arguments);
    };
  }
  window.gtag("consent", "update", consentSignals(analytics));
}

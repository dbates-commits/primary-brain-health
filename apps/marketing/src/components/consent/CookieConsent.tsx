"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CookieConsentBanner } from "@pbh/ui";
import type { ConsentDecision } from "@/lib/consent";
import {
  getConsentStatus,
  getServerConsentStatus,
  OPEN_COOKIE_CHOICES_EVENT,
  subscribeConsentStatus,
  updateConsentMode,
  writeConsentChoice,
} from "@/lib/consent-storage";
import { COOKIE_CONSENT_COPY as copy } from "./cookie-consent-copy";
import { GoogleAnalytics } from "./GoogleAnalytics";

/**
 * Owns the consent decision: shows the banner when there isn't one, records it,
 * replays it to Consent Mode on every load, and gates the analytics tag on it.
 *
 * The gate is the whole point of putting the loader inside this component
 * rather than beside it in the layout: `GoogleAnalytics` is only ever mounted
 * in the granted branch, so before a grant there is no `<script>` for gtag.js
 * in the document at all — not a tag that loads and declines to send.
 *
 * Nothing renders on the first pass even when the choice is missing. The cookie
 * is only legible in the browser, so a banner rendered during SSR would flash
 * for the customers who already answered.
 */
export function CookieConsent() {
  const status = useSyncExternalStore(
    subscribeConsentStatus,
    getConsentStatus,
    getServerConsentStatus,
  );
  const [reopened, setReopened] = useState(false);

  /**
   * Re-state a standing choice to Consent Mode on every load. The defaults
   * script in the head has just set denied, and this replay is the only thing
   * that turns an earlier grant back on.
   */
  useEffect(() => {
    if (status === "granted" || status === "denied") {
      updateConsentMode(status);
    }
  }, [status]);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_COOKIE_CHOICES_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_CHOICES_EVENT, reopen);
  }, []);

  const decide = useCallback((analytics: ConsentDecision) => {
    writeConsentChoice(analytics);
    setReopened(false);
  }, []);

  const asking = status === "none" || reopened;

  return (
    <>
      {status === "granted" && <GoogleAnalytics />}
      {asking && (
        <CookieConsentBanner
          title={copy.title}
          body={
            <>
              <p>{copy.bodyLead}</p>
              <p className="mt-2">
                {copy.bodyTrail}{" "}
                <Link href={copy.policyHref} className="underline">
                  {copy.policyLinkLabel}
                </Link>
                .
              </p>
            </>
          }
          acceptLabel={copy.acceptLabel}
          declineLabel={copy.declineLabel}
          onAccept={() => decide("granted")}
          onDecline={() => decide("denied")}
        />
      )}
    </>
  );
}

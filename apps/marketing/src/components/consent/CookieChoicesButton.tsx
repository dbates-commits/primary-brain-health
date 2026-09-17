"use client";

import { OPEN_COOKIE_CHOICES_EVENT } from "@/lib/consent-storage";
import { COOKIE_CONSENT_COPY } from "./cookie-consent-copy";

/**
 * The standing way back to the banner, for the footer.
 *
 * It reaches `CookieConsent` through a window event rather than shared state:
 * the banner lives inside the layout's body and the footer is a sibling of it,
 * and a context provider spanning both would wrap every server-rendered page in
 * a client component for the sake of one link.
 */
export function CookieChoicesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_CHOICES_EVENT))}
    >
      {COOKIE_CONSENT_COPY.reopenLabel}
    </button>
  );
}

"use client";

import Script from "next/script";

/**
 * Loads gtag.js. Mounted only from the granted branch of `CookieConsent` — this
 * component is what "GA does not load before consent" means in practice, so it
 * must never be rendered from a layout or a page directly.
 *
 * Renders nothing when the measurement ID is unset, which is every environment
 * until David creates the GA4 property (pbh-bws.25).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return null;
  }
  return (
    <>
      <Script
        id="ga-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
    </>
  );
}

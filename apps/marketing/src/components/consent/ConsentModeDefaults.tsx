import { consentSignals } from "@/lib/consent";

/**
 * Google Consent Mode v2 defaults, inlined in the document head.
 *
 * This has to be the first script in the document and it has to be synchronous:
 * Consent Mode's guarantee is that the defaults are already in `dataLayer`
 * before any tag reads them. `next/script` cannot promise that ordering inside
 * `<head>`, so it is a plain `<script>` with `dangerouslySetInnerHTML` — the
 * only content of which is generated from `consentSignals("denied")` here, with
 * no request data in it.
 *
 * Everything defaults to denied. The stored choice is replayed as an `update`
 * by `CookieConsent` once React mounts; `wait_for_update` gives that a moment
 * so a returning customer who accepted is not measured as a refusal.
 */
export function ConsentModeDefaults() {
  const defaults = JSON.stringify({ ...consentSignals("denied"), wait_for_update: 500 });
  return (
    <script
      id="consent-mode-defaults"
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',${defaults});`,
      }}
    />
  );
}

/**
 * The one canonical public origin — the marketing site, which is now the whole
 * customer-facing surface (booking modal, `/login`, `/welcome`, email assets).
 *
 * Falls back to `VERCEL_URL`, the per-deployment hostname, so Preview works
 * without configuration. A fixed value there would be wrong the moment a new
 * preview is built: every link would point back at whichever deployment
 * happened to be current when the variable was set. Production sets
 * `BOOKING_BASE_URL` explicitly, because `VERCEL_URL` is the generated
 * `*.vercel.app` host rather than the real domain.
 *
 * Still named `BOOKING_BASE_URL` because it is already set in every Vercel
 * scope; renaming it is cosmetic and would mean a coordinated env change.
 */
export function siteBaseUrl(): string {
  if (process.env.BOOKING_BASE_URL) {
    return process.env.BOOKING_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

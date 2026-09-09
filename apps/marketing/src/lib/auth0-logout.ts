import "server-only";

import { AUTH0_ENABLED } from "./auth0-enabled";

/**
 * Where to send the browser after destroying our own session, so that Auth0's
 * session ends too.
 *
 * **Signing out of PBH does not sign anyone out of Auth0.** Our session lives in
 * a cookie on our domain and a row in `sessions`; Auth0 keeps its own SSO cookie
 * on the tenant domain, and nothing we delete touches it. Left alone, the next
 * trip to `/authorize` is silently re-authenticated as whoever last signed in —
 * which is both a privacy problem on a shared computer and, worse, a way for a
 * brand-new signup to be authenticated as somebody else (see `signupAction`,
 * which forces re-authentication for exactly this reason).
 *
 * `returnTo` must be listed in the application's **Allowed Logout URLs** in the
 * Auth0 dashboard, or Auth0 refuses the request and strands the user on an
 * error page. It is the origin, not a path, to keep that list short.
 *
 * Returns null when Auth0 isn't configured — the caller then just goes home.
 */
export function auth0LogoutUrl(origin: string): string | null {
  const issuer = process.env.AUTH0_ISSUER;
  const clientId = process.env.AUTH0_CLIENT_ID;
  if (!AUTH0_ENABLED || !issuer || !clientId) {
    return null;
  }

  const url = new URL("/v2/logout", issuer);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("returnTo", origin);
  return url.toString();
}

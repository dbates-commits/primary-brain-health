import "server-only";

import { AUTH0_ENABLED, AUTH0_ISSUER_URL } from "./auth0-enabled";

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
 * Returns null when Auth0 isn't configured, or when `AUTH0_ISSUER` is not a URL
 * this can build on — the caller then just goes home. It must not throw: it is
 * called *after* the session row is deleted, so a throw here would report a
 * successful sign-out while leaving Auth0's half of it intact, which is the one
 * outcome this module exists to prevent.
 */
export function auth0LogoutUrl(origin: string): string | null {
  const issuer = AUTH0_ISSUER_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  if (!AUTH0_ENABLED || !issuer || !clientId) {
    return null;
  }

  let url: URL;
  try {
    url = new URL("/v2/logout", issuer);
  } catch {
    console.error("[auth] AUTH0_ISSUER is not a valid URL:", issuer);
    return null;
  }
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("returnTo", origin);
  return url.toString();
}

import "server-only";

/**
 * The name of the cookie Auth.js keeps the session token in.
 *
 * Its own module so that code reachable *from* `auth.ts` can name the cookie
 * without importing `auth-session.ts`, which reads a lifetime constant back out
 * of `auth.ts` and would close the loop.
 */

/**
 * Whether Auth.js is using secure cookies (and so the `__Secure-` name prefix).
 *
 * Auth.js derives this from the **request protocol**, not from NODE_ENV
 * (`@auth/core/lib/init.js`: `config.useSecureCookies ?? url.protocol ===
 * "https:"`). Callers that have the request must pass its protocol; guessing
 * from NODE_ENV diverges for a production build served over http — we would
 * write `__Secure-…` (which the browser then refuses over http) while `auth()`
 * reads the unprefixed name, and the session would silently never be found.
 */
export function secureCookiesEnabled(protocol?: string): boolean {
  if (protocol) {
    return protocol.startsWith("https");
  }
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName(protocol?: string): string {
  return secureCookiesEnabled(protocol) ? "__Secure-authjs.session-token" : "authjs.session-token";
}

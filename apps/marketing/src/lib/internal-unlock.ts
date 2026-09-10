/**
 * The shared password gate on `/internal/*`.
 *
 * One password, no username: these pages are shared as a link with people
 * outside the team, and an account is more ceremony than the thing is worth.
 *
 * Web Crypto only, and no `server-only` marker, because both sides of the gate
 * import this — the proxy that guards every `/internal` request, and the server
 * action behind the unlock form. The cookie carries a hash of the password
 * rather than the password: it is HttpOnly either way, but a hash cannot be
 * read out of a browser profile and typed into the box later.
 */

export const UNLOCK_COOKIE = "pbh_internal_unlock";

export const UNLOCK_PATH = "/internal/unlock";

/** A week. Long enough that a reviewer isn't asked twice in the same round. */
export const UNLOCK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** What the cookie holds: the password, hashed, as base64url. */
export async function unlockToken(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`pbh-internal:${password}`),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

/** Compares in time that doesn't depend on where the first difference is. */
export function tokensMatch(given: string, expected: string): boolean {
  if (given.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < given.length; i += 1) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Where to send someone after they unlock.
 *
 * Only paths under `/internal` are honoured — the target arrives in the query
 * string, and anything else there is somebody trying to use this page as an
 * open redirect.
 */
export function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/internal/") && !next.startsWith("//")) {
    return next;
  }
  return "/internal/flow";
}

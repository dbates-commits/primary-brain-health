import "server-only";

import { createHash, createHmac } from "node:crypto";

/**
 * Request-metadata helpers for compliance records (consent, audit log). We store
 * a *hash* of the client IP, never the raw address. Uses Node's built-in crypto
 * (Server Actions run in the Node.js runtime).
 *
 * `getClientIp` takes a standard `Headers` object, so it's framework-agnostic —
 * each app reads its own request headers (e.g. `await headers()` in Next) and
 * passes them in.
 */

/**
 * Best-effort client IP from proxy headers. `x-forwarded-for` is a
 * comma-separated chain (client first); fall back to `x-real-ip`.
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return null;
}

/**
 * Deterministic SHA-256 hash of an identifying value — same input, same hash,
 * so repeat sources can be spotted without the value itself being stored.
 * Keyed with HMAC when `IP_HASH_SECRET` is configured.
 *
 * Named for the property that matters rather than for IPs: the sign-in
 * throttle hashes email addresses through here too, and one keyed hash is
 * easier to reason about (and to rotate) than two.
 *
 * **The unkeyed fallback is not a hash you can rely on.** Both things hashed
 * here — an IPv4 address and an email address — have a keyspace small enough to
 * walk with a dictionary, so without the key the stored digests are recoverable
 * values, not anonymised ones. `assertIdentifierHashSecret` is what stops a
 * deployment landing in that state unnoticed; the fallback exists so a local
 * checkout still runs.
 */
export function hashIdentifier(value: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (secret) {
    return createHmac("sha256", secret).update(value).digest("hex");
  }
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Refuse to boot a deployment with no `IP_HASH_SECRET`. Called from each app's
 * `instrumentation.ts`.
 *
 * The columns fed by `hashIdentifier` — `consents.ip_hash`, `audit_log.ip_hash`
 * and `auth_rate_limits.bucket` — are all documented as keyed hashes, and the
 * last of those exists precisely so the throttle does not accumulate a list of
 * addresses people typed into a brain-health site. Unkeyed, it accumulates
 * exactly that list in recoverable form. Silently degrading to a weaker hash is
 * the failure mode worth ruling out: nothing breaks, so nobody looks.
 *
 * Anything with a `VERCEL_ENV` throws — preview included, because the preview
 * database holds addresses really typed into preview deploys, and each scope has
 * its own key so a preview leak cannot touch production digests. Local only
 * warns: a checkout with no secret should still run, and it writes to a database
 * nobody else reads.
 */
export function assertIdentifierHashSecret(): void {
  if (process.env.IP_HASH_SECRET) {
    return;
  }
  const message =
    "[env] IP_HASH_SECRET is not set, so IP and email hashes are unkeyed " +
    "SHA-256 — a dictionary recovers them. Set it alongside DATABASE_URL in " +
    "this scope. See docs/auth.md § Sign-in throttling.";
  if (process.env.VERCEL_ENV) {
    throw new Error(message);
  }
  console.error(message);
}

/**
 * Hash of the client IP. A null IP hashes a sentinel so the NOT NULL
 * `consents.ip_hash` / `audit_log.ip_hash` columns are always satisfiable.
 */
export function hashIp(ip: string | null): string {
  return hashIdentifier(ip ?? "unknown");
}

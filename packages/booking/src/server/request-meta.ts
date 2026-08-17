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
 */
export function hashIdentifier(value: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (secret) {
    return createHmac("sha256", secret).update(value).digest("hex");
  }
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Hash of the client IP. A null IP hashes a sentinel so the NOT NULL
 * `consents.ip_hash` / `audit_log.ip_hash` columns are always satisfiable.
 */
export function hashIp(ip: string | null): string {
  return hashIdentifier(ip ?? "unknown");
}

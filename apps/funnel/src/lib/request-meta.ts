import { createHash, createHmac } from "node:crypto";

/**
 * Request-metadata helpers for compliance records (consent, audit log). We store
 * a *hash* of the client IP, never the raw address. Uses Node's built-in crypto
 * (Server Actions run in the Node.js runtime, like `password.ts`).
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
 * Deterministic SHA-256 hash of the IP (same IP → same hash, so we can spot
 * repeat sources without storing the raw address). Keyed with HMAC when
 * `IP_HASH_SECRET` is configured. A null IP hashes a sentinel so the NOT NULL
 * `consents.ip_hash` / `audit_log.ip_hash` columns are always satisfiable.
 */
export function hashIp(ip: string | null): string {
  const value = ip ?? "unknown";
  const secret = process.env.IP_HASH_SECRET;
  if (secret) {
    return createHmac("sha256", secret).update(value).digest("hex");
  }
  return createHash("sha256").update(value).digest("hex");
}

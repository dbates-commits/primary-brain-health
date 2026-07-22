import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, short-lived proof that this browser confirmed an email address, used
 * to reopen the booking modal at the right step.
 *
 * Deliberately signed. An unsigned user-id cookie is exactly what the Auth.js
 * work removed (`ASSESSMENT_UID_COOKIE`) — anyone could type another person's id
 * and resume their booking. This does not replace the wider client-supplied
 * `userId` seam in `server/auth.ts`, which is still an open TODO; it just avoids
 * re-introducing the weaker pattern here.
 *
 * Format: `<userId>.<expiryMs>.<hmac>` — HMAC-SHA256 over `userId.expiryMs`.
 */
export const BOOKING_RESUME_COOKIE = "pbh_booking_resume";

/** How long a confirmed browser can resume without clicking a fresh link. */
export const BOOKING_RESUME_TTL_SECONDS = 60 * 60 * 2;

function getSecret(): string {
  const secret = process.env.BOOKING_RESUME_SECRET;
  if (!secret) {
    throw new Error(
      "Booking resume is not configured. Missing BOOKING_RESUME_SECRET. " +
        "Locally, copy .env.example to .env.local and generate one with " +
        "`openssl rand -base64 32`. On Vercel, set it per environment.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Mint the cookie value for a user whose email was just confirmed. */
export function createResumeCookieValue(userId: string): string {
  const expiry = Date.now() + BOOKING_RESUME_TTL_SECONDS * 1000;
  const payload = `${userId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify a cookie value and return the user id it vouches for, or null.
 *
 * Compared with `timingSafeEqual` so a forged cookie can't be tuned byte by byte
 * against response timing. Length is checked first because `timingSafeEqual`
 * throws on a length mismatch.
 */
export function readResumeCookieValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const parts = value.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [userId, expiryRaw, signature] = parts;

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return null;
  }

  const expected = sign(`${userId}.${expiryRaw}`);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  return userId;
}

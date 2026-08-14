import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The HMAC the booking flow signs its own statements with.
 *
 * Two things use it: the identity cookie (`booking-session.ts`) and the consent
 * stamp (`consent-stamp.ts`). Both are the server telling itself something it
 * will later have to believe, round-tripped through a client that must not be
 * able to author or edit it.
 *
 * Env var name is unchanged from when this secret only signed the resume
 * marker: it is already set in every environment, and rotating it would strand
 * every in-flight booking for no security gain.
 */
export function getBookingSecret(): string {
  const secret = process.env.BOOKING_RESUME_SECRET;
  if (!secret) {
    throw new Error(
      "Booking identity is not configured. Missing BOOKING_RESUME_SECRET. " +
        "Locally, copy .env.example to .env.local and generate one with " +
        "`openssl rand -base64 32`. On Vercel, set it per environment.",
    );
  }
  return secret;
}

export function signPayload(payload: string): string {
  return createHmac("sha256", getBookingSecret()).update(payload).digest("hex");
}

/**
 * Whether `signature` is the signature for `payload`.
 *
 * Compared with `timingSafeEqual` so a forgery can't be tuned byte by byte
 * against response timing. Length is checked first because `timingSafeEqual`
 * throws on a length mismatch.
 */
export function signatureMatches(payload: string, signature: string): boolean {
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(signPayload(payload), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

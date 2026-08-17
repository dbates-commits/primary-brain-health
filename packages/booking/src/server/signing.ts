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

/**
 * What a signature is *for*, mixed into the signed bytes so a value minted for
 * one purpose can't be presented as another.
 *
 * One key signs both messages, and their formats overlap: a session cookie is
 * `<userId>.<expiryMs>.<hmac>`, and a consent stamp splits at its last dot too
 * — so without this, a customer could paste their own cookie into the consent
 * form and have `<userId>.<expiryMs>` recorded as the terms version on an
 * append-only row.
 *
 * `BOOKING_SESSION_DOMAIN` is empty on purpose: it names the format that
 * shipped before this separation existed, and tagging it would invalidate every
 * cookie mid-flight, stranding customers partway through a booking. It doesn't
 * need a tag to be safe — every *other* message has one, so nothing else
 * verifies against it. Anything new gets a real tag.
 */
export const BOOKING_SESSION_DOMAIN = "";
export const CONSENT_STAMP_DOMAIN = "consent-stamp";

/**
 * NUL, so a tag can't be spelled out of the payload's own leading characters.
 */
function tagged(domain: string, payload: string): string {
  return domain === "" ? payload : `${domain}\0${payload}`;
}

export function signPayload(domain: string, payload: string): string {
  return createHmac("sha256", getBookingSecret())
    .update(tagged(domain, payload))
    .digest("hex");
}

/**
 * Whether `signature` is this domain's signature for `payload`.
 *
 * Compared with `timingSafeEqual` so a forgery can't be tuned byte by byte
 * against response timing. Length is checked first because `timingSafeEqual`
 * throws on a length mismatch.
 */
export function signatureMatches(
  domain: string,
  payload: string,
  signature: string,
): boolean {
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(signPayload(domain, payload), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

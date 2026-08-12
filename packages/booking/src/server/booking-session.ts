import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The booking flow's identity cookie: signed, HttpOnly server-side proof that
 * *this browser* owns the account it names.
 *
 * Marketing has no login, so until now the paying user's id rode in a hidden
 * form field and every booking mutation trusted it. A random UUID is
 * unguessable, but unguessability is not an authorization control: one leaked id
 * — a log line, a referrer, a support ticket — was enough to write PII onto
 * someone else's account, or to mint their post-payment sign-in link. The id is
 * now issued server-side at signup and never travels through the client.
 *
 * Format: `<userId>.<expiryMs>.<hmac>` — HMAC-SHA256 over `userId.expiryMs`.
 *
 * It also does the job this cookie already did on its own: a customer returning
 * from the emailed confirmation link gets a fresh one from the confirm route,
 * and that is what reopens the modal at the right step.
 *
 * Not a session — it grants nothing in the funnel app. Signing in still happens
 * only through a magic link or the session minted at payment.
 */
export const BOOKING_SESSION_COOKIE = "pbh_booking_session";

/** Long enough to finish a booking including the email round-trip, no longer. */
export const BOOKING_SESSION_TTL_SECONDS = 60 * 60 * 2;

/**
 * The cookie jar shape both callers satisfy — Next's `cookies()` in a Server
 * Action and `NextResponse.cookies` in a Route Handler — so this package stays
 * framework-agnostic and imports no Next types.
 */
export interface BookingCookieJar {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: BookingCookieOptions): unknown;
}

export interface BookingCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
}

/**
 * Env var name is unchanged from when this cookie was only a resume marker: it
 * is already set in every environment, and rotating it would strand every
 * in-flight booking for no security gain.
 */
function getSecret(): string {
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

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function bookingSessionCookieOptions(): BookingCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BOOKING_SESSION_TTL_SECONDS,
  };
}

/** Mint the cookie value vouching for `userId`. */
export function createBookingSessionValue(userId: string): string {
  const expiry = Date.now() + BOOKING_SESSION_TTL_SECONDS * 1000;
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
export function readBookingSessionValue(
  value: string | undefined,
): string | null {
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

/** Write the cookie for `userId` onto a jar (Server Action or NextResponse). */
export function issueBookingSession(
  jar: BookingCookieJar,
  userId: string,
): void {
  jar.set(
    BOOKING_SESSION_COOKIE,
    createBookingSessionValue(userId),
    bookingSessionCookieOptions(),
  );
}

import "server-only";

import type { BookingCookieJar } from "./booking-session";
import { normalizeEmail } from "./email";
import { signPayload, signatureMatches, VERIFY_BINDING_DOMAIN } from "./signing";

/**
 * Which address the trip out to Auth0 is supposed to prove.
 *
 * `login_hint` only *pre-fills* the field on Universal Login. A customer who
 * edits it verifies some other account while the booking cookie still points at
 * the one they signed up with — which is left unverified, so the confirm step
 * holds them there for good, with nothing on screen saying why. If that other
 * address has no PBH account the sign-in is refused instead, and the row they
 * created is orphaned.
 *
 * So the leg says what it is for, and the `signIn` callback refuses a profile
 * that disagrees. **Scoped to that leg on purpose**: only `signupAction` and
 * `verifyEmailAction` issue this cookie, so a plain sign-in from the header is
 * untouched — including the documented case where a customer who has already
 * paid starts a booking for a family member and then signs in as themselves.
 *
 * Format: `<base64url(email)>.<expiryMs>.<hmac>`, tagged with its own domain so
 * it cannot be presented as a session cookie or a consent stamp. The address
 * travels signed rather than hashed because `/login` renders it back — telling
 * someone "you confirmed the wrong address" without naming either one is not
 * worth the round trip.
 *
 * It is a statement about a redirect in flight, not a credential: it grants
 * nothing, and on its own it only ever narrows what a sign-in may do.
 */
export const VERIFY_BINDING_COOKIE = "pbh_verify_for";

/**
 * Matches the Auth0 leg's own window (`AUTH0_LEG_MAX_SECONDS`): the customer
 * leaves, finds a code, comes back. Short for the same reason — a binding left
 * lying around would refuse the *next* sign-in from this browser as another
 * person, which is the failure this is here to prevent, pointed the other way.
 */
export const VERIFY_BINDING_TTL_SECONDS = 60 * 30;

function encode(email: string): string {
  return Buffer.from(email, "utf8").toString("base64url");
}

/** Say that the sign-in about to start must land on `email`. */
export function issueVerifyBinding(jar: BookingCookieJar, email: string): void {
  const payload = `${encode(normalizeEmail(email))}.${Date.now() + VERIFY_BINDING_TTL_SECONDS * 1000}`;
  jar.set(VERIFY_BINDING_COOKIE, `${payload}.${signPayload(VERIFY_BINDING_DOMAIN, payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VERIFY_BINDING_TTL_SECONDS,
  });
}

/** The address this browser is mid-verification for, normalized, or null. */
export function readVerifyBinding(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const parts = value.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encoded, expiryRaw, signature] = parts;

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return null;
  }
  if (!signatureMatches(VERIFY_BINDING_DOMAIN, `${encoded}.${expiryRaw}`, signature)) {
    return null;
  }

  try {
    const email = Buffer.from(encoded, "base64url").toString("utf8");
    return email.length > 0 ? normalizeEmail(email) : null;
  } catch {
    return null;
  }
}

/**
 * Drop the binding. Called once the customer is back in the flow — the leg it
 * describes is over, and leaving it set would narrow an unrelated sign-in.
 *
 * `maxAge: 0` rather than a `delete`, so the one jar interface serves a Server
 * Action and a Route Handler alike.
 */
export function clearVerifyBinding(jar: BookingCookieJar): void {
  jar.set(VERIFY_BINDING_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

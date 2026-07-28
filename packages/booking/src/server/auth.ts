import "server-only";

import {
  BOOKING_SESSION_COOKIE,
  readBookingSessionValue,
  type BookingCookieJar,
} from "./booking-session";

/**
 * Identity seam for the booking flow.
 *
 * The paying user's id comes from the signed, HttpOnly booking cookie issued
 * server-side by `createAccountCore` (and re-issued by the email-confirmation
 * route) — never from the request body. There is deliberately no fallback to a
 * form field: a fallback is the vulnerability, since an attacker controls
 * whether the cookie is present.
 *
 * Returns null when the cookie is missing, forged, or expired; every caller must
 * treat that as "not authorized" and write nothing.
 *
 * TODO(clerk): when Clerk owns identity, replace the body with the session read
 * (`const { userId } = await auth()`) and drop the cookie.
 */
export function resolveBookingUserId(jar: BookingCookieJar): string | null {
  return readBookingSessionValue(jar.get(BOOKING_SESSION_COOKIE)?.value);
}

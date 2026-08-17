"use server";

import { cookies, headers } from "next/headers";
import {
  completeProfileCore,
  createAccountCore,
  getClientIp,
  hashIp,
  readConsentStamp,
  recordConsentCore,
  resendBookingConfirmation,
  resolveBookingResumeState,
  resolveBookingUserId,
  type BookingResumeState,
} from "@pbh/booking/server";
import {
  CONSENT_STAMP_ERROR,
  CONSENT_STAMP_FIELD,
  type ConsentState,
  type DetailsState,
  type SignupState,
} from "@pbh/booking";

/**
 * Real per-step server actions for the marketing booking modal (pbh-ggr.5),
 * replacing the `.3` stubs. Each is a thin `"use server"` wrapper over the shared
 * `@pbh/booking/server` cores, reading request metadata and the current user
 * (identity seam) here and delegating the DB writes to the package.
 *
 * Every mutation below resolves the user from the signed HttpOnly booking cookie
 * — never from the submitted form — and refuses to write when it is missing,
 * forged, or expired (pbh-9yb.2).
 */

/**
 * Shown when the booking cookie can't be verified. Vague on purpose: it must not
 * distinguish "you never signed up" from "your session ran out", and the honest
 * remedy is the same either way.
 */
const NO_BOOKING_SESSION =
  "We couldn't find your booking. Please start again from the top.";

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  return createAccountCore(formData, {
    source: "marketing-booking",
    cookies: await cookies(),
  });
}

export async function detailsAction(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  const userId = resolveBookingUserId(await cookies());
  if (!userId) {
    return {
      status: "error",
      message: NO_BOOKING_SESSION,
      values: {
        patientFirstName: String(formData.get("patientFirstName") ?? ""),
        patientLastName: String(formData.get("patientLastName") ?? ""),
        dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
        zip: String(formData.get("zip") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        gender: String(formData.get("gender") ?? ""),
        educationLevel: String(formData.get("educationLevel") ?? ""),
      },
    };
  }
  return completeProfileCore(userId, formData);
}

export async function consentAction(
  _prev: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const userId = resolveBookingUserId(await cookies());
  if (!userId) {
    return { status: "error", message: NO_BOOKING_SESSION };
  }

  // Which agreement was on screen, as this server said when it rendered the
  // step — not as the browser claims, and not as a fresh CMS read guesses. The
  // stamp is signed, so a value the browser edited fails to verify; a value we
  // can't verify means we don't know what was read, and a row we can't correct
  // later is no place to guess.
  const stamp = readConsentStamp(formData.get(CONSENT_STAMP_FIELD));
  if (!stamp) {
    return { status: "error", message: CONSENT_STAMP_ERROR };
  }

  const requestHeaders = await headers();
  return recordConsentCore({
    userId,
    agreed: formData.get("agreed") === "on",
    ipHash: hashIp(getClientIp(requestHeaders)),
    userAgent: requestHeaders.get("user-agent"),
    version: stamp.version,
  });
}

/**
 * Read the signed booking cookie and work out where this booking left off.
 *
 * Called from the client on mount rather than resolved in the page, so the
 * marketing home page stays statically rendered — only a customer actually
 * returning from a confirmation link pays for the round-trip.
 *
 * Returns null for a missing, forged, or expired cookie, and for a user that no
 * longer exists. The step is computed from persisted state, never from anything
 * the client sends.
 */
export async function getBookingResumeState(): Promise<BookingResumeState | null> {
  const userId = resolveBookingUserId(await cookies());
  if (!userId) {
    return null;
  }
  return resolveBookingResumeState(userId);
}

/**
 * Re-send the confirmation email for the browser holding a booking cookie.
 *
 * Takes no argument: the recipient is whoever the cookie says, so this can't be
 * pointed at another customer's inbox. Throttled inside
 * `resendBookingConfirmation`.
 */
export async function resendConfirmationAction(): Promise<{ ok: true }> {
  const userId = resolveBookingUserId(await cookies());
  if (!userId) {
    return { ok: true };
  }
  return resendBookingConfirmation(userId);
}

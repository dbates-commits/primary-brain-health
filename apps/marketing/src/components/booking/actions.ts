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
  type BookingResumeState,
} from "@pbh/booking/server";
import {
  CONSENT_STAMP_ERROR,
  CONSENT_STAMP_FIELD,
  type ConsentState,
  type DetailsInitialValues,
  type DetailsState,
  type SignupState,
} from "@pbh/booking";
import { resolveActorId } from "@/lib/booking-actor";
import { getProfileValues } from "@/lib/profile";

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
  const userId = await resolveActorId();
  if (!userId) {
    return {
      status: "error",
      message: NO_BOOKING_SESSION,
      values: {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
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
  const userId = await resolveActorId();
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
 * Returns null for a missing, forged, or expired cookie with no session behind
 * it, and for a user that no longer exists. The step is computed from persisted
 * state, never from anything the client sends.
 *
 * Identity comes from `resolveActorId`, so a customer who signed back in after
 * their booking cookie aged out is recognised here too.
 */
export async function getBookingResumeState(): Promise<BookingResumeState | null> {
  const userId = await resolveActorId();
  if (!userId) {
    return null;
  }
  return resolveBookingResumeState(userId);
}

/**
 * What the details step already holds, for someone re-entering it to correct
 * something.
 *
 * Read lazily, only when a customer actually goes back — not folded into
 * `getBookingResumeState`, which runs on every return from a confirmation link
 * and would then be pushing seven PII columns into the payload for the majority
 * who never re-enter this step. That function answers "how far did this booking
 * get"; this one answers "what is in the row", and they are different questions.
 *
 * `email` is dropped: the step neither shows nor writes it, so it has no reason
 * to travel.
 */
export async function getBookingDetailsValues(): Promise<DetailsInitialValues | null> {
  const userId = await resolveActorId();
  if (!userId) {
    return null;
  }
  const values = await getProfileValues(userId);
  if (!values) {
    return null;
  }
  return {
    dateOfBirth: values.dateOfBirth,
    zip: values.zip,
    phone: values.phone,
    gender: values.gender,
    educationLevel: values.educationLevel,
  };
}

/**
 * Re-send the confirmation email to whoever is acting.
 *
 * Takes no argument: the recipient comes from the cookie or the session, so this
 * can't be pointed at another customer's inbox. Throttled inside
 * `resendBookingConfirmation`.
 */
export async function resendConfirmationAction(): Promise<{ ok: true }> {
  const userId = await resolveActorId();
  if (!userId) {
    return { ok: true };
  }
  return resendBookingConfirmation(userId);
}

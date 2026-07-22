"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import {
  BOOKING_RESUME_COOKIE,
  completeProfileCore,
  createAccountCore,
  getClientIp,
  hashIp,
  readResumeCookieValue,
  recordConsentCore,
  resendBookingConfirmation,
  resolveBookingResumeState,
  resolveBookingUserId,
  type BookingResumeState,
} from "@pbh/booking/server";
import type { ConsentState, DetailsState, SignupState } from "@pbh/booking";

/**
 * Real per-step server actions for the marketing booking modal (pbh-ggr.5),
 * replacing the `.3` stubs. Each is a thin `"use server"` wrapper over the shared
 * `@pbh/booking/server` cores, reading request metadata and the current user
 * (identity seam) here and delegating the DB writes to the package.
 */

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  return createAccountCore(formData, { source: "marketing-booking" });
}

export async function detailsAction(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  return completeProfileCore(resolveBookingUserId(formData), formData);
}

export async function consentAction(
  _prev: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const requestHeaders = await headers();
  return recordConsentCore({
    userId: resolveBookingUserId(formData),
    agreed: formData.get("agreed") === "on",
    ipHash: hashIp(getClientIp(requestHeaders)),
    userAgent: requestHeaders.get("user-agent"),
  });
}

/**
 * Read the signed resume cookie and work out where this booking left off.
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
  const jar = await cookies();
  const userId = readResumeCookieValue(jar.get(BOOKING_RESUME_COOKIE)?.value);
  if (!userId) {
    return null;
  }
  return resolveBookingResumeState(userId);
}

/**
 * Re-send the confirmation email for the browser holding a resume cookie, or —
 * before confirmation, when no cookie exists yet — for the account just created
 * in this session. Throttled inside `resendBookingConfirmation`.
 */
export async function resendConfirmationAction(
  userId: string,
): Promise<{ ok: true }> {
  const id = userId.trim();
  if (!id) {
    return { ok: true };
  }
  return resendBookingConfirmation(id);
}

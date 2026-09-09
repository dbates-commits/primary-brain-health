"use server";

import { cookies, headers } from "next/headers";
import {
  completeProfileCore,
  createAccountCore,
  getClientIp,
  hashIp,
  readConsentStamp,
  recordConsentCore,
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
import { signIn } from "@/auth";
import { AUTH0_ENABLED } from "@/lib/auth0-enabled";
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


/**
 * Create the partial account, then hand the customer to Auth0 to prove the
 * address they just typed.
 *
 * Auth0 emails them a code; entering it stamps `users.emailVerified` (see the
 * `signIn` event in `auth.ts`) and, just as importantly, leaves them holding an
 * **Auth0 session** as well as a PBH one. That is what makes the Engagement App
 * link on `/welcome` a plain link later instead of a second login — the whole
 * reason the flow goes through Auth0 at this point rather than at checkout.
 *
 * It replaces the one-time confirmation link we used to email. Both prove the
 * same thing; only one of them also produces the Auth0 session.
 *
 * `signIn` redirects by throwing, so nothing after it runs on the happy path.
 * `login_hint` pre-fills the address on Auth0's screen, so the customer doesn't
 * type it twice.
 */
export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const result = await createAccountCore(formData, {
    source: "marketing-booking",
    cookies: await cookies(),
  });

  if (result.status !== "success") {
    return result;
  }

  // Signup now depends on Auth0 being configured — it is the only thing that
  // can verify the address. Failing loudly here beats stranding a customer on a
  // step with no way forward, which is what silently skipping it would do.
  if (!AUTH0_ENABLED) {
    console.error("[booking] signup reached with AUTH0_* unset — cannot verify");
    return {
      status: "error",
      message: "Sign-up is unavailable right now. Please try again shortly.",
      values: {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      },
    };
  }

  await signIn(
    "auth0",
    // Back to the home page with the marker the booking modal reopens on; the
    // resume state machine reads `emailVerified` and lands them on Details.
    { redirectTo: "/?booking=resume#booking" },
    { login_hint: result.email },
  );

  return result;
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
 * Put a customer whose address is still unproven back through Auth0.
 *
 * The counterpart to the redirect at the end of `signupAction`, for the person
 * who abandoned at the Auth0 screen and came back on their booking cookie. The
 * recipient comes from that cookie, never from the client, so this cannot be
 * aimed at another customer's inbox.
 *
 * Returns nothing: on success `signIn` redirects by throwing.
 */
export async function verifyEmailAction(): Promise<void> {
  const userId = await resolveActorId();
  if (!userId || !AUTH0_ENABLED) {
    return;
  }
  const profile = await getProfileValues(userId);
  await signIn(
    "auth0",
    { redirectTo: "/?booking=resume#booking" },
    profile?.email ? { login_hint: profile.email } : undefined,
  );
}

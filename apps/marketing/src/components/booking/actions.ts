"use server";

import { cookies, headers } from "next/headers";
import {
  completeProfileCore,
  createAccountCore,
  getClientIp,
  hashIp,
  issueVerifyBinding,
  clearVerifyBinding,
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

/** What `verifyEmailAction` reports when it cannot send the customer to Auth0. */
export type VerifyEmailState = { status: "error"; message: string };


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
  // Before the insert, not after it. Signup depends on Auth0 being configured —
  // it is the only thing that can verify the address — and a row written here
  // with nowhere to go is worse than a refusal: the modal never opens (the form
  // advances on `success` alone), and the address is now taken, so every retry
  // fails on the unique constraint and sends them to a sign-in that is equally
  // unavailable. Refusing first leaves them able to try again.
  if (!AUTH0_ENABLED) {
    console.error("[booking] signup reached with AUTH0_* unset — cannot verify");
    return {
      status: "error",
      message: "Sign-up is unavailable right now. Please try again shortly.",
      values: {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
    };
  }

  const result = await createAccountCore(formData, {
    source: "marketing-booking",
    cookies: await cookies(),
  });

  if (result.status !== "success") {
    return result;
  }

  // Say which address this trip is for. `login_hint` below only pre-fills the
  // field; this is what the `signIn` callback checks, so verifying a different
  // address at Auth0 is refused instead of quietly stranding the booking.
  issueVerifyBinding(await cookies(), result.email);

  await signIn(
    "auth0",
    // Back to the home page with the marker the booking modal reopens on; the
    // resume state machine reads `emailVerified` and lands them on Details.
    { redirectTo: "/?booking=resume#booking" },
    {
      login_hint: result.email,
      // **Force re-authentication. This is not a nicety.**
      //
      // Auth0 keeps an SSO cookie on its own domain, and signing out of PBH
      // does not clear it (see `auth0LogoutUrl`). Without `prompt=login`, a
      // brand-new customer signing up on a browser where somebody else used
      // Auth0 would be silently authenticated as *that* person: the booking
      // cookie would point at the row we just inserted while the Auth.js
      // session belonged to someone else, so `markEmailVerified` would stamp
      // the wrong user, mail them a second welcome, and leave the new customer
      // stuck on the confirm step with no way forward.
      //
      // The address is already in `login_hint`, so the cost is one screen the
      // customer was going to see anyway.
      prompt: "login",
    },
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
 * coming back into the flow pays for the round-trip.
 *
 * That makes it the end of the Auth0 leg, so it is also where the verification
 * binding is dropped: the redirect it described is over, and a binding left set
 * would narrow the next, unrelated sign-in from this browser.
 *
 * Returns null for a missing, forged, or expired cookie with no session behind
 * it, and for a user that no longer exists. The step is computed from persisted
 * state, never from anything the client sends.
 *
 * Identity comes from `resolveActorId`, so a customer who signed back in after
 * their booking cookie aged out is recognised here too.
 */
export async function getBookingResumeState(): Promise<BookingResumeState | null> {
  clearVerifyBinding(await cookies());
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
 * On success `signIn` redirects by throwing, so nothing is returned. Both
 * refusals return a message instead of resolving silently: this button is the
 * only control on the step, and a booking cookie that aged out while the modal
 * sat open otherwise looks exactly like a button that does nothing.
 */
export async function verifyEmailAction(): Promise<VerifyEmailState> {
  const userId = await resolveActorId();
  if (!userId) {
    return { status: "error", message: NO_BOOKING_SESSION };
  }
  if (!AUTH0_ENABLED) {
    console.error("[booking] verify reached with AUTH0_* unset — cannot verify");
    return {
      status: "error",
      message: "Email confirmation is unavailable right now. Please try again shortly.",
    };
  }
  const profile = await getProfileValues(userId);
  if (profile?.email) {
    // Same binding as `signupAction`; see there.
    issueVerifyBinding(await cookies(), profile.email);
  }
  await signIn(
    "auth0",
    { redirectTo: "/?booking=resume#booking" },
    {
      ...(profile?.email ? { login_hint: profile.email } : {}),
      // Same reason as `signupAction`: this booking belongs to whoever holds
      // the cookie, and a stale Auth0 session would verify a different person's
      // address against it.
      prompt: "login",
    },
  );

  // Unreachable: `signIn` redirects by throwing. Here for the return type.
  return { status: "error", message: NO_BOOKING_SESSION };
}

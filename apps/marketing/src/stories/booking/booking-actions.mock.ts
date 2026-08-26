/**
 * Storybook stand-in for `src/components/booking/actions.ts`.
 *
 * That module is `"use server"` and pulls in `next/headers` plus
 * `@pbh/booking/server` (database, Stripe, Resend), so no story can import it.
 * `EmailConfirmationStep.stories.tsx` injects `resendConfirmationAction` from
 * here as a prop; `.storybook/main.ts` also aliases the real module to this
 * file, which catches anything that reaches it transitively — a story rendering
 * the whole `BookingStepFlow`, say. Storybook builds only; the app is
 * untouched.
 *
 * Keep the exported names in step with the real module. A drifted name fails
 * loudly at import rather than silently rendering the wrong thing.
 */

import type { ConsentState, DetailsState, SignupState } from "@pbh/booking";

/** Matches the real action's shape. Resolves after a beat so `pending` shows. */
export async function resendConfirmationAction(): Promise<{ ok: true }> {
  await new Promise((resolve) => {
    setTimeout(resolve, 600);
  });
  return { ok: true };
}

// The remaining exports exist so anything else reaching for this module in a
// story gets a working import rather than an undefined binding. The step forms
// take their action as a prop, so nothing should need these.

export async function signupAction(): Promise<SignupState> {
  return { status: "idle" };
}

export async function detailsAction(): Promise<DetailsState> {
  return { status: "idle" };
}

export async function consentAction(): Promise<ConsentState> {
  return { status: "idle" };
}

export async function getBookingResumeState(): Promise<null> {
  return null;
}

export async function getBookingDetailsValues(): Promise<null> {
  return null;
}

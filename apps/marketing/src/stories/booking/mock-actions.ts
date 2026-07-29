/**
 * Stand-in server actions for the booking step stories.
 *
 * Every step form takes its `"use server"` action as a prop (see
 * `packages/booking/src/index.ts`), which is the seam that lets these stories
 * render the real components without pulling `next/headers`, the database or
 * Stripe into the Vite bundle. Each factory returns an action matching the
 * contract in `packages/booking/src/types.ts`.
 *
 * The delay is deliberate and finite: `useActionState` only reports `pending`
 * while the promise is unsettled, so a story that wants to show the disabled
 * fieldset needs a round-trip to observe — and the Vitest browser run needs it
 * to end.
 */

import type {
  ConsentAction,
  CreateCheckoutAction,
  DetailsAction,
  DetailsValues,
  PaymentFinalizeAction,
  SignupAction,
  SignupValues,
} from "@pbh/booking";

/** Long enough to see the pending state, short enough not to stall the test run. */
export const ACTION_DELAY_MS = 600;

/** Used by the "Submitting" stories, which park the form in its pending state. */
export const SLOW_ACTION_DELAY_MS = 4000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value;
}

function signupValues(formData: FormData): SignupValues {
  return {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    email: text(formData, "email"),
    patientIdentification: text(formData, "patientIdentification"),
  };
}

function detailsValues(formData: FormData): DetailsValues {
  return {
    patientFirstName: text(formData, "patientFirstName"),
    patientLastName: text(formData, "patientLastName"),
    dateOfBirth: text(formData, "dateOfBirth"),
    zip: text(formData, "zip"),
    stateOfResidence: text(formData, "stateOfResidence"),
    phone: text(formData, "phone"),
    gender: text(formData, "gender"),
    educationLevel: text(formData, "educationLevel"),
  };
}

/** Signup succeeds, echoing back whatever was typed. */
export function signupSucceeds(delayMs = ACTION_DELAY_MS): SignupAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    const values = signupValues(formData);
    return { status: "success", ...values };
  };
}

/** Signup comes back with per-field messages; the typed values are preserved. */
export function signupFieldErrors(
  fieldErrors: Record<string, string>,
  delayMs = ACTION_DELAY_MS,
): SignupAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
      values: signupValues(formData),
    };
  };
}

/** Signup fails with no field to blame — renders the form-level alert instead. */
export function signupFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): SignupAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return { status: "error", message, values: signupValues(formData) };
  };
}

export function detailsSucceeds(delayMs = ACTION_DELAY_MS): DetailsAction {
  return async () => {
    await delay(delayMs);
    return { status: "success" };
  };
}

export function detailsFieldErrors(
  fieldErrors: Record<string, string>,
  delayMs = ACTION_DELAY_MS,
): DetailsAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
      values: detailsValues(formData),
    };
  };
}

export function detailsFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): DetailsAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return { status: "error", message, values: detailsValues(formData) };
  };
}

export function consentSucceeds(delayMs = ACTION_DELAY_MS): ConsentAction {
  return async () => {
    await delay(delayMs);
    return { status: "success" };
  };
}

/**
 * The server rejecting consent. `ConsentForm` also guards on the client, so this
 * only fires when the box was ticked and the write still failed.
 */
export function consentFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): ConsentAction {
  return async () => {
    await delay(delayMs);
    return { status: "error", message };
  };
}

/** A Checkout Session that never mints — drives the payment step's init error. */
export function checkoutFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): CreateCheckoutAction {
  return async () => {
    await delay(delayMs);
    return { status: "error", message };
  };
}

/**
 * A session that never settles, holding the payment step on "Loading payment…".
 *
 * Withholding the session is what keeps the step still enough to look at. The
 * alternative — returning a fake `clientSecret` — is worse: with a publishable
 * key present (and there is one whenever `.env.local` is loaded) Stripe mounts
 * `EmbeddedCheckout` and then fails on the bogus secret. Only a server with the
 * secret key can mint a session Checkout will accept, so the loading state is
 * as far as a story can go.
 */
export function checkoutPending(): CreateCheckoutAction {
  return () => new Promise(() => {});
}

export const finalizeSucceeds: PaymentFinalizeAction = async () => {
  await delay(ACTION_DELAY_MS);
  return { status: "success" };
};

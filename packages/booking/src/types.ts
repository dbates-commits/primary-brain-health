/**
 * Shared contracts for the booking/assessment step forms. The `*State` shapes
 * are the useActionState state each step form renders; the `*Action` types are
 * the injected per-step server action each app supplies (the funnel passes its
 * real `"use server"` action; marketing passes a stub in `.3` and the real
 * re-homed action in `.5`). Keeping the types here lets the components and every
 * app's action agree on one contract.
 */

export type SignupValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export type SignupState =
  | { status: "idle" }
  | {
      status: "success";
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: SignupValues;
    };

/** Success payload handed to `SignupForm`'s `onComplete`. */
export type SignupResult = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type SignupAction = (
  prev: SignupState,
  formData: FormData,
) => Promise<SignupState>;

export type DetailsValues = {
  dateOfBirth: string;
  zip: string;
  stateOfResidence: string;
  phone: string;
  gender: string;
  educationLevel: string;
  patientIdentification: string;
  message: string;
};

export type DetailsState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: DetailsValues;
    };

export type DetailsAction = (
  prev: DetailsState,
  formData: FormData,
) => Promise<DetailsState>;

/**
 * Shown when the agreement box isn't ticked. The submit button stays enabled, so
 * the form surfaces this on click; the server re-checks and returns the same
 * message, so both paths read identically. Defined here because the client guard
 * and the server core both need it.
 */
export const CONSENT_REQUIRED_ERROR =
  "You must agree to the terms to continue.";

export type ConsentState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type ConsentAction = (
  prev: ConsentState,
  formData: FormData,
) => Promise<ConsentState>;

/**
 * Payment-step contracts. The step component is presentation only (mounts Stripe
 * Embedded Checkout); each app injects a `createSession` action that mints a
 * Checkout Session and a `finalize` action that verifies + records the payment
 * and enrolls the user. Kept here so the component and both apps' actions agree.
 */
export type CreateCheckoutResult =
  | { status: "ready"; clientSecret: string; sessionId: string }
  | { status: "error"; message: string };

export type CreateCheckoutAction = (
  userId: string,
) => Promise<CreateCheckoutResult>;

/** Minimal shape the payment step reads from an app's finalize action. */
export type PaymentFinalizeResult =
  | { status: "error"; message: string }
  | { status: "idle" | "success" };

export type PaymentFinalizeAction = (
  userId: string,
  sessionId: string,
) => Promise<PaymentFinalizeResult>;

/**
 * Shared contracts for the booking/assessment step forms. The `*State` shapes
 * are the useActionState state each step form renders; the `*Action` types are
 * the injected per-step server action the host supplies (the booking modal
 * passes its real `"use server"` action; Storybook passes a stub). Keeping the
 * types here lets the components and the actions agree on one contract.
 */

export type SignupValues = {
  firstName: string;
  lastName: string;
  email: string;
};

/**
 * No `userId` in any of these shapes, on purpose: identity lives in the signed
 * HttpOnly booking cookie the server issues at signup (see `booking-session.ts`
 * and `resolveBookingUserId`). Handing the id to the client is what let a caller
 * post back someone else's.
 */
export type SignupState =
  | { status: "idle" }
  | {
      status: "success";
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

/**
 * Success payload handed to `SignupForm`'s `onComplete`. The names prefill the
 * details step, which asks for the person being assessed — usually the buyer,
 * so we fill them in rather than asking twice.
 */
export type SignupResult = {
  email: string;
  firstName: string;
  lastName: string;
};

export type SignupAction = (
  prev: SignupState,
  formData: FormData,
) => Promise<SignupState>;

export type DetailsValues = {
  /**
   * The account holder, who is the person assessed. Prefilled from signup and
   * editable here because a name typed into a checkout box is worth a second
   * look — not because it may be somebody else's.
   */
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  zip: string;
  phone: string;
  gender: string;
  educationLevel: string;
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

/**
 * The form field carrying the signed record of which terms were rendered — see
 * `createConsentStamp` in `@pbh/booking/server`. Declared here rather than
 * beside the signing, because the client binds it onto the submission and can't
 * import a `server-only` module.
 */
export const CONSENT_STAMP_FIELD = "consentStamp";

/**
 * Shown when the stamp is missing or doesn't verify, which means the server
 * cannot say which agreement was on screen. Refusing is the only honest answer:
 * a consent row is append-only, so guessing a version here would be permanent.
 */
export const CONSENT_STAMP_ERROR =
  "Please reload the page and review the terms again before continuing.";

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
 * and signs the customer in. Kept here so the component and the app's actions
 * agree.
 */
export type CreateCheckoutResult =
  | { status: "ready"; clientSecret: string; sessionId: string }
  | { status: "error"; message: string };

export type CreateCheckoutAction = () => Promise<CreateCheckoutResult>;

/** Minimal shape the payment step reads from an app's finalize action. */
export type PaymentFinalizeResult =
  | { status: "error"; message: string }
  | { status: "idle" | "success" };

export type PaymentFinalizeAction = (
  sessionId: string,
) => Promise<PaymentFinalizeResult>;

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

"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@pbh/ui";
import { createAccount, type SignupState } from "./actions";
import { fieldClass, FieldError, labelClass } from "./form-styles";

const initialState: SignupState = { status: "idle" };

export type SignupResult = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function SignupForm({
  onComplete,
}: {
  onComplete: (result: SignupResult) => void;
}) {
  const [state, action, pending] = useActionState(createAccount, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  // Advance the flow once the account exists. Guard against re-firing if this
  // component re-renders while still on the success state.
  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete({
        userId: state.userId,
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
      });
    }
  }, [state, onComplete]);

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            defaultValue={values?.firstName ?? ""}
            className={fieldClass}
          />
          <FieldError message={fieldErrors?.firstName} />
        </div>

        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            defaultValue={values?.lastName ?? ""}
            className={fieldClass}
          />
          <FieldError message={fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values?.email ?? ""}
          className={fieldClass}
        />
        <FieldError message={fieldErrors?.email} />
      </div>

      {state.status === "error" && !fieldErrors && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <Button type="submit" color="primary" className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

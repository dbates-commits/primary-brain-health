"use client";

import { useActionState, useState } from "react";
import { Button } from "@pbh/ui";
import { createAccount, type SignupState } from "./actions";
import { US_STATES } from "./us-states";

const initialState: SignupState = { status: "idle" };

const fieldClass =
  "mt-1 w-full rounded-lg border border-outline/40 bg-surface px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "block text-sm font-medium text-on-surface";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="mt-1 text-sm text-error">{message}</p>;
}

export function SignupForm() {
  const [state, action, pending] = useActionState(createAccount, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;
  // Controlled so it survives React's post-action form.reset() — an uncontrolled
  // <select> only honors defaultValue on mount, so it would snap back otherwise.
  const [stateOfResidence, setStateOfResidence] = useState("");

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-secondary/30 bg-secondary/5 p-6">
        <p className="font-headline text-lg text-primary">
          Account created 🎉
        </p>
        <p className="mt-2 text-on-surface-variant">
          Welcome aboard — we&apos;ve created your account for{" "}
          <strong>{state.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="legalName" className={labelClass}>
          Full legal name
        </label>
        <input
          id="legalName"
          name="legalName"
          type="text"
          autoComplete="name"
          required
          defaultValue={values?.legalName ?? ""}
          className={fieldClass}
        />
        <FieldError message={fieldErrors?.legalName} />
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

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={fieldClass}
        />
        <FieldError message={fieldErrors?.password} />
      </div>

      <div>
        <label htmlFor="dateOfBirth" className={labelClass}>
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          required
          defaultValue={values?.dateOfBirth ?? ""}
          className={fieldClass}
        />
        <FieldError message={fieldErrors?.dateOfBirth} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="zip" className={labelClass}>
            ZIP code
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            required
            defaultValue={values?.zip ?? ""}
            className={fieldClass}
          />
          <FieldError message={fieldErrors?.zip} />
        </div>

        <div>
          <label htmlFor="stateOfResidence" className={labelClass}>
            State of residence
          </label>
          <select
            id="stateOfResidence"
            name="stateOfResidence"
            required
            value={stateOfResidence}
            onChange={(e) => setStateOfResidence(e.target.value)}
            className={fieldClass}
          >
            <option value="" disabled>
              Select a state
            </option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors?.stateOfResidence} />
        </div>
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

"use client";

import { useActionState } from "react";
import { Button } from "@pbh/ui";
import { createAccount, type SignupState } from "./actions";

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

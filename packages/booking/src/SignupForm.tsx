"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, FieldError, Label, StepHeader, fieldClass } from "@pbh/ui";
import type { SignupAction, SignupResult, SignupState } from "./types";

const initialState: SignupState = { status: "idle" };

/**
 * First/last/email account form. The per-step action is injected via `action`,
 * so the same component serves the funnel (its `createAccount`) and the marketing
 * modal. `showHeader`/`title`/`subtitle`/`submitLabel` let the marketing landing
 * render it inline under the section heading with its own CTA copy.
 */
export function SignupForm({
  action,
  onComplete,
  showHeader = true,
  title = "Get started",
  subtitle = "Create your account to begin.",
  submitLabel = "Create account",
}: {
  action: SignupAction;
  onComplete: (result: SignupResult) => void;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
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
    <div className="flex flex-col gap-8">
      {showHeader ? <StepHeader title={title} subtitle={subtitle} /> : null}

      <form action={formAction} noValidate>
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.firstName ? true : undefined}
                aria-describedby={
                  fieldErrors?.firstName ? "firstName-error" : undefined
                }
                defaultValue={values?.firstName ?? ""}
                className={fieldClass}
              />
              <FieldError id="firstName-error" message={fieldErrors?.firstName} />
            </div>

            <div>
              <Label htmlFor="lastName">Last name</Label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.lastName ? true : undefined}
                aria-describedby={
                  fieldErrors?.lastName ? "lastName-error" : undefined
                }
                defaultValue={values?.lastName ?? ""}
                className={fieldClass}
              />
              <FieldError id="lastName-error" message={fieldErrors?.lastName} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={fieldErrors?.email ? true : undefined}
              aria-describedby={fieldErrors?.email ? "email-error" : undefined}
              defaultValue={values?.email ?? ""}
              className={fieldClass}
            />
            <FieldError id="email-error" message={fieldErrors?.email} />
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <Button type="submit" color="primary" className="h-14 w-full text-base">
            {pending ? "Creating account…" : submitLabel}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

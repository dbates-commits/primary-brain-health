"use client";

import { useActionState } from "react";
import { Button, Heading } from "@pbh/ui";
import { Label } from "@/components/Label";
import { fieldClass } from "@/components/form-constants";
import { registerAndEnroll } from "./actions";
import { AssessmentsView } from "./AssessmentsView";
import type { LinusState } from "./register-and-enroll";

const initialState: LinusState = { status: "idle" };

export function LinusEnrollForm() {
  const [state, action, pending] = useActionState(
    registerAndEnroll,
    initialState,
  );
  const errorMessage = state.status === "error" ? state.message : undefined;
  const lastEmail = state.status === "idle" ? "" : state.email;

  // On success, replace the lookup form entirely with the assessments view.
  if (state.status === "success") {
    return (
      <AssessmentsView
        firstName={state.firstName}
        enrollments={state.enrollments}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading as="h1" size="lg" className="mb-2">
          Enroll a subject
        </Heading>
        <p className="text-on-surface-variant">
          Enter a registered user’s email to generate their assessment
          enrollment links.
        </p>
      </div>

      <form action={action} noValidate>
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-4 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          <div>
            <Label htmlFor="email">User email</Label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? "email-error" : undefined}
              defaultValue={lastEmail}
              className={fieldClass}
            />
          </div>

          {errorMessage && (
            <p
              id="email-error"
              role="alert"
              className="animate-error-in text-sm text-error"
            >
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            color="primary"
            className="h-14 w-full text-base"
          >
            {pending ? "Registering…" : "Register & enroll"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

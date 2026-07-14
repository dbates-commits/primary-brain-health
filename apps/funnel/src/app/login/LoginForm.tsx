"use client";

import { useActionState } from "react";
import { Button, Heading, Label, fieldClass } from "@pbh/ui";
import { registerAndEnroll } from "@/app/assessments/actions";
import type { LinusState } from "@pbh/booking/server";

const initialState: LinusState = { status: "idle" };

/**
 * Temporary email sign-in: look up a registered user by email, drop the
 * assessment session cookie, and forward to /assessments. This is a placeholder
 * for proper auth — Clerk will own this flow in the future.
 *
 * `initialEmail` prefills the field — the marketing booking flow hands paid users
 * here with `?email=…` after they've already paid + enrolled, so they only need
 * to confirm to land on /assessments.
 */
export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [state, action, pending] = useActionState(
    registerAndEnroll,
    initialState,
  );
  const errorMessage = state.status === "error" ? state.message : undefined;
  const lastEmail = state.status === "idle" ? initialEmail : state.email;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading as="h1" size="lg" className="mb-2">
          Sign in
        </Heading>
        <p className="text-on-surface-variant">
          Enter your email to access your assessments.
        </p>
      </div>

      <form action={action} noValidate>
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-4 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          <div>
            <Label htmlFor="email">Email</Label>
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
            {pending ? "Signing in…" : "Continue"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

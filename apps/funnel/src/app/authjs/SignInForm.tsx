"use client";

import { useActionState } from "react";
import { Button, Heading } from "@pbh/ui";
import { Label } from "@/components/Label";
import { fieldClass } from "@/components/form-constants";
import { signInWithCredentials, type AuthjsState } from "./actions";

const initialState: AuthjsState = { status: "idle" };

/**
 * Auth.js demo sign-in (email + password). On success the action establishes
 * the Auth.js session, drops the shared assessment cookie, and redirects to
 * /assessments. For an existing funnel account with no password yet, the first
 * sign-in sets the password (see the provider's authorize callback).
 */
export function SignInForm() {
  const [state, action, pending] = useActionState(
    signInWithCredentials,
    initialState,
  );
  const errorMessage = state.status === "error" ? state.message : undefined;
  const lastEmail = state.status === "error" ? state.email : "";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading as="h1" size="lg" className="mb-2">
          Sign in with Auth.js
        </Heading>
        <p className="text-on-surface-variant">
          Email + password, verified by next-auth. A new email creates the
          password on first sign-in.
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
              defaultValue={lastEmail}
              className={fieldClass}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? "authjs-error" : undefined}
              className={fieldClass}
            />
          </div>

          {errorMessage && (
            <p
              id="authjs-error"
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

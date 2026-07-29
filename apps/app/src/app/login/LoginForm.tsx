"use client";

import { useActionState } from "react";
import { Button, Heading, Label, fieldClass } from "@pbh/ui";
import { requestMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

/**
 * Passwordless sign-in: enter your email, we send a one-time magic link. No
 * password, no account created here — the link authenticates an existing
 * account (created in the booking flow). On submit we forward to
 * /login/check-email whether or not the address is registered.
 *
 * `initialEmail` prefills the field — the marketing booking flow hands paid users
 * here with `?email=…` after they've already paid + enrolled, so they only need
 * to confirm to get their sign-in link.
 */
export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [state, action, pending] = useActionState(
    requestMagicLink,
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
          Enter your email and we&rsquo;ll send you a secure sign-in link.
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
            {pending ? "Sending link…" : "Email me a sign-in link"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { Button, Card } from "@pbh/ui";
import { Label } from "@/components/Label";
import { fieldClass } from "@/components/form-constants";
import { registerAndEnroll, type LinusState } from "./actions";

const initialState: LinusState = { status: "idle" };

export function LinusEnrollForm() {
  const [state, action, pending] = useActionState(
    registerAndEnroll,
    initialState,
  );
  const errorMessage = state.status === "error" ? state.message : undefined;
  const lastEmail = state.status === "idle" ? "" : state.email;

  return (
    <div className="flex flex-col gap-8">
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

      {state.status === "success" && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant">
              Linus participant ID
            </p>
            <p className="font-mono text-sm break-all text-on-surface">
              {state.participantId}
            </p>
          </div>

          {state.enrollments.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {state.enrollments.map((enrollment) => (
                <li key={enrollment.campaignId}>
                  <Card variant="bordered">
                    <p className="text-lg font-semibold text-on-surface">
                      {enrollment.name}
                    </p>
                    <p className="font-mono text-xs break-all text-gray-500">
                      {enrollment.campaignId}
                    </p>
                    <a
                      href={enrollment.redirect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-primary underline"
                    >
                      Open assessment →
                    </a>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card variant="bordered">
              <p className="text-on-surface">
                The subject was registered, but no campaigns are configured. Set
                the <code>LINUS_CAMPAIGNS</code> environment variable to add them.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

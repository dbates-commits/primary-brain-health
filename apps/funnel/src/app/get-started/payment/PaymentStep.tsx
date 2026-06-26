"use client";

import { useActionState } from "react";
import { Button } from "@pbh/ui";
import { StepHeader } from "@/components/StepHeader";
import { completeAssessmentSetup } from "@/app/assessments/actions";
import type { LinusState } from "@/app/assessments/register-and-enroll";

const initialState: LinusState = { status: "idle" };

/**
 * TEMP placeholder payment step. The real Stripe Payment Element ($149,
 * HSA/FSA, SAQ-A) lands in pbh-bws.22. For now, "paying" submits to a server
 * action that registers the user with Linus and forwards to /assessments — the
 * user id goes in the POST body, never the URL.
 */
export function PaymentStep({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    completeAssessmentSetup,
    initialState,
  );

  return (
    <div className="flex flex-col gap-8">
      <StepHeader title="Payment" />

      <form action={action} className="space-y-5">
        <input type="hidden" name="userId" value={userId} />

        <div className="rounded-xl border border-outline/40 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface">Brain health assessment</span>
            <span className="font-headline text-lg text-primary">$149.00</span>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            Placeholder summary — the Stripe Payment Element (cards, Apple/Google
            Pay, HSA/FSA) lands in a later task.
          </p>
        </div>

        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          <Button
            type="submit"
            color="primary"
            className="h-14 w-full text-base"
          >
            {pending ? "Setting up your assessment…" : "Pay $149 (placeholder)"}
          </Button>
        </fieldset>

        {state.status === "error" && (
          <p role="alert" className="animate-error-in text-sm text-error">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}

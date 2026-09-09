"use client";

import { useTransition } from "react";
import { StickyActions } from "@pbh/booking";
import { Button } from "@pbh/ui";

/**
 * Header copy for this step, exported rather than inlined at the call site so
 * all four modal steps offer a code-owned fallback of the same shape — see
 * `resolveStepHeader`, which falls back to these whenever the Modals document
 * is empty. The siblings are `DETAILS_HEADER`, `consentHeader()` and
 * `PAYMENT_HEADER` in `@pbh/booking`.
 */
export const CONFIRM_HEADER = { title: "Email Confirmation" } as const;

/**
 * The "address not proven yet" step.
 *
 * Signup sends the customer straight to Auth0, which emails them a code — so on
 * the happy path this screen is never seen. It is what someone lands on if they
 * abandoned at the Auth0 screen and came back on the booking cookie: their
 * `users` row exists, `emailVerified` is still null, and
 * `resolveBookingResumeState` holds them here. The button puts them back where
 * they dropped out.
 *
 * It used to say "we've emailed you a link" and offer a re-send. There is no
 * link of ours any more — Auth0's code is the proof, and asking for a fresh one
 * means starting its flow again, which is exactly what this button does.
 *
 * `verify` is injected rather than imported, like every other step's action, so
 * the preview at `/internal/modals/confirm` doesn't start a real sign-in on a
 * route that is deliberately reachable in production.
 */
export function EmailConfirmationStep({ verify }: { verify: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  function handleVerify() {
    startTransition(async () => {
      await verify();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-body-lg leading-relaxed text-ink-strong">
        Thanks for starting the process with us. We just need to check this
        email is yours — we’ll send you a code to enter, and then pick up right
        where you left off.
      </p>

      <hr className="border-t border-grey-warm-200" />

      <StickyActions>
        <Button
          type="button"
          color="primary"
          onClick={handleVerify}
          disabled={pending}
          className="w-full"
        >
          {pending ? "One moment…" : "Send me a code"}
        </Button>
      </StickyActions>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { StickyActions } from "@pbh/booking";

/**
 * Header copy for this step, exported rather than inlined at the call site so
 * all four modal steps offer a code-owned fallback of the same shape — see
 * `resolveStepHeader`, which falls back to these whenever the Modals document
 * is empty. The siblings are `DETAILS_HEADER`, `consentHeader()` and
 * `PAYMENT_HEADER` in `@pbh/booking`.
 */
export const CONFIRM_HEADER = { title: "Email Confirmation" } as const;

/**
 * Blocking step shown straight after signup (Figma 1088:2121): we've emailed a
 * confirmation link and the flow can't continue until it's clicked.
 *
 * `expired` covers the customer arriving back from a link that had already been
 * used or had run out — same screen, different opening line, so a dead link
 * never reads as a dead end.
 *
 * `resend` is injected rather than imported, like every other step's action.
 * Importing it directly made this the one step whose preview at
 * `/internal/modals/confirm` still fired a real send — on a route that is
 * deliberately reachable in production.
 */
export function EmailConfirmationStep({
  expired = false,
  resend,
}: {
  expired?: boolean;
  /** Re-send the confirmation email. Takes no argument: the server derives the
   * recipient from the booking cookie, so it can't be aimed at another inbox. */
  resend: () => Promise<{ ok: true }>;
}) {
  const [pending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      await resend();
      // Always reported as sent. The action throttles silently, and saying
      // "too soon" would expose how recently a link went out.
      setResent(true);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xl leading-relaxed text-ink-strong">
        {expired
          ? "That confirmation link has expired or was already used. Send yourself a fresh one and we’ll pick up where you left off."
          : "Thanks for starting the process with us. We’ve sent you an email. Please check your inbox and confirm this is you."}
      </p>

      <hr className="border-t border-grey-warm-200" />

      <StickyActions>
        <p className="text-center text-base text-ink-strong">
          {resent ? (
            <span aria-live="polite">
              Sent. Check your inbox — it can take a minute to arrive.
            </span>
          ) : (
            <>
              Didn’t receive the email?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={pending}
                className="font-bold text-brand-default underline underline-offset-2 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Sending…" : "Re-send confirmation email."}
              </button>
            </>
          )}
        </p>
      </StickyActions>
    </div>
  );
}

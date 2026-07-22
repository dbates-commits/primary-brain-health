"use client";

import { useState, useTransition } from "react";
import { StickyActions } from "@pbh/booking";
import { resendConfirmationAction } from "./actions";

/**
 * Blocking step shown straight after signup (Figma 1088:2121): we've emailed a
 * confirmation link and the flow can't continue until it's clicked.
 *
 * `expired` covers the customer arriving back from a link that had already been
 * used or had run out — same screen, different opening line, so a dead link
 * never reads as a dead end.
 */
export function EmailConfirmationStep({
  userId,
  expired = false,
}: {
  userId: string;
  expired?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      await resendConfirmationAction(userId);
      // Always reported as sent. The action throttles silently, and saying
      // "too soon" would expose how recently a link went out.
      setResent(true);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xl leading-relaxed text-on-surface">
        {expired
          ? "That confirmation link has expired or was already used. Send yourself a fresh one and we’ll pick up where you left off."
          : "Thanks for starting the process with us. We’ve sent you an email. Please check your inbox and confirm this is you."}
      </p>

      <hr className="border-t border-neutral-200" />

      <StickyActions>
        <p className="text-center text-base text-on-surface">
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
                disabled={pending || !userId}
                className="font-bold text-primary underline underline-offset-2 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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

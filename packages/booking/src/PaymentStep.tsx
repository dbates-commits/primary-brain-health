"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { Button, StepHeader, cn } from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { CreateCheckoutAction, PaymentFinalizeAction } from "./types";

// Publishable key is inlined at build; safe to expose to the client. Missing key
// (e.g. env not set) → we render a configuration notice instead of crashing.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Shared Stripe Embedded Checkout step (test mode), used by the marketing
 * booking modal. Presentation + Stripe wiring only; the consuming app injects its
 * own `createSession` (mint a Checkout Session) and `finalize` (verify → persist
 * → sign in) server actions.
 *
 * Creates a Checkout Session (`ui_mode: "embedded_page"`,
 * `redirect_on_completion: "never"`) for this user and mounts Stripe's full
 * prebuilt form via `EmbeddedCheckoutProvider` / `EmbeddedCheckout`. When the
 * customer pays, Stripe fires `onComplete` (no redirect); we hand off to
 * `finalize` and, on success, reveal a "Continue" button beneath Stripe's own
 * confirmation (Figma 1988:8604). Pressing it calls `onComplete` — which is what
 * moves the customer on (the booking flow navigates to `/welcome`), so the
 * confirmation stays on screen for as long as they want it. No PII or card data
 * ever touches our servers; Checkout branding is set in the Stripe Dashboard
 * (Settings → Branding).
 */
/**
 * Header copy for the payment step, exported so a host that renders the header
 * itself (e.g. the marketing modal, which pins it above the scroll area) matches
 * the inline funnel step.
 */
export const PAYMENT_HEADER = { title: "Payment" } as const;

export function PaymentStep({
  createSession,
  finalize,
  onComplete,
  showHeader = true,
}: {
  createSession: CreateCheckoutAction;
  finalize: PaymentFinalizeAction;
  /**
   * Handed the Checkout Session id this step just paid, in case the host needs
   * to act on *this* payment. Nothing identifying on its own: the server
   * re-fetches the session from Stripe and matches it against the booking
   * cookie before it means anything.
   */
  onComplete: (checkoutSessionId: string) => void;
  showHeader?: boolean;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  /**
   * Set once `finalize` has confirmed the payment. Gates the Continue button:
   * until the server has verified the Session, there is nothing to continue to.
   */
  const [paid, setPaid] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Guard against React's double-invoke in dev so we mint one session per mount.
    if (started.current) {
      return;
    }
    started.current = true;

    createSession()
      .then((result) => {
        if (result.status === "ready") {
          setClientSecret(result.clientSecret);
          setSessionId(result.sessionId);
        } else {
          setInitError(result.message);
        }
      })
      .catch((err) => {
        // The action itself returns an error result rather than throwing, so this
        // only fires on a transport-level failure (network drop, serialization).
        // Without it the promise rejects unhandled and the UI hangs on "Loading".
        console.error("createSession failed:", err);
        setInitError("Couldn't start payment. Please try again.");
      });
  }, [createSession]);

  // Fired once Embedded Checkout finishes the payment (the customer stays on the
  // page). Verify + persist server-side (re-fetches the session from Stripe;
  // never trusts the client), then show the Continue button. On error the charge
  // stands and the webhook backstop still records it, so we surface the message
  // inline rather than crash.
  const handleComplete = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    setCompleteError(null);
    try {
      const finalized = await finalize(sessionId);
      if (finalized.status === "error") {
        setCompleteError(finalized.message);
        return;
      }
      setPaid(true);
    } catch (err) {
      console.error("finalize failed:", err);
      setCompleteError("We couldn't confirm your payment. Please try again.");
    }
  }, [sessionId, finalize]);

  /**
   * The customer's own move on from Stripe's "Thanks for your payment" state.
   * Guarded on `paid` as well as `sessionId` so the handoff can only fire after
   * the server has confirmed the payment, whatever else renders the button.
   */
  const handleContinue = useCallback(() => {
    if (!paid || !sessionId) {
      return;
    }
    onComplete(sessionId);
  }, [paid, sessionId, onComplete]);

  // Before payment the step owns its bottom padding: the modal body leaves it to
  // the step (see Modal.tsx) and there is no actions bar to supply it. Once the
  // Continue button appears, `StickyActions` owns that padding instead — keeping
  // both would double it.
  return (
    <div className={cn("flex flex-col gap-8", !paid && "pb-6 sm:pb-10")}>
      {showHeader ? <StepHeader {...PAYMENT_HEADER} /> : null}

      {initError && (
        <p role="alert" className="animate-error-in text-body-sm text-error">
          {initError}
        </p>
      )}

      {!stripePromise && !initError && (
        <p role="alert" className="text-body-sm text-error">
          Payments aren&apos;t configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      )}

      {stripePromise && clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret, onComplete: handleComplete }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}

      {completeError && (
        <p role="alert" className="animate-error-in text-body-sm text-error">
          {completeError}
        </p>
      )}

      {stripePromise && !clientSecret && !initError && (
        <p className="text-body-sm text-text-default">Loading payment…</p>
      )}

      {paid && (
        <StickyActions>
          <Button color="primary" className="w-full" onClick={handleContinue}>
            Continue
          </Button>
        </StickyActions>
      )}
    </div>
  );
}

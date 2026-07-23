"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { StepHeader } from "@pbh/ui";
import type { Track } from "@pbh/copy";
import type { CreateCheckoutAction, PaymentFinalizeAction } from "./types";

// Publishable key is inlined at build; safe to expose to the client. Missing key
// (e.g. env not set) → we render a configuration notice instead of crashing.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Shared Stripe Embedded Checkout step (test mode), used by the marketing
 * booking modal. Presentation + Stripe wiring only; the consuming app injects its
 * own `createSession` (mint a Checkout Session) and `finalize` (verify → persist
 * → register/enroll) server actions.
 *
 * Creates a Checkout Session (`ui_mode: "embedded_page"`,
 * `redirect_on_completion: "never"`) for this user and mounts Stripe's full
 * prebuilt form via `EmbeddedCheckoutProvider` / `EmbeddedCheckout`. When the
 * customer pays, Stripe fires `onComplete` (no redirect); we hand off to
 * `finalize` and, on success, call `onComplete` to advance the stepper. No PII or
 * card data ever touches our servers; Checkout branding is set in the Stripe
 * Dashboard (Settings → Branding).
 */
/**
 * Header copy for the payment step, exported so a host that renders the header
 * itself (e.g. the marketing modal, which pins it above the scroll area) matches
 * the inline funnel step.
 */
export const PAYMENT_HEADER = { title: "Payment" } as const;

export function PaymentStep({
  userId,
  track,
  createSession,
  finalize,
  onComplete,
  showHeader = true,
}: {
  userId: string;
  /** Which product is being bought — decides the Stripe price for this session. */
  track: Track;
  createSession: CreateCheckoutAction;
  finalize: PaymentFinalizeAction;
  onComplete: () => void;
  showHeader?: boolean;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Guard against React's double-invoke in dev so we mint one session per mount.
    if (started.current) {
      return;
    }
    started.current = true;

    createSession(userId, track)
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
  }, [userId, track, createSession]);

  // Fired once Embedded Checkout finishes the payment (the customer stays on the
  // page). Verify + persist + enroll server-side (re-fetches the session from
  // Stripe; never trusts the client), then advance the stepper. On error the
  // charge stands and the webhook backstop retries enrollment, so we just surface
  // it inline rather than crash.
  const handleComplete = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    setCompleteError(null);
    try {
      const finalized = await finalize(userId, sessionId);
      if (finalized.status === "error") {
        setCompleteError(finalized.message);
        return;
      }
      onComplete();
    } catch (err) {
      console.error("finalize failed:", err);
      setCompleteError("We couldn't confirm your payment. Please try again.");
    }
  }, [userId, sessionId, finalize, onComplete]);

  // Owns its bottom padding: the modal body leaves it to the step (see
  // Modal.tsx), and this step has no `StickyActions` bar to supply it.
  return (
    <div className="flex flex-col gap-8 pb-6 sm:pb-10">
      {showHeader ? <StepHeader {...PAYMENT_HEADER} /> : null}

      {initError && (
        <p role="alert" className="animate-error-in text-sm text-error">
          {initError}
        </p>
      )}

      {!stripePromise && !initError && (
        <p role="alert" className="text-sm text-error">
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
        <p role="alert" className="animate-error-in text-sm text-error">
          {completeError}
        </p>
      )}

      {stripePromise && !clientSecret && !initError && (
        <p className="text-sm text-on-surface-variant">Loading payment…</p>
      )}
    </div>
  );
}

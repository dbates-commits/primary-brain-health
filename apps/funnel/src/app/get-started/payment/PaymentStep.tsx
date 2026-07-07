"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { StepHeader } from "@/components/StepHeader";
import {
  createAssessmentCheckoutSession,
  finalizeCheckoutSession,
} from "./actions";

// Publishable key is inlined at build; safe to expose to the client. Missing key
// (e.g. env not set) → we render a configuration notice instead of crashing.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Stripe Embedded Checkout step (test mode). Creates a Checkout Session
 * (`ui_mode: "embedded_page"`, `redirect_on_completion: "never"`) for this user and
 * mounts Stripe's full prebuilt payment form via `EmbeddedCheckoutProvider` /
 * `EmbeddedCheckout` with the session `client_secret`. When the customer pays,
 * Stripe fires `onComplete` (no redirect); we then hand off to
 * `finalizeCheckoutSession` (verify → persist → register/enroll) and, on success,
 * call `onComplete` to advance the stepper to the confirmation screen. No PII or
 * card data ever touches our servers; Checkout branding is set in the Stripe
 * Dashboard (Settings → Branding).
 */
export function PaymentStep({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
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

    createAssessmentCheckoutSession(userId).then((result) => {
      if (result.status === "ready") {
        setClientSecret(result.clientSecret);
        setSessionId(result.sessionId);
      } else {
        setInitError(result.message);
      }
    });
  }, [userId]);

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
      const finalized = await finalizeCheckoutSession(userId, sessionId);
      if (finalized.status === "error") {
        setCompleteError(finalized.message);
        return;
      }
      onComplete();
    } catch (err) {
      console.error("finalizeCheckoutSession failed:", err);
      setCompleteError("We couldn't confirm your payment. Please try again.");
    }
  }, [userId, sessionId, onComplete]);

  return (
    <div className="flex flex-col gap-8">
      <StepHeader title="Payment" />

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

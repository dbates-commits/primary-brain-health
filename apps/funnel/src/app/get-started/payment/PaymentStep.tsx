"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { StepHeader } from "@/components/StepHeader";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import {
  createAssessmentCheckoutSession,
  finalizeAssessmentPayment,
} from "./actions";

// Publishable key is inlined at build; safe to expose to the client. Missing key
// (e.g. env not set) → we render a configuration notice instead of crashing.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Stripe Embedded Checkout step (test mode). Fetches an embedded Checkout Session
 * client secret for this user, mounts the `EmbeddedCheckout` widget (Stripe hosts
 * the whole payment UI in an iframe), and on completion hands off to
 * `finalizeAssessmentPayment` (verify → persist → register/enroll → redirect to
 * /assessments). No PII or card data ever touches our servers. Session styling is
 * configured in the Stripe Dashboard branding settings, not here.
 */
export function PaymentStep({ userId }: { userId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
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

  async function handleComplete() {
    if (!sessionId) {
      return;
    }
    // Payment is done inside the widget; verify + enroll server-side (which
    // re-checks status/amount/user and never trusts the client). On success the
    // server action redirects to /assessments, so control usually ends here.
    const result = await finalizeAssessmentPayment(userId, sessionId);
    if (result.status === "error") {
      setCompletionError(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <StepHeader title="Payment" />

      <div className="rounded-xl border border-outline/40 bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-on-surface">Brain health assessment</span>
          <span className="font-headline text-lg text-primary">
            {formatUsd(ASSESSMENT_PRICE_CENTS)}
          </span>
        </div>
        <p className="mt-2 text-sm text-on-surface-variant">
          Cards (incl. HSA/FSA) and wallets. Test mode — use card{" "}
          <code className="font-mono">4242 4242 4242 4242</code>, any future
          expiry and CVC.
        </p>
      </div>

      {initError && (
        <p role="alert" className="animate-error-in text-sm text-error">
          {initError}
        </p>
      )}

      {completionError && (
        <p role="alert" className="animate-error-in text-sm text-error">
          {completionError}
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

      {stripePromise && !clientSecret && !initError && (
        <p className="text-sm text-on-surface-variant">Loading payment…</p>
      )}
    </div>
  );
}

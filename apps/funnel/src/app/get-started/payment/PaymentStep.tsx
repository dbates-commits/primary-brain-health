"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { StepHeader } from "@/components/StepHeader";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import { CheckoutForm } from "./CheckoutForm";
import { createAssessmentPaymentIntent } from "./actions";

// Publishable key is inlined at build; safe to expose to the client. Missing key
// (e.g. env not set) → we render a configuration notice instead of crashing.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Nudge the Payment Element toward the brand palette. The full brand token set
// (Stripe Appearance API) is wired in pbh-bws.39.
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#041632",
    colorText: "#041632",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
  },
};

/**
 * Stripe Payment Element step (test mode). Fetches a PaymentIntent client secret
 * for this user, mounts the Payment Element, and on successful confirmation
 * hands off to `finalizeAssessmentPayment` (verify → persist → register/enroll →
 * redirect to /assessments). No PII or card data ever touches our servers.
 */
export function PaymentStep({ userId }: { userId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Guard against React's double-invoke in dev so we mint one intent per mount.
    if (started.current) {
      return;
    }
    started.current = true;

    createAssessmentPaymentIntent(userId).then((result) => {
      if (result.status === "ready") {
        setClientSecret(result.clientSecret);
      } else {
        setInitError(result.message);
      }
    });
  }, [userId]);

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

      {!stripePromise && !initError && (
        <p role="alert" className="text-sm text-error">
          Payments aren&apos;t configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      )}

      {stripePromise && clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance }}
        >
          <CheckoutForm userId={userId} />
        </Elements>
      )}

      {stripePromise && !clientSecret && !initError && (
        <p className="text-sm text-on-surface-variant">Loading payment…</p>
      )}
    </div>
  );
}

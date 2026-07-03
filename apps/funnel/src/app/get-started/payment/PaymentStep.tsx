"use client";

import { useState } from "react";
import { Button } from "@pbh/ui";
import { StepHeader } from "@/components/StepHeader";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import { createAssessmentCheckoutSession } from "./actions";

/**
 * Stripe hosted Checkout step (test mode). Creates a hosted Checkout Session for
 * this user and redirects the browser to Stripe's hosted payment page. After
 * payment Stripe returns to `/get-started/payment/return`, which verifies,
 * persists, enrolls, and forwards to /assessments. No PII or card data ever
 * touches our servers — the whole payment page is hosted by Stripe.
 */
export function PaymentStep({ userId }: { userId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setSubmitting(true);
    setError(null);

    const result = await createAssessmentCheckoutSession(userId);
    if (result.status === "ready") {
      // Leaving the site for Stripe's hosted page; keep the button disabled.
      window.location.href = result.url;
      return;
    }

    setError(result.message);
    setSubmitting(false);
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
          You&apos;ll be redirected to Stripe&apos;s secure checkout to pay. Cards
          (incl. HSA/FSA) and wallets. Test mode — use card{" "}
          <code className="font-mono">4242 4242 4242 4242</code>, any future
          expiry and CVC.
        </p>
      </div>

      <Button
        type="button"
        color="primary"
        className="h-14 w-full text-base"
        onClick={handleCheckout}
        disabled={submitting}
      >
        {submitting
          ? "Redirecting…"
          : `Continue to secure checkout · ${formatUsd(ASSESSMENT_PRICE_CENTS)}`}
      </Button>

      {error && (
        <p role="alert" className="animate-error-in text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

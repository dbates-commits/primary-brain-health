"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@pbh/ui";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import { finalizeAssessmentPayment } from "./actions";

/**
 * The card form itself. Must be rendered inside <Elements> (see PaymentStep) so
 * the Stripe hooks resolve. On successful confirmation it hands off to
 * `finalizeAssessmentPayment` (verify → persist → register/enroll) and, on
 * success, calls `onComplete` so the stepper advances to the confirmation step.
 */
export function CheckoutForm({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setSubmitting(true);
    setError(null);

    // `redirect: "if_required"` returns the intent inline for no-redirect methods
    // (which is all we allow), so we never leave the page.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Verify + persist + enroll server-side. On success advance to the
      // confirmation step (kept `submitting` so the button stays disabled as the
      // stepper swaps this form out); on error surface it inline.
      const result = await finalizeAssessmentPayment(userId, paymentIntent.id);
      if (result.status === "error") {
        setError(result.message);
        setSubmitting(false);
        return;
      }
      onComplete();
      return;
    }

    setError("Payment didn't complete. Please try again.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      <fieldset
        disabled={submitting || !stripe}
        aria-busy={submitting}
        className="m-0 min-w-0 border-0 p-0 transition-opacity disabled:opacity-60"
      >
        <Button type="submit" color="primary" className="h-14 w-full text-base">
          {submitting
            ? "Processing…"
            : `Pay ${formatUsd(ASSESSMENT_PRICE_CENTS)}`}
        </Button>
      </fieldset>

      {error && (
        <p role="alert" className="animate-error-in text-sm text-error">
          {error}
        </p>
      )}
    </form>
  );
}

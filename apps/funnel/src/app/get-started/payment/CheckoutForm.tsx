"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@pbh/ui";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import { finalizeAssessmentPayment } from "./actions";
import { PaymentSuccess } from "./PaymentSuccess";

/**
 * The card form itself. Must be rendered inside <Elements> (see PaymentStep) so
 * the Stripe hooks resolve. On successful confirmation it hands off to
 * `finalizeAssessmentPayment` (verify → persist → register/enroll → redirect).
 */
export function CheckoutForm({ userId }: { userId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
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
      // The card is charged — show the success state now, then finalize. Finalize
      // verifies + enrolls, then redirects, so control usually doesn't return
      // here; if it does with an error, surface it and drop back to the form.
      setSucceeded(true);
      const result = await finalizeAssessmentPayment(userId, paymentIntent.id);
      if (result.status === "error") {
        setError(result.message);
        setSucceeded(false);
        setSubmitting(false);
      }
      return;
    }

    setError("Payment didn't complete. Please try again.");
    setSubmitting(false);
  }

  if (succeeded) {
    return <PaymentSuccess />;
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

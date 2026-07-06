"use client";

import { useState } from "react";
import { PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { Button } from "@pbh/ui";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";
import { finalizeCheckoutSession } from "./actions";

/**
 * The card form itself. Must be rendered inside <CheckoutElementsProvider> (see
 * PaymentStep) so `useCheckoutElements()` resolves. On submit it confirms the
 * Checkout Session client-side with `checkout.confirm`, then hands the session id
 * to `finalizeCheckoutSession` (verify → persist → register/enroll) and, on
 * success, calls `onComplete` so the stepper advances to the confirmation step.
 */
export function CheckoutForm({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const checkoutState = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = checkoutState.type === "success";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (checkoutState.type !== "success") {
      return;
    }
    setSubmitting(true);
    setError(null);

    const { checkout } = checkoutState;
    try {
      // `redirect: "if_required"` keeps card confirmation inline. `returnUrl` is
      // required by the Checkout Sessions SDK even so; it's only used as the
      // fallback if a redirect-based method is ever added (none are enabled here).
      const result = await checkout.confirm({
        redirect: "if_required",
        returnUrl: `${window.location.origin}/get-started`,
      });

      if (result.type === "error") {
        setError(result.error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // Verify + persist + enroll server-side (re-fetches the session from
      // Stripe; never trusts the client). On success advance to the confirmation
      // step (kept `submitting` so the button stays disabled as the stepper swaps
      // this form out); on error surface it inline.
      const finalized = await finalizeCheckoutSession(userId, result.session.id);
      if (finalized.status === "error") {
        setError(finalized.message);
        setSubmitting(false);
        return;
      }
      onComplete();
    } catch (err) {
      console.error("checkout confirm failed:", err);
      setError("Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      <fieldset
        disabled={submitting || !ready}
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

"use client";

import { Button, StepHeader } from "@pbh/ui";

/**
 * Modal step 3 (Figma 360-3226): the Payment step. This is the UI **shell** only
 * — a placeholder stands in for Stripe Embedded Checkout. The real session
 * creation + `<EmbeddedCheckout>` mount + fulfillment are wired in `.5`; here
 * "Pay Now" just advances to the confirmation screen so the flow is walkable.
 */
export function PaymentStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <StepHeader title="Payment" />

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container px-6 py-12 text-center">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-on-surface-variant"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 19.5h16.5A2.25 2.25 0 0022.5 17.25V6.75A2.25 2.25 0 0020.25 4.5H3.75A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 19.5z"
          />
        </svg>
        <p className="text-sm text-on-surface-variant">
          Secure payment via Stripe mounts here — wired up in a later step.
        </p>
      </div>

      <Button
        type="button"
        color="primary"
        onClick={onComplete}
        className="h-14 w-full text-base"
      >
        Pay Now
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@pbh/ui";

/**
 * TEMP placeholder payment step. The real Stripe Payment Element ($149,
 * HSA/FSA, SAQ-A) lands in pbh-bws.22 — for now this just shows a stub summary
 * and advances the flow so the stepper can be walked end to end.
 */
export function PaymentStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-xl border border-outline/40 bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-on-surface">Brain health assessment</span>
          <span className="font-headline text-lg text-primary">$149.00</span>
        </div>
        <p className="mt-2 text-sm text-on-surface-variant">
          Placeholder summary — the Stripe Payment Element (cards, Apple/Google
          Pay, HSA/FSA) lands in a later task.
        </p>
      </div>

      <Button
        type="button"
        color="primary"
        className="w-full"
        onClick={onComplete}
      >
        Pay $149 (placeholder)
      </Button>
    </div>
  );
}

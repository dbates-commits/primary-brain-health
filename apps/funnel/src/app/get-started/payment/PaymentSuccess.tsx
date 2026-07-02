"use client";

import { PhosphorIcon } from "@pbh/ui";
import { ASSESSMENT_PRICE_CENTS, formatUsd } from "@/lib/stripe/pricing";

/**
 * Shown the moment Stripe confirms the charge, while the server finalizes the
 * payment and enrolls the user before redirecting to /assessments. The charge
 * has already succeeded at this point, so the confirmation is accurate; the
 * spinner covers the brief server round-trip until the redirect fires.
 */
export function PaymentSuccess() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex animate-error-in flex-col items-center gap-4 py-6 text-center"
    >
      <PhosphorIcon
        name="CheckCircle"
        size={56}
        weight="fill"
        className="text-secondary"
      />
      <div className="flex flex-col gap-1">
        <p className="font-headline text-2xl font-thin text-on-surface">
          Payment successful
        </p>
        <p className="text-on-surface-variant">
          Your {formatUsd(ASSESSMENT_PRICE_CENTS)} payment went through. Taking
          you to your assessment…
        </p>
      </div>
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-outline/30 border-t-primary"
      />
    </div>
  );
}

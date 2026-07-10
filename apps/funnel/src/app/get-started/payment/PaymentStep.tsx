"use client";

import { PaymentStep as SharedPaymentStep } from "@pbh/booking";
import {
  createAssessmentCheckoutSession,
  finalizeCheckoutSession,
} from "./actions";

/**
 * Funnel payment step: the shared Stripe Embedded Checkout component with the
 * funnel's own `createSession` / `finalize` server actions injected. `finalize`
 * here registers + enrolls and drops the assessment cookie (see `./actions`), so
 * on success the stepper advances to the confirmation screen that links to
 * /assessments.
 */
export function PaymentStep({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  return (
    <SharedPaymentStep
      userId={userId}
      createSession={createAssessmentCheckoutSession}
      finalize={finalizeCheckoutSession}
      onComplete={onComplete}
    />
  );
}

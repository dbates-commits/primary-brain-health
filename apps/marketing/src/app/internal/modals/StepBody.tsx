"use client";

import { ConsentForm, DetailsForm, PaymentStep } from "@pbh/booking";
import { EmailConfirmationStep } from "@/components/booking/EmailConfirmationStep";
import type { ModalStep } from "@/components/booking/steps";
import {
  previewCheckout,
  previewConsent,
  previewDetails,
  previewFinalize,
} from "./preview-actions";

/**
 * A step's body — everything below the header — with inert actions.
 *
 * A `switch` rather than a chain of `&&`s so it is exhaustive over `ModalStep`:
 * a fifth step becomes a typecheck failure here rather than a panel that
 * renders its header over nothing.
 */
export function StepBody({ step }: { step: ModalStep }) {
  switch (step) {
    case "confirm":
      // The only step that takes no action prop: it imports
      // `resendConfirmationAction` directly, so the resend link here calls the
      // real action. Harmless — it resolves the account from the booking cookie
      // and no-ops without one — and not worth reshaping the component for.
      return <EmailConfirmationStep />;
    case "details":
      return (
        <DetailsForm
          action={previewDetails}
          firstName="Alex"
          lastName="Rivera"
          onComplete={() => {}}
          showHeader={false}
        />
      );
    case "consent":
      return (
        <ConsentForm
          action={previewConsent}
          track="wellness"
          onComplete={() => {}}
          showHeader={false}
        />
      );
    case "payment":
      return (
        <PaymentStep
          createSession={previewCheckout}
          finalize={previewFinalize}
          onComplete={() => {}}
          showHeader={false}
        />
      );
  }
}

"use client";

import { ConsentForm, DetailsForm, PaymentStep } from "@pbh/booking";
import { ConsentTerms } from "@/components/booking/ConsentTerms";
import { resolveConsentTerms } from "@/components/booking/consent-copy";
import { EmailConfirmationStep } from "@/components/booking/EmailConfirmationStep";
import type { ModalStep, ModalStepCopy } from "@/components/booking/steps";
import {
  previewCheckout,
  previewConsent,
  previewDetails,
  previewFinalize,
  previewResend,
} from "./preview-actions";

/**
 * A step's body — everything below the header — with inert actions.
 *
 * A `switch` rather than a chain of `&&`s so it is exhaustive over `ModalStep`:
 * a fifth step becomes a typecheck failure here rather than a panel that
 * renders its header over nothing.
 */
export function StepBody({
  step,
  copy,
}: {
  step: ModalStep;
  /** This step's document — the consent step renders its terms from it. */
  copy?: ModalStepCopy | null;
}) {
  switch (step) {
    case "confirm":
      return <EmailConfirmationStep resend={previewResend} />;
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
          // Undefined when the CMS holds no agreement, so ConsentForm shows
          // the terms that ship in code — the same fallback a customer gets.
          // An element that renders nothing would leave an empty box instead.
          terms={
            resolveConsentTerms(copy).content ? (
              <ConsentTerms content={copy?.terms} />
            ) : undefined
          }
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

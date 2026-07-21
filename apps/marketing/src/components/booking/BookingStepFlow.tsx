"use client";

import { useCallback, useState } from "react";
import { StepHeader } from "@pbh/ui";
import {
  DetailsForm,
  ConsentForm,
  PaymentStep,
  detailsHeader,
  CONSENT_HEADER,
  PAYMENT_HEADER,
  type SignupResult,
} from "@pbh/booking";
import { Modal } from "./Modal";
import { BookingSection } from "./BookingSection";
import { DoneStep } from "./DoneStep";
import { signupAction, detailsAction, consentAction } from "./actions";
import {
  createAssessmentCheckoutSession,
  finalizeCheckoutSession,
} from "./payment/actions";

/**
 * Modal steps that run after the inline signup. `signup` itself is the inline
 * form on the page (not a modal step) — submitting it opens the modal at
 * `details`.
 */
const MODAL_STEPS = ["details", "consent", "payment", "done"] as const;
type ModalStep = (typeof MODAL_STEPS)[number];

const STEP_LABEL: Record<ModalStep, string> = {
  details: "Complete your details",
  consent: "Review terms and consent",
  payment: "Payment",
  done: "Confirmation",
};

type FlowContext = {
  userId: string;
  firstName: string;
  email: string;
  /** Answered at signup; decides how the details step is worded and what it asks. */
  patientIdentification: string;
};

/**
 * Client orchestrator for the booking flow. Renders the inline `BookingSection`
 * (shared `SignupForm`); on submit it opens the modal and steps through the
 * shared `DetailsForm` → `ConsentForm` → `PaymentStep` (Stripe Embedded Checkout)
 * → done. Every step calls a real `@pbh/booking/server`-backed action injected
 * here (pbh-ggr.5). State is in-memory for the session.
 */
export function BookingStepFlow({
  headline,
  subheadline,
}: {
  headline?: string;
  subheadline?: string;
}) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [context, setContext] = useState<FlowContext>({
    userId: "",
    firstName: "",
    email: "",
    patientIdentification: "",
  });

  const start = useCallback((result: SignupResult) => {
    setContext({
      userId: result.userId,
      firstName: result.firstName,
      email: result.email,
      patientIdentification: result.patientIdentification,
    });
    setStepIndex(0);
    setOpen(true);
  }, []);

  const advance = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, MODAL_STEPS.length - 1));
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const step = MODAL_STEPS[stepIndex];

  // Each step's header is rendered by the Modal in a fixed region above the
  // scroll area (so only the body scrolls), using the step's own exported copy.
  // `done` renders its own header (it never scrolls).
  const stepHeader =
    step === "details" ? (
      <StepHeader
        {...detailsHeader(
          context.firstName,
          context.patientIdentification === "Someone else",
        )}
      />
    ) : step === "consent" ? (
      <StepHeader {...CONSENT_HEADER} />
    ) : step === "payment" ? (
      <StepHeader {...PAYMENT_HEADER} />
    ) : undefined;

  return (
    <>
      <BookingSection
        headline={headline}
        subheadline={subheadline}
        signupAction={signupAction}
        onStart={start}
      />
      <Modal
        open={open}
        onClose={close}
        label={STEP_LABEL[step]}
        header={stepHeader}
      >
        {step === "details" && (
          <DetailsForm
            action={detailsAction}
            userId={context.userId}
            name={context.firstName}
            patientIdentification={context.patientIdentification}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {step === "consent" && (
          <ConsentForm
            action={consentAction}
            userId={context.userId}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            userId={context.userId}
            createSession={createAssessmentCheckoutSession}
            finalize={finalizeCheckoutSession}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {step === "done" && <DoneStep email={context.email} onClose={close} />}
      </Modal>
    </>
  );
}

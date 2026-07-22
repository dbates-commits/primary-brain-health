"use client";

import { useCallback, useState } from "react";
import { StepHeader } from "@pbh/ui";
import {
  SignupForm,
  DetailsForm,
  ConsentForm,
  PaymentStep,
  detailsHeader,
  SIGNUP_HEADER,
  CONSENT_HEADER,
  PAYMENT_HEADER,
  DEFAULT_PACKAGE_KEY,
  type AssessmentPackage,
  type PackageKey,
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
 * The whole booking flow now runs in the modal, signup included — the landing
 * section is two package cards, and a card's CTA opens the modal at `signup`.
 */
const MODAL_STEPS = ["signup", "details", "consent", "payment", "done"] as const;
type ModalStep = (typeof MODAL_STEPS)[number];

const STEP_LABEL: Record<ModalStep, string> = {
  signup: "Create your account",
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

const EMPTY_CONTEXT: FlowContext = {
  userId: "",
  firstName: "",
  email: "",
  patientIdentification: "",
};

/**
 * Client orchestrator for the booking flow. Renders the `BookingSection` cards;
 * choosing a package opens the modal and steps through the shared `SignupForm` →
 * `DetailsForm` → `ConsentForm` → `PaymentStep` (Stripe Embedded Checkout) →
 * done. Every step calls a real `@pbh/booking/server`-backed action injected
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
  const [packageKey, setPackageKey] = useState<PackageKey>(DEFAULT_PACKAGE_KEY);
  const [context, setContext] = useState<FlowContext>(EMPTY_CONTEXT);

  const advance = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, MODAL_STEPS.length - 1));
  }, []);

  /**
   * Open the modal at signup for the chosen package. Context is reset so a
   * second booking in the same session can't inherit the first one's account.
   */
  const selectPackage = useCallback((pkg: AssessmentPackage) => {
    setPackageKey(pkg.key);
    setContext(EMPTY_CONTEXT);
    setStepIndex(0);
    setOpen(true);
  }, []);

  const completeSignup = useCallback(
    (result: SignupResult) => {
      setContext({
        userId: result.userId,
        firstName: result.firstName,
        email: result.email,
        patientIdentification: result.patientIdentification,
      });
      advance();
    },
    [advance],
  );

  const close = useCallback(() => setOpen(false), []);

  /**
   * Bind the chosen package to the checkout action. Memoised deliberately:
   * `PaymentStep` mints its Session from a `useEffect` keyed on this function,
   * so a new identity each render would create a fresh Stripe Session every
   * time the component re-rendered.
   */
  const createSession = useCallback(
    (userId: string) => createAssessmentCheckoutSession(userId, packageKey),
    [packageKey],
  );

  const step = MODAL_STEPS[stepIndex];

  // Each step's header is rendered by the Modal in a fixed region above the
  // scroll area (so only the body scrolls), using the step's own exported copy.
  // `done` renders its own header (it never scrolls).
  const stepHeader =
    step === "signup" ? (
      <StepHeader {...SIGNUP_HEADER} />
    ) : step === "details" ? (
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
        onSelectPackage={selectPackage}
      />
      <Modal
        open={open}
        onClose={close}
        label={STEP_LABEL[step]}
        header={stepHeader}
      >
        {step === "signup" && (
          <SignupForm
            action={signupAction}
            onComplete={completeSignup}
            showHeader={false}
          />
        )}
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
            createSession={createSession}
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

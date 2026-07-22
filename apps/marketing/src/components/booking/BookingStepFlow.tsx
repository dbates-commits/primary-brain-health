"use client";

import { useCallback, useEffect, useState } from "react";
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
import { EmailConfirmationStep } from "./EmailConfirmationStep";
import {
  signupAction,
  detailsAction,
  consentAction,
  getBookingResumeState,
} from "./actions";
import {
  createAssessmentCheckoutSession,
  createAssessmentHandoffUrl,
  finalizeCheckoutSession,
} from "./payment/actions";

/**
 * The whole booking flow now runs in the modal, signup included — the landing
 * section is two package cards, and a card's CTA opens the modal at `signup`.
 */
const MODAL_STEPS = [
  "signup",
  "confirm",
  "details",
  "consent",
  "payment",
  "done",
] as const;
type ModalStep = (typeof MODAL_STEPS)[number];

const STEP_LABEL: Record<ModalStep, string> = {
  signup: "Create your account",
  confirm: "Confirm your email",
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
  const [expiredLink, setExpiredLink] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);

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
    setExpiredLink(false);
    setStepIndex(0);
    setOpen(true);
  }, []);

  /**
   * Carry the chosen package into signup so it is persisted on the account.
   * The confirmation gate sends the customer away and they return to a fresh
   * page, so this component's state is gone by the time they reach payment —
   * the stored value is what checkout actually charges.
   */
  const signupWithPackage = useCallback(
    (prev: Parameters<typeof signupAction>[0], formData: FormData) => {
      formData.set("packageKey", packageKey);
      return signupAction(prev, formData);
    },
    [packageKey],
  );

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

  /**
   * Payment done: mint the post-payment sign-in link before showing the
   * confirmation, so the button there drops them straight into /assessments
   * instead of asking for a magic link.
   *
   * Failure is not fatal — `createAssessmentHandoffUrl` returns null and
   * `DoneStep` falls back to /login. Advancing regardless matters: the charge
   * has already gone through, so nothing here may block the confirmation.
   */
  const completePayment = useCallback(async () => {
    try {
      setHandoffUrl(await createAssessmentHandoffUrl(context.userId));
    } catch (err) {
      console.error("handoff link failed:", err);
    }
    advance();
  }, [advance, context.userId]);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Reopen the flow for someone returning from a confirmation link.
   *
   * The confirm route redirects here with `?booking=resume` (or `expired`) and a
   * signed httpOnly cookie; the marker in the URL carries no identity of its own.
   * Resolving the step through a server action rather than in the page keeps the
   * home page statically rendered — only a returning customer pays the
   * round-trip. Runs once on mount.
   */
  useEffect(() => {
    const marker = new URLSearchParams(window.location.search).get("booking");
    if (marker !== "resume" && marker !== "expired") {
      return;
    }
    let cancelled = false;
    void getBookingResumeState().then((resumed) => {
      if (cancelled || !resumed) {
        return;
      }
      setContext({
        userId: resumed.userId,
        firstName: resumed.firstName,
        email: "",
        patientIdentification: resumed.patientIdentification,
      });
      // Without this the flow would fall back to the default package and charge
      // the basic price for a Comprehensive booking — every customer passes
      // through here, because the confirmation gate is blocking.
      setPackageKey(resumed.packageKey);
      // An expired link lands on the confirmation step whatever else is done,
      // since the address still isn't proven.
      const target = marker === "expired" ? "confirm" : resumed.step;
      setStepIndex(MODAL_STEPS.indexOf(target));
      setExpiredLink(marker === "expired");
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    ) : step === "confirm" ? (
      <StepHeader title="Email Confirmation" />
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
            action={signupWithPackage}
            onComplete={completeSignup}
            showHeader={false}
          />
        )}
        {step === "confirm" && (
          <EmailConfirmationStep
            userId={context.userId}
            expired={expiredLink}
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
            onComplete={completePayment}
            showHeader={false}
          />
        )}
        {step === "done" && (
          <DoneStep
            email={context.email}
            handoffUrl={handoffUrl}
            onClose={close}
          />
        )}
      </Modal>
    </>
  );
}

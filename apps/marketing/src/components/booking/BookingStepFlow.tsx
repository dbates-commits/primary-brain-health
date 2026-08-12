"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@pbh/ui";
import {
  SignupForm,
  DetailsForm,
  ConsentForm,
  PaymentStep,
  detailsHeader,
  SIGNUP_HEADER,
  consentHeader,
  PAYMENT_HEADER,
  DEFAULT_PACKAGE_KEY,
  trackForPackage,
  type AssessmentPackage,
  type PackageKey,
  type SignupResult,
} from "@pbh/booking";
import { Modal } from "./Modal";
import { BookingSection } from "./BookingSection";
import { NavigatorNote } from "./NavigatorNote";
import { EmailConfirmationStep } from "./EmailConfirmationStep";
import {
  signupAction,
  detailsAction,
  consentAction,
  getBookingResumeState,
} from "./actions";
import {
  createAssessmentCheckoutSession,
  finalizeCheckoutSession,
} from "./payment/actions";

/**
 * The whole booking flow now runs in the modal, signup included — the landing
 * section is two package cards, and a card's CTA opens the modal at `signup`.
 *
 * Payment is the last step the modal owns: a paid customer is sent to
 * `/welcome`, so there is no in-modal confirmation step (see `WELCOME_PATH`).
 */
const MODAL_STEPS = [
  "signup",
  "confirm",
  "details",
  "consent",
  "payment",
] as const;
type ModalStep = (typeof MODAL_STEPS)[number];

const STEP_LABEL: Record<ModalStep, string> = {
  signup: "Create your account",
  confirm: "Confirm your email",
  details: "Complete your details",
  consent: "Review terms and consent",
  payment: "Payment",
};

/**
 * Where the flow ends. The route gates on an Auth.js session or the booking
 * cookie plus a succeeded payment — both of which `finalizeCheckoutSession` has
 * just arranged — so a customer arriving here is always let in.
 */
const WELCOME_PATH = "/welcome";

/**
 * What the client knows about the booking in progress. No user id: identity is
 * the server's signed HttpOnly cookie, so every action below resolves the
 * account itself rather than being told which one to write to (pbh-9yb.2).
 */
type FlowContext = {
  firstName: string;
  /** Answered at signup; decides how the details step is worded and what it asks. */
  patientIdentification: string;
};

const EMPTY_CONTEXT: FlowContext = {
  firstName: "",
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [packageKey, setPackageKey] = useState<PackageKey>(DEFAULT_PACKAGE_KEY);
  const [context, setContext] = useState<FlowContext>(EMPTY_CONTEXT);
  const [expiredLink, setExpiredLink] = useState(false);

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
        firstName: result.firstName,
        patientIdentification: result.patientIdentification,
      });
      advance();
    },
    [advance],
  );

  /**
   * Payment is the last step we own — hand the customer to `/welcome` rather
   * than a step inside the modal, so the confirmation survives a reload and a
   * returning customer sees the same screen.
   */
  const completePayment = useCallback(() => {
    router.push(WELCOME_PATH);
  }, [router]);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Reopen the flow for someone returning from a confirmation link.
   *
   * The confirm route redirects here with `?booking=resume` (or `expired`) and a
   * signed httpOnly cookie; the marker in the URL carries no identity of its own.
   * Resolving the step through a server action rather than in the page keeps the
   * home page statically rendered — only a returning customer pays the
   * round-trip. `router` is stable, so this still runs once on mount.
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
      // The server still calls a fully-paid booking "done"; that is no longer a
      // modal step, so send them to the screen it stands for. Checked before the
      // expired-link branch below, since a paid customer's address is proven.
      if (resumed.step === "done") {
        router.push(WELCOME_PATH);
        return;
      }
      setContext({
        firstName: resumed.firstName,
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
  }, [router]);

  /**
   * Bind the chosen package to the checkout action. Memoised deliberately:
   * `PaymentStep` mints its Session from a `useEffect` keyed on this function,
   * so a new identity each render would create a fresh Stripe Session every
   * time the component re-rendered.
   */
  const createSession = useCallback(
    () => createAssessmentCheckoutSession(packageKey),
    [packageKey],
  );

  /**
   * Which product's vocabulary these steps speak in. Derived from the chosen
   * package rather than tracked alongside it, so the words a customer reads
   * can't disagree with the package they are being charged for — including
   * after the confirmation gate, where `packageKey` is restored from the server
   * and any parallel track state would have been lost.
   */
  const track = trackForPackage(packageKey);

  const step = MODAL_STEPS[stepIndex];

  // Each step's header is rendered by the Modal in a fixed region above the
  // scroll area (so only the body scrolls), using the step's own exported copy.
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
      <StepHeader {...consentHeader(track)} />
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
      <NavigatorNote />
      <Modal
        open={open}
        onClose={close}
        label={STEP_LABEL[step]}
        header={stepHeader}
      >
        {step === "signup" && (
          <SignupForm
            action={signupWithPackage}
            track={track}
            onComplete={completeSignup}
            showHeader={false}
          />
        )}
        {step === "confirm" && <EmailConfirmationStep expired={expiredLink} />}
        {step === "details" && (
          <DetailsForm
            action={detailsAction}
            name={context.firstName}
            patientIdentification={context.patientIdentification}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {step === "consent" && (
          <ConsentForm
            action={consentAction}
            track={track}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            createSession={createSession}
            finalize={finalizeCheckoutSession}
            onComplete={completePayment}
            showHeader={false}
          />
        )}
      </Modal>
    </>
  );
}

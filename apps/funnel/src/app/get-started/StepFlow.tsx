"use client";

import { useCallback, useState } from "react";
import { SignupForm, type SignupResult } from "./signup";
import { DetailsForm } from "./details";
import { ConsentForm } from "./consent";
import { PaymentStep } from "./payment";
import { BookingHero } from "./BookingHero";
import { ResumeBooking } from "./ResumeBooking";
import { Modal } from "@/components/Modal";

/**
 * Booking flow for the get-started funnel. The first step (signup: name + email)
 * renders inline in the marketing-style hero card; once the account exists the
 * remaining steps (details → consent → payment) run inside a modal. State lives
 * in client memory for the session: `stepIndex` is the current index into STEPS,
 * `context` is data accumulated across steps, `modalOpen` gates the dialog.
 *
 * To add a step later: add an entry to STEPS and a case to renderModalStep — the
 * advance/merge plumbing stays the same.
 */
const STEPS = ["signup", "details", "consent", "payment", "done"] as const;
type Step = (typeof STEPS)[number];

type FlowContext = {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export function StepFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [context, setContext] = useState<FlowContext>({});
  const [modalOpen, setModalOpen] = useState(false);

  const advance = useCallback((partial: FlowContext = {}) => {
    setContext((prev) => ({ ...prev, ...partial }));
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const handleSignupComplete = useCallback(
    (result: SignupResult) => {
      advance({
        userId: result.userId,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
      });
      // Account created — collect the rest in the modal.
      setModalOpen(true);
    },
    [advance],
  );

  const handleStepComplete = useCallback(() => {
    advance();
  }, [advance]);

  const step: Step = STEPS[stepIndex];
  const bookingStarted = Boolean(context.userId);

  function renderModalStep() {
    switch (step) {
      case "details":
        // userId is guaranteed once we've advanced past signup.
        return (
          <DetailsForm
            userId={context.userId ?? ""}
            name={context.firstName ?? ""}
            onComplete={handleStepComplete}
          />
        );

      case "consent":
        return (
          <ConsentForm
            userId={context.userId ?? ""}
            onComplete={handleStepComplete}
          />
        );

      case "payment":
        // Paying registers + enrolls server-side and forwards to /assessments,
        // so this step navigates away rather than advancing the stepper.
        return <PaymentStep userId={context.userId ?? ""} />;

      case "done":
        return (
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-6">
            <p className="font-headline text-lg text-primary">
              You&apos;re all set 🎉
            </p>
            <p className="mt-2 text-on-surface-variant">
              Welcome aboard — we&apos;ve created your account for{" "}
              <strong>{context.email}</strong>, saved your consent, and taken
              payment.
            </p>
          </div>
        );

      // "signup" is never shown in the modal — it lives in the hero.
      default:
        return null;
    }
  }

  return (
    <>
      <BookingHero>
        {bookingStarted ? (
          <ResumeBooking
            firstName={context.firstName}
            onResume={() => setModalOpen(true)}
          />
        ) : (
          <SignupForm variant="hero" onComplete={handleSignupComplete} />
        )}
      </BookingHero>

      <Modal
        open={modalOpen && bookingStarted}
        onClose={() => setModalOpen(false)}
        label="Complete your assessment booking"
      >
        {renderModalStep()}
      </Modal>
    </>
  );
}

"use client";

import { useCallback, useState } from "react";
import { Button } from "@pbh/ui";
import { SignupForm, type SignupResult } from "./signup";
import { DetailsForm } from "./details";
import { ConsentForm } from "./consent";
import { PaymentStep } from "./payment";

/**
 * Single-page stepper for the get-started funnel. State lives in client memory
 * for the session: `step` is the current index into STEPS, `context` is data
 * accumulated across steps (userId/email from signup, …).
 *
 * To add a step later: add an entry to STEPS and a case to renderStep — the
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
    },
    [advance],
  );

  const handleStepComplete = useCallback(() => {
    advance();
  }, [advance]);

  const step: Step = STEPS[stepIndex];

  switch (step) {
    case "signup":
      return <SignupForm onComplete={handleSignupComplete} />;

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
      // userId is guaranteed once we've advanced past signup.
      return (
        <ConsentForm
          userId={context.userId ?? ""}
          onComplete={handleStepComplete}
        />
      );

    case "payment":
      // Paying registers + enrolls server-side and drops the assessment cookie;
      // on success we advance to the confirmation step (below), which links to
      // /assessments — the cookie is already set so that page authorizes.
      return (
        <PaymentStep
          userId={context.userId ?? ""}
          onComplete={handleStepComplete}
        />
      );

    case "done":
      return (
        <div className="mt-8 rounded-xl border border-secondary/30 bg-secondary/5 p-6">
          <p className="font-headline text-lg text-primary">
            You&apos;re all set 🎉
          </p>
          <p className="mt-2 text-on-surface-variant">
            Welcome aboard — we&apos;ve created your account for{" "}
            <strong>{context.email}</strong>, saved your consent, and taken
            payment.
          </p>
          <Button href="/assessments" color="primary" className="mt-6">
            Continue to your assessments
          </Button>
        </div>
      );
  }
}

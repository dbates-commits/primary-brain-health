"use client";

import { Button, Heading } from "@pbh/ui";
import type { ModalStep } from "./steps";
import { BookingOverviewRow } from "./BookingOverviewRow";
import {
  DISPLAY_STEPS,
  DISPLAY_STEP_MODELS,
  displayKeyFor,
  displayStatus,
  isStepActionable,
  type BookingProgressStep,
  type DisplayStepKey,
} from "./step-model";

interface BookingOverviewPaneProps {
  /** The furthest point the booking has reached. */
  furthestStep: BookingProgressStep;
  /** The step the CTA leads to. */
  activeStep: ModalStep;
  /** Continue into `activeStep`. */
  onStart: () => void;
  /** Jump back to a completed, re-enterable step. */
  onSelectStep: (key: DisplayStepKey) => void;
}

/**
 * What the booking modal shows before its steps (Figma 2063:583): where you are,
 * what is left, and one button into the next thing.
 *
 * Shown when someone comes back to a booking that already has progress behind
 * it — never on the way into the confirmation gate, where a summary of four
 * untaken steps would be an obstacle rather than orientation. `BookingStepFlow`
 * owns that trigger.
 *
 * It greets by state rather than by identity — **"Welcome!"** when nothing is
 * behind them, **"Welcome Back!"** once anything is. That test never asks
 * whether a cookie exists, which matters because the booking cookie is HttpOnly
 * and the browser cannot read it: the honest answer for *no cookie*, *expired
 * cookie* and *deleted account* alike is "no progress". Given the trigger above,
 * "Welcome!" is not reachable today — the branch stays because the greeting is
 * this component's own business, and a caller that opens it earlier should not
 * have to know to pass a flag.
 *
 * Someone returning after the booking cookie's two hours is not recognised at
 * all, which is why the signup form offers them the sign-in path instead.
 *
 * The CTA is labelled from `activeStep`, not from the first incomplete row. At
 * the email gate it reads "Confirm Your Email" even though the gate has no row
 * of its own: never offer an action that cannot be taken.
 */
export function BookingOverviewPane({
  furthestStep,
  activeStep,
  onStart,
  onSelectStep,
}: BookingOverviewPaneProps) {
  const progress = { furthestStep, activeStep };
  const returning = furthestStep !== "confirm";
  const ctaLabel =
    activeStep === "confirm"
      ? "Confirm Your Email"
      : DISPLAY_STEP_MODELS[displayKeyFor(activeStep)].actionLabel;

  return (
    <div className="flex flex-col gap-8 pb-6 sm:pb-8">
      <div className="flex flex-col gap-4">
        <Heading as="h2" size="lg" className="font-thin leading-[1.06]">
          {returning ? "Welcome Back!" : "Welcome!"}
        </Heading>
        <p className="font-body text-base leading-[1.4] text-text-secondary">
          You&rsquo;re taking the right path for your brain health. This is what
          you can expect in order to complete your onboarding process.
        </p>
      </div>

      <ol className="flex flex-col">
        {DISPLAY_STEPS.map((key) => (
          <BookingOverviewRow
            key={key}
            stepKey={key}
            status={displayStatus(key, progress)}
            actionable={isStepActionable(key, progress)}
            onSelect={onSelectStep}
          />
        ))}
      </ol>

      <Button color="primary" onClick={onStart} className="w-full">
        {ctaLabel}
      </Button>
    </div>
  );
}

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
 * Shown on every open until the booking is finished, and greeting by state
 * rather than by identity — **"Welcome!"** when nothing is behind them,
 * **"Welcome Back!"** once anything is. That test never asks whether a cookie
 * exists, which matters because the booking cookie is HttpOnly and the browser
 * cannot read it: the honest answer for *no cookie*, *expired cookie* and
 * *deleted account* alike is "no progress", which reads as a first visit. So
 * someone returning after the cookie's two hours is greeted as new — a known
 * limit, not a bug, and the reason a stranded returner is offered the sign-in
 * path instead.
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

"use client";

import type { ModalStep } from "./steps";
import { BookingStepperTab } from "./BookingStepperTab";
import {
  DISPLAY_STEPS,
  displayStatus,
  isStepActionable,
  type BookingProgressStep,
  type DisplayStepKey,
} from "./step-model";

interface BookingStepperProps {
  /** The furthest point the booking has reached. */
  furthestStep: BookingProgressStep;
  /** The step on screen, which may be behind `furthestStep`. */
  activeStep: ModalStep;
  onSelectStep: (key: DisplayStepKey) => void;
}

/**
 * The four-tab progress band above the booking modal's body (Figma 2060:5600).
 *
 * **A `<nav>`, not a `role="tablist"`.** ARIA tabs promise three things this
 * cannot keep: that every tab is selectable, that arrow keys move between them
 * via a roving `tabindex`, and that `aria-selected` means "this panel is now
 * shown". Here three of the four are permanently inert, the "panels" are a
 * linear wizard with server writes and a Stripe session between them, and the
 * meaning being conveyed is *progress* — which `aria-current="step"` states
 * directly and `aria-selected` does not. Wiring arrow keys that mostly do
 * nothing would be worse than not offering them.
 *
 * Rendered through `Modal`'s `banner` slot rather than its `header`: the header
 * region is inset by `px-6 … sm:px-8` with a `pr-14` gutter, which a bordered
 * band spanning the panel cannot live inside. Figma's `rounded-t-[12px]` is
 * dropped — the panel is `rounded-3xl overflow-hidden` and already clips it.
 */
export function BookingStepper({
  furthestStep,
  activeStep,
  onSelectStep,
}: BookingStepperProps) {
  const progress = { furthestStep, activeStep };

  return (
    <nav aria-label="Booking progress">
      <ol className="flex w-full border-b border-neutral-350 bg-surface">
        {DISPLAY_STEPS.map((key) => (
          <BookingStepperTab
            key={key}
            stepKey={key}
            status={displayStatus(key, progress)}
            actionable={isStepActionable(key, progress)}
            onSelect={onSelectStep}
          />
        ))}
      </ol>
    </nav>
  );
}

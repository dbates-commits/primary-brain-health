"use client";

import { PhosphorIcon, cn } from "@pbh/ui";
import {
  DISPLAY_STEPS,
  DISPLAY_STEP_MODELS,
  type DisplayStepKey,
  type DisplayStepStatus,
} from "./step-model";

interface BookingStepperTabProps {
  stepKey: DisplayStepKey;
  status: DisplayStepStatus;
  /** True only for a completed, re-enterable step — in practice just Details. */
  actionable: boolean;
  onSelect: (key: DisplayStepKey) => void;
}

const STATUS_WORD: Record<DisplayStepStatus, string> = {
  done: "Completed",
  current: "Current step",
  upcoming: "Not started",
};

/**
 * One tab of the booking stepper (Figma 2060:5600).
 *
 * **An inert tab is a plain `<span>`, not a disabled button.** A
 * `<button disabled>` announces itself as a dimmed button and invites a click
 * that will never do anything; `aria-disabled` on a non-interactive element is
 * noise. Rendering nothing focusable means there is no click to refuse, no error
 * state to design, and — because `Modal`'s focus trap selects
 * `button:not([disabled])` — no work to do for the keyboard either.
 *
 * The status also reaches a screen reader as words, not only as a colour and a
 * 4px underline.
 */
export function BookingStepperTab({
  stepKey,
  status,
  actionable,
  onSelect,
}: BookingStepperTabProps) {
  const model = DISPLAY_STEP_MODELS[stepKey];
  const position = DISPLAY_STEPS.indexOf(stepKey) + 1;

  const body = (
    <>
      <PhosphorIcon
        name={model.tabIcon}
        aria-hidden="true"
        size={24}
        weight="regular"
        className="shrink-0"
      />
      <span className="sr-only">
        Step {position} of {DISPLAY_STEPS.length}, {STATUS_WORD[status]}.
      </span>
      <span className="min-w-0 flex-1 text-left font-body text-xs leading-normal">
        {model.tabLabel}
      </span>
    </>
  );

  const shell = cn(
    "flex h-[60px] w-full items-center gap-2 overflow-clip px-4",
    status === "current"
      ? "border-b-4 border-primary bg-background-brand-subtle text-on-surface-variant"
      : "text-text-secondary",
  );

  return (
    <li className="flex flex-1">
      {actionable ? (
        <button
          type="button"
          onClick={() => {
            onSelect(stepKey);
          }}
          // Says what pressing it does, rather than repeating the caption.
          aria-label={`${model.tabLabel} — completed, edit`}
          className={cn(
            shell,
            "cursor-pointer transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
          )}
        >
          {body}
        </button>
      ) : (
        <span
          // `aria-current` is the honest semantic here: this is progress, not a
          // tab panel being revealed. See the note on `<nav>` in BookingStepper.
          aria-current={status === "current" ? "step" : undefined}
          className={cn(shell, "cursor-default")}
        >
          {body}
        </span>
      )}
    </li>
  );
}

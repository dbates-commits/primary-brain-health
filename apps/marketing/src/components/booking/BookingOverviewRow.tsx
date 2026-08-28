"use client";

import { PhosphorIcon, cn } from "@pbh/ui";
import {
  DISPLAY_STEPS,
  DISPLAY_STEP_MODELS,
  type DisplayStepKey,
  type DisplayStepStatus,
} from "./step-model";

interface BookingOverviewRowProps {
  stepKey: DisplayStepKey;
  status: DisplayStepStatus;
  actionable: boolean;
  onSelect: (key: DisplayStepKey) => void;
}

const STATUS_WORD: Record<DisplayStepStatus, string> = {
  done: "Completed",
  current: "Current step",
  upcoming: "Not started",
};

/**
 * One row of the overview pane's step list (Figma 2063:583).
 *
 * Three looks, exactly as the design draws them: a completed step is greyed with
 * a green check, the current one is brand-coloured with a chevron, and an
 * upcoming one is plain with no trailing mark. The trailing element is the only
 * affordance, so a row with none is visibly not a control — which matches the
 * fact that it isn't one. Same reasoning as `BookingStepperTab`: inert rows
 * render no focusable element rather than a disabled button.
 */
export function BookingOverviewRow({
  stepKey,
  status,
  actionable,
  onSelect,
}: BookingOverviewRowProps) {
  const model = DISPLAY_STEP_MODELS[stepKey];
  const position = DISPLAY_STEPS.indexOf(stepKey) + 1;

  const body = (
    <>
      <PhosphorIcon
        name={model.rowIcon}
        aria-hidden="true"
        size={36}
        weight="regular"
        className="shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="font-body text-caption uppercase leading-normal">
          Step {position}
        </span>
        <span className="font-body text-body leading-normal">
          {model.overviewLabel}
        </span>
      </span>
      <span className="sr-only">{STATUS_WORD[status]}.</span>
      {status === "done" ? (
        <PhosphorIcon
          name="CheckCircle"
          aria-hidden="true"
          size={24}
          weight="fill"
          className="shrink-0 text-accent-green"
        />
      ) : null}
      {status === "current" ? (
        <PhosphorIcon
          name="CaretRight"
          aria-hidden="true"
          size={18}
          weight="regular"
          className="shrink-0"
        />
      ) : null}
    </>
  );

  const shell = cn(
    "flex w-full items-center gap-5 px-2 py-3",
    status === "done" && "text-grey-450",
    status === "current" && "text-brand-default",
    status === "upcoming" && "text-text-default",
  );

  return (
    <li className="border-t border-grey-350 first:border-t-0">
      {actionable ? (
        <button
          type="button"
          onClick={() => {
            onSelect(stepKey);
          }}
          aria-label={`${model.overviewLabel} — completed, edit`}
          className={cn(
            shell,
            "cursor-pointer rounded-lg transition-colors hover:bg-background-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-default",
          )}
        >
          {body}
        </button>
      ) : (
        <span
          aria-current={status === "current" ? "step" : undefined}
          className={cn(shell, "cursor-default")}
        >
          {body}
        </span>
      )}
    </li>
  );
}

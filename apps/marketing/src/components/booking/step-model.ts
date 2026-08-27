import { MODAL_STEPS, type ModalStep } from "./steps";

/**
 * What the customer is shown about their own progress — the overview pane
 * (Figma 2063:583) and the stepper band (2060:5600).
 *
 * **These are not `MODAL_STEPS`.** That array is the four screens the flow
 * walks, and it is load-bearing elsewhere: the Modals collection has one
 * document per entry, `/internal/modals/[step]` validates its URL segment
 * against it, and a content test asserts the documents on disk match it exactly.
 * Adding a display concern to it would break all three. So this is a parallel,
 * customer-facing list, and the mapping between the two lives in `displayKeyFor`.
 *
 * Two deliberate differences from `MODAL_STEPS`:
 *
 *  - **`confirm` has no row.** Proving the email address is a precondition, not
 *    a step: it always happens once, before there is any progress to show, and
 *    both Figma frames omit it. Someone sitting at that gate sees today's screen
 *    with no stepper and no overview.
 *  - **`assessments` is not a modal step at all.** It is `/welcome`, reached
 *    after payment and outside this component entirely. It appears as the
 *    outbound promise — where this ends up — and is never actionable.
 *
 * Imports only `./steps`, and declares its own progress type rather than
 * importing `BookingResumeStep`, so a `"server-only"` module can never be pulled
 * into a client component by an accidental value import.
 */

/** How far a booking has got. `BookingResumeStep`'s shape, kept client-safe. */
export type BookingProgressStep = ModalStep | "done";

export const DISPLAY_STEPS = [
  "details",
  "consent",
  "payment",
  "assessments",
] as const;

export type DisplayStepKey = (typeof DISPLAY_STEPS)[number];

/**
 * Phosphor glyph names, as a closed union rather than `string`.
 *
 * `PhosphorIcon` renders `null` for a name it doesn't recognise, so a typo would
 * otherwise be an invisible gap in the row rather than a build failure. Every
 * name here is verified present in the installed `@phosphor-icons/react`.
 */
export type StepIconName =
  | "UserCircleCheck"
  | "SealCheck"
  | "Signature"
  | "StripeLogo"
  | "ClipboardText";

export interface DisplayStepModel {
  key: DisplayStepKey;
  /** The stepper's 12px caption. Wraps onto two lines by design. */
  tabLabel: string;
  /** The overview row's 16px label. */
  overviewLabel: string;
  /** What the overview's button says when this step is the one to do next. */
  actionLabel: string;
  tabIcon: StepIconName;
  /**
   * Figma draws the consent step with a seal in the stepper and a signature in
   * the overview. Both are carried rather than reconciled in code — raise the
   * inconsistency with design, don't silently pick one.
   */
  rowIcon: StepIconName;
  /**
   * Whether a customer may go back into this step once it is behind them.
   *
   * Only Details. It is a plain idempotent `UPDATE` (see `completeProfileCore`).
   * Consent writes append-only rows that no constraint stops it duplicating
   * (pbh-3u1), and Payment mints a fresh Stripe Checkout Session on every mount
   * with no already-paid guard (pbh-ypf) — re-entry there is a double charge.
   * Neither lock is safe to relax before those land.
   */
  reenterable: boolean;
}

export const DISPLAY_STEP_MODELS: Record<DisplayStepKey, DisplayStepModel> = {
  details: {
    key: "details",
    tabLabel: "Personal Information",
    overviewLabel: "Complete Personal Information",
    actionLabel: "Complete Personal Information",
    tabIcon: "UserCircleCheck",
    rowIcon: "UserCircleCheck",
    reenterable: true,
  },
  consent: {
    key: "consent",
    tabLabel: "Sign Consent Form",
    overviewLabel: "Sign Consent Form",
    actionLabel: "Sign Consent Form",
    tabIcon: "SealCheck",
    rowIcon: "Signature",
    reenterable: false,
  },
  payment: {
    key: "payment",
    tabLabel: "Complete Payment Details",
    overviewLabel: "Complete Payment",
    actionLabel: "Complete Payment",
    tabIcon: "StripeLogo",
    rowIcon: "StripeLogo",
    reenterable: false,
  },
  assessments: {
    key: "assessments",
    tabLabel: "Start Assessment",
    overviewLabel: "Start Assessments",
    // Never used: `assessments` is never the active step inside the modal — the
    // flow leaves for /welcome first. Present so the record is total.
    actionLabel: "Start Assessments",
    tabIcon: "ClipboardText",
    rowIcon: "ClipboardText",
    reenterable: false,
  },
};

/**
 * Which row a given point in the flow belongs to.
 *
 * `confirm` maps to `details` because they are the same objective from the
 * customer's side — tell us who you are — and because neither design draws the
 * gate. The one place that must stay honest about the difference is the
 * overview's button, which reads "Confirm Your Email" while they are actually
 * behind the gate: never offer an action that cannot be taken.
 */
export function displayKeyFor(step: BookingProgressStep): DisplayStepKey {
  if (step === "confirm" || step === "details") {
    return "details";
  }
  if (step === "done") {
    return "assessments";
  }
  return step;
}

function displayOrder(key: DisplayStepKey): number {
  return DISPLAY_STEPS.indexOf(key);
}

/** Where `step` sits in the display order, for comparing two points in the flow. */
export function progressOrder(step: BookingProgressStep): number {
  if (step === "confirm") {
    // Below every row: nothing is complete until the address is proven.
    return -1;
  }
  return displayOrder(displayKeyFor(step));
}

export type DisplayStepStatus = "done" | "current" | "upcoming";

interface ProgressInput {
  /** The furthest point reached, from the resume resolver or from advancing. */
  furthestStep: BookingProgressStep;
  /** The step being shown right now, which may be behind `furthestStep`. */
  activeStep: ModalStep;
}

/**
 * A row's status, derived from the ordinal rather than read per-step.
 *
 * `resolveBookingResumeState` is a short-circuited chain of ordered gates that
 * returns at the first unmet one, precisely so it doesn't run the later queries.
 * Asking it for a per-step map would mean running all four on every open to
 * report something the ordering already implies — and would admit states the
 * flow cannot reach, like consent done with details not, which the UI would then
 * need an opinion about.
 *
 * Two inputs, not one, because the expired-link path parks someone at `confirm`
 * while later state exists; that branch clamps `furthestStep` to match.
 */
export function displayStatus(
  key: DisplayStepKey,
  { furthestStep, activeStep }: ProgressInput,
): DisplayStepStatus {
  if (key === displayKeyFor(activeStep)) {
    return "current";
  }
  if (displayOrder(key) < progressOrder(furthestStep)) {
    return "done";
  }
  return "upcoming";
}

/**
 * Whether this row is a control the customer can press.
 *
 * Completed *and* re-enterable — in practice exactly Details, and only once it is
 * behind them. Everything else renders as inert text, with no handler and nothing
 * focusable, so there is no click to refuse and no error to show.
 */
export function isStepActionable(
  key: DisplayStepKey,
  progress: ProgressInput,
): boolean {
  return (
    DISPLAY_STEP_MODELS[key].reenterable &&
    displayStatus(key, progress) === "done"
  );
}

/** The modal step a display row sends the customer to. */
export function modalStepFor(key: DisplayStepKey): ModalStep | null {
  if (key === "assessments") {
    return null;
  }
  return key;
}

/** The index `stepIndex` must take to show a display row's step. */
export function stepIndexFor(key: DisplayStepKey): number {
  const step = modalStepFor(key);
  if (!step) {
    return -1;
  }
  return MODAL_STEPS.indexOf(step);
}

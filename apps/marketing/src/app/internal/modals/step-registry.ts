import { MODAL_STEPS, type ModalStep } from "@/components/booking/steps";

export interface StepPreviewMeta {
  /** How the step is listed in the Modals collection, for continuity. */
  name: string;
  /** Where the customer is when they see it, for context while editing. */
  when: string;
}

/**
 * Labels for the preview pages. Deliberately code-owned rather than read from
 * the `step` field of each Modals document: this is scaffolding around the
 * preview, not copy anyone should be able to change from the CMS.
 *
 * Keyed by `ModalStep`, so a new step is a typecheck failure here.
 */
export const STEP_META: Record<ModalStep, StepPreviewMeta> = {
  confirm: {
    name: "1 · Email Confirmation",
    when: "Straight after signup, while the confirmation link sits unclicked in their inbox. The flow stops here until it is.",
  },
  details: {
    name: "2 · Your Details",
    when: "First step after the link is clicked. Asks about the person being assessed; the name fields arrive prefilled with the account holder's.",
  },
  consent: {
    name: "3 · Consent",
    when: "After the details are saved. The terms have to be accepted before payment is offered.",
  },
  payment: {
    name: "4 · Payment",
    when: "Last step in the modal. Stripe's card form renders below the header; paying sends the customer to /welcome.",
  },
};

/** In flow order — `MODAL_STEPS` is the order a customer meets them in. */
export const STEP_LIST = MODAL_STEPS.map((step) => ({
  step,
  ...STEP_META[step],
}));

"use client";

import { StepHeader } from "@pbh/ui";
import { resolveStepHeader } from "@/components/booking/step-headers";
import type { ModalStep, ModalStepCopy } from "@/components/booking/steps";
import { StepBody } from "./StepBody";

/**
 * One booking-modal step, rendered outside the flow so it can be read without a
 * booking cookie, a confirmed email or a Stripe session.
 *
 * These are the real step components with inert actions, not a re-creation of
 * them — a preview that reimplemented the markup would drift from what ships
 * and quietly stop being evidence of anything.
 *
 * A client component because every step is: they hold form state through
 * `useActionState`. The server page above passes only data.
 */
export function BookingStepPreview({
  step,
  copy,
}: {
  step: ModalStep;
  /** This step's Modals document. Absent → the copy that ships in code. */
  copy?: ModalStepCopy | null;
}) {
  // Wellness: the track the booking section sells, and the only one CMS copy
  // applies to (see `resolveStepHeader`). Clinical wording comes from the
  // lexicon and is deliberately not editable.
  const header = resolveStepHeader(step, copy, "wellness");

  return (
    // Mirrors the panel in `components/booking/Modal.tsx`: same max width, same
    // pinned-header-over-scrolling-body split, and a bounded height so the body
    // actually scrolls. All three matter — copy that fits at full page width can
    // still overflow the dialog, and the steps that pin their actions with
    // `StickyActions` need a real scroll container above them or the buttons
    // land in the wrong place. A preview under different geometry would be
    // reviewing a screen that doesn't exist.
    <div className="mx-auto flex h-[min(38rem,calc(100dvh-8rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-background-default shadow-sm">
      <div className="shrink-0 px-6 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <StepHeader
          title={header.title}
          subtitle={header.subtitle}
          tinaFields={header.tinaFields}
        />
      </div>
      {/* No bottom padding, as in the modal: it would inset where a sticky
          action bar pins. Each step supplies its own. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8">
        <StepBody step={step} copy={copy} />
      </div>
    </div>
  );
}

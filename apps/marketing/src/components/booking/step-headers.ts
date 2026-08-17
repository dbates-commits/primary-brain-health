import { tinaField } from "tinacms/dist/react";
import { DETAILS_HEADER, PAYMENT_HEADER, consentHeader } from "@pbh/booking";
import type { Track } from "@pbh/copy";
import { CONFIRM_HEADER } from "./EmailConfirmationStep";
import {
  MODAL_STEPS,
  type ModalStep,
  type ModalStepCopy,
  type ModalStepCopyMap,
} from "./steps";

export interface ResolvedStepHeader {
  title: string;
  subtitle?: string;
  tinaFields?: { title?: string; subtitle?: string };
}

/**
 * An unset field is `undefined`, a cleared one is `""`, and an editor can leave
 * whitespace behind. All three mean "use the copy that ships in code" — decided
 * here, once, so no step can render a blank header.
 */
function used(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * `tinaField` returns the empty string when the document carries no editing
 * metadata (the live site, or a failed query), and an empty
 * `data-tina-field=""` on every heading is worse than no attribute at all.
 */
function path(
  copy: ModalStepCopy | null | undefined,
  field: "title" | "subtitle",
): string | undefined {
  return copy ? tinaField(copy, field) || undefined : undefined;
}

/** What each step says when its Modals document is empty. */
function fallback(
  step: ModalStep,
  track: Track,
): { title: string; subtitle?: string } {
  switch (step) {
    case "confirm":
      return CONFIRM_HEADER;
    case "details":
      return DETAILS_HEADER;
    case "consent":
      // Called unconditionally, whatever the CMS holds, so the track-aware
      // lexicon lookup always happens and a CMS value can only shadow it.
      return consentHeader(track);
    case "payment":
      return PAYMENT_HEADER;
  }
}

/**
 * Resolve one step's header: CMS copy where an editor has written some, the
 * code constant otherwise.
 *
 * The Modals documents hold WELLNESS copy. `noClinicalVocabulary` (the Tina
 * `ui.validate` guarding those fields) rejects clinical vocabulary on save, so
 * they physically cannot hold the clinical consent subtitle — which says "…your
 * assessment and consultation". Letting a CMS value win on the clinical track
 * would therefore not override that wording, it would delete it, and understate
 * what a Comprehensive customer bought. So the override applies on the wellness
 * track only. That branch is dormant while the $149 package is the only one the
 * booking section offers, but it is what makes the guarantee true rather than
 * merely likely; when Comprehensive is offered again the answer is a second,
 * clinically validated set of documents, not removing this rule.
 */
export function resolveStepHeader(
  step: ModalStep,
  copy: ModalStepCopy | null | undefined,
  track: Track,
): ResolvedStepHeader {
  const editable = track === "wellness";
  const code = fallback(step, track);
  return {
    title: (editable ? used(copy?.title) : undefined) ?? code.title,
    subtitle: (editable ? used(copy?.subtitle) : undefined) ?? code.subtitle,
    tinaFields: editable
      ? { title: path(copy, "title"), subtitle: path(copy, "subtitle") }
      : undefined,
  };
}

/** Every step's header, for the modal, which renders all four in turn. */
export function resolveStepHeaders(
  copy: ModalStepCopyMap | null | undefined,
  track: Track,
): Record<ModalStep, ResolvedStepHeader> {
  return Object.fromEntries(
    MODAL_STEPS.map((step) => [step, resolveStepHeader(step, copy?.[step], track)]),
  ) as Record<ModalStep, ResolvedStepHeader>;
}

"use client";

import { useTina } from "tinacms/dist/react";
import type { ModalQuery, ModalQueryVariables } from "@tina/__generated__/types";
import type { ModalStep } from "@/components/booking/steps";
import { BookingStepPreview } from "../BookingStepPreview";

/**
 * The Tina half of a step preview, mirroring `components/PageClient.tsx`.
 *
 * `useTina` is what makes this an editing surface rather than a static render:
 * it registers this document's form, so the admin shows Step / Title / Subtitle
 * beside the preview, edits appear as they are typed, and clicking the heading
 * jumps to its field.
 *
 * One query means one form in the sidebar, and here that form is exactly the
 * step being looked at — which is the whole reason the copy lives in its own
 * collection rather than on the home page's document.
 */
export function ModalStepClient({
  step,
  data,
  query,
  variables,
}: {
  step: ModalStep;
  data: ModalQuery;
  query: string;
  variables: ModalQueryVariables;
}) {
  const { data: tinaData } = useTina({ query, variables, data });

  return <BookingStepPreview step={step} copy={tinaData?.modal} />;
}

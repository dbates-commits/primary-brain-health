"use client";

import { useTina } from "tinacms/dist/react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { ModalStepCopyMap } from "@/components/booking/steps";

export function PageClient({
  data,
  query,
  variables,
  modalCopy,
  consentStamp,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  query: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any;
  /**
   * Booking-modal step headers from the Modals collection. Passed through
   * rather than queried here: it is a different document to the page, so it
   * rides alongside `useTina` rather than through it.
   *
   * Absent on a page with no booking block — see `getBookingModalProps`.
   */
  modalCopy?: ModalStepCopyMap;
  /** Signed alongside `modalCopy`; the two describe the same render. */
  consentStamp?: string;
}) {
  const { data: tinaData } = useTina({
    query,
    variables,
    data,
  });

  return (
    <BlockRenderer
      blocks={tinaData?.page?.blocks}
      data={tinaData?.page}
      modalCopy={modalCopy}
      consentStamp={consentStamp}
    />
  );
}

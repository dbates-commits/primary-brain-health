import "server-only";

import { createConsentStamp } from "@pbh/booking/server";
import { client } from "@tina/__generated__/client";
import { hasBookingBlock } from "./booking-block";
import { resolveConsentTerms } from "./consent-copy";
import { isModalStep, type ModalStepCopyMap } from "./steps";

/**
 * The Modals collection, keyed by step, for the booking modal to title its
 * steps with.
 *
 * One connection query rather than four document fetches: the four documents
 * are always wanted together, and the modal renders inside a page that is
 * already doing a Tina round trip.
 *
 * Never throws, and an empty result is a perfectly good one. Every step falls
 * back to the copy that ships in code (`resolveStepHeader`), which is also the
 * normal state — the documents start with nothing but their admin label. That
 * matters most on a preview deployment, where TinaCloud serves `main`'s indexed
 * schema and this query fails outright until the collection is merged.
 *
 * Deliberately not exported: reading the copy without minting the stamp beside
 * it is how the recorded consent version drifts from the agreement on screen.
 * `getBookingModalProps` is the way in.
 */
async function getModalStepCopy(): Promise<ModalStepCopyMap> {
  const copy: ModalStepCopyMap = {};
  try {
    const result = await client.queries.modalConnection();
    for (const edge of result.data.modalConnection.edges ?? []) {
      const node = edge?.node;
      const step = node?._sys.filename;
      // A document whose filename isn't a known step has nowhere to render;
      // ignoring it beats letting it shadow one that does.
      if (node && step && isModalStep(step)) {
        copy[step] = {
          title: node.title,
          subtitle: node.subtitle,
          // Only the consent step's template carries an agreement; the other
          // three have no such fields to read.
          ...(node.__typename === "ModalConsentStep"
            ? { terms: node.terms, termsVersion: node.termsVersion }
            : {}),
        };
      }
    }
  } catch (error) {
    console.error("[modals] could not read the step copy:", error);
  }
  return copy;
}

/** What a page hands the booking flow, or nothing when it doesn't carry one. */
export interface BookingModalProps {
  modalCopy?: ModalStepCopyMap;
  consentStamp?: string;
}

/**
 * The booking flow's CMS props for one page.
 *
 * Skipped entirely for a page with no booking block: the consent agreement is a
 * whole rich-text tree, and fetching it unconditionally serializes it into
 * every page's RSC payload for nothing.
 *
 * The stamp is minted here, next to the read it describes, so the version
 * recorded against a consent can only ever be the one belonging to the terms
 * this render put on screen. Deriving it anywhere else — most of all at submit
 * time — is what lets the two drift apart.
 */
export async function getBookingModalProps(
  blocks: unknown,
): Promise<BookingModalProps> {
  if (!hasBookingBlock(blocks)) {
    return {};
  }

  const modalCopy = await getModalStepCopy();
  try {
    return {
      modalCopy,
      consentStamp: createConsentStamp(
        resolveConsentTerms(modalCopy.consent).version,
      ),
    };
  } catch (error) {
    // Only an unconfigured BOOKING_RESUME_SECRET gets here, which already
    // breaks signup (it signs the booking cookie) long before anyone reaches
    // consent. Rendering the page without a stamp keeps that a booking-flow
    // failure rather than making the marketing site 500 for every visitor.
    console.error("[modals] could not stamp the consent terms:", error);
    return { modalCopy };
  }
}

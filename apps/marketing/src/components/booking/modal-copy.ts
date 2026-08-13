import "server-only";

import { client } from "@tina/__generated__/client";
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
 */
export async function getModalStepCopy(): Promise<ModalStepCopyMap> {
  const copy: ModalStepCopyMap = {};
  try {
    const result = await client.queries.modalConnection();
    for (const edge of result.data.modalConnection.edges ?? []) {
      const node = edge?.node;
      const step = node?._sys.filename;
      // A document whose filename isn't a known step has nowhere to render;
      // ignoring it beats letting it shadow one that does.
      if (node && step && isModalStep(step)) {
        copy[step] = { title: node.title, subtitle: node.subtitle };
      }
    }
  } catch (error) {
    console.error("[modals] could not read the step copy:", error);
  }
  return copy;
}

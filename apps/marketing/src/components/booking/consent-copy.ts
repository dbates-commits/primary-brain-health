import { hasRichTextContent } from "@/lib/rich-text";
import type { ModalStepCopy } from "./steps";

export interface ResolvedConsentTerms {
  /**
   * The CMS agreement to render, or null when the terms that ship in code are
   * what the customer sees.
   */
  content: unknown | null;
  /**
   * Names `content`, and is null whenever `content` is — the whole point of
   * resolving the two together. `recordConsentCore` falls back to the
   * code-owned `CONSENT_VERSION` for a null version, which is the true answer
   * precisely when there is no CMS agreement to name.
   */
  version: string | null;
}

/**
 * Decide, in one place, what the consent step shows and what that is called.
 *
 * These two fields are independent in the CMS and mean nothing apart: an editor
 * can clear the agreement and leave last month's version behind, and the
 * version field's `ui.validate` only enforces the other direction (terms
 * require a version, never the reverse). Read separately, that leaves every
 * subsequent consent row stamped with a version whose text nobody was ever
 * shown — permanently, since the rows are append-only.
 *
 * So there is no way to ask for one without the other. A version survives only
 * when it has terms to name.
 */
export function resolveConsentTerms(
  copy?: ModalStepCopy | null,
): ResolvedConsentTerms {
  if (!hasRichTextContent(copy?.terms)) {
    return { content: null, version: null };
  }
  return { content: copy?.terms, version: copy?.termsVersion?.trim() || null };
}

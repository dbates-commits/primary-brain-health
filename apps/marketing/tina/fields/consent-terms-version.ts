import { hasRichTextContent } from "../../src/lib/rich-text";

/**
 * Tina `ui.validate` for the consent step's terms version.
 *
 * This string is stamped on every `consents` row as the record of WHICH
 * agreement a customer accepted, and those rows are append-only — there is no
 * second chance to get it right. So it is required the moment the terms
 * themselves are written: CMS terms with no version would leave the audit trail
 * pointing at a code-owned version whose text is not what was on screen.
 *
 * It is otherwise free-form. A date is the obvious choice and the description
 * says so, but a team that versions differently shouldn't be blocked — the
 * check is only that it reads as a label rather than a sentence.
 *
 * The reverse pairing — a version left behind after the terms are cleared — is
 * deliberately not blocked here, since an editor may well write the version
 * before the agreement. `resolveConsentTerms` drops such a version rather than
 * recording it, and the content sweep flags one left on disk.
 */
export function consentTermsVersion(
  value: unknown,
  allValues: { [key: string]: unknown },
): string | undefined {
  const version = typeof value === "string" ? value.trim() : "";

  if (version === "") {
    // Empty is fine while the terms are too — that pairing means "the whole
    // agreement ships from code", and the code-owned version describes it.
    return hasRichTextContent(allValues?.terms)
      ? "Set a version whenever the consent terms are written here, e.g. 2026-08-13. It is recorded against every customer who accepts these terms, and those records can't be corrected later."
      : undefined;
  }

  if (/\s/.test(version)) {
    return "Use a single token with no spaces, e.g. 2026-08-13 — this is an identifier stored on consent records, not a description.";
  }

  if (version.length > 40) {
    return "Keep the version under 40 characters.";
  }

  return undefined;
}

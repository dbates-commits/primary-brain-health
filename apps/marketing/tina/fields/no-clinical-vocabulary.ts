import { findBannedTerms } from "@pbh/copy";

/**
 * Tina `ui.validate` for the Modals collection's step headers.
 *
 * Those headers render against a wellness-coded purchase — the only
 * purchasable package is the $149 basic one, and `TRACK_BY_PACKAGE.basic` is
 * `"wellness"` (packages/booking/src/track.ts). Clinical vocabulary there is a
 * claim about what was sold rather than a wording preference, which is why the
 * same list that guards the code lexicon guards these fields; see the scope
 * note in packages/copy/src/banned-terms.ts for what is on the list and,
 * deliberately, what is not.
 *
 * Returning a string blocks the save: Tina disables Save while the form has
 * validation errors. That is the point — a violation is not something to warn
 * about and let through.
 *
 * Empty is valid. An empty field means "use the copy that ships in code", which
 * is how a blank CMS field can never ship a blank step header.
 *
 * This is a floor, not a substitute for compliance review, and it only runs in
 * the admin UI — the CI sweep in content/modal-copy.test.ts is what covers copy
 * that never went through this form.
 */
export function noClinicalVocabulary(value: unknown): string | undefined {
  return check(typeof value === "string" ? value : "");
}

function check(text: string): string | undefined {
  if (text.trim() === "") {
    return undefined;
  }
  const hits = findBannedTerms(text, "modal");
  if (hits.length === 0) {
    return undefined;
  }
  // `findBannedTerms` matches without the global flag, so this is one example
  // per banned pattern rather than every occurrence — the message says "such
  // as" instead of promising a complete list.
  const words = [...new Set(hits.map((hit) => hit.match))].join(", ");
  return (
    `Clinical wording isn’t allowed on this screen — such as: ${words}. ` +
    `The booking modal sells a wellness assessment and a results review, not a ` +
    `consultation, diagnosis or treatment, and not care from a specialist, ` +
    `physician, clinician or neurologist. Reword the line and save again.`
  );
}

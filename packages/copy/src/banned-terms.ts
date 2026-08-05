/**
 * Vocabulary that must never appear on a wellness surface.
 *
 * This is a compliance guard, not a style rule. Per
 * docs/sow2/technical/stripe-architecture.md the offering sits at the
 * wellness/medical seam for MCC and HSA/FSA purposes, so these words rendered
 * against a wellness-coded purchase are claims about what was sold.
 *
 * Scope note — the bare word "medical" is deliberately NOT banned. Wellness
 * copy legitimately needs it for negative disclaimers ("this is not medical
 * care"), and banning it would push authors toward vaguer language that says
 * less. The list below is limited to clinical role nouns, clinical actions and
 * the clinical name for the visit itself, where any occurrence on the wellness
 * path is wrong regardless of framing.
 *
 * This is a floor, not a substitute for compliance review.
 */
export const CLINICAL_ONLY_PATTERNS: readonly RegExp[] = [
  /\bspecialists?\b/i,
  /\bphysicians?\b/i,
  /\bclinicians?\b/i,
  /\bneurologists?\b/i,
  /\bdiagnos\w*/i,
  /\bprescri\w*/i,
  /\btreatments?\b/i,
  // The clinical track's own name for the visit
  // (`TERMS.clinical["visit.name"]`); wellness calls it a "results review".
  // Deliberately the noun and not the `\bconsult\w*` stem the neighbours above
  // use — a stem also catches "consult your doctor before…", which is the same
  // kind of negative disclaimer the "medical" carve-out above exists to allow.
  /\bconsultations?\b/i,
];

export interface BannedTermHit {
  /** Where the text came from, e.g. `PHRASES.wellness["consent.subtitle"]`. */
  location: string;
  /** The offending substring as it appears in the text. */
  match: string;
  pattern: string;
}

/** Every banned-term occurrence in `text`, tagged with `location`. */
export function findBannedTerms(text: string, location: string): BannedTermHit[] {
  const hits: BannedTermHit[] = [];
  for (const pattern of CLINICAL_ONLY_PATTERNS) {
    const found = text.match(pattern);
    if (found) {
      hits.push({ location, match: found[0], pattern: String(pattern) });
    }
  }
  return hits;
}

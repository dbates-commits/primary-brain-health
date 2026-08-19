import { AccountCard } from "./AccountCard";

/**
 * TODO: Current Plan — Figma 2092:13108. The `CURRENT PLAN` eyebrow with its
 * `Active` badge, the price, the plan name, a rule, and the "What's Included"
 * checklist.
 *
 * Note the 28px padding (`p-7`), not the 32px the other three use — that is the
 * design, not a slip.
 *
 * Copy warning for whoever builds this: Figma's checklist says "Clinician review
 * of results" and "Brain Health Assessment & Consultation", and both
 * `clinician` and `consultation` match `CLINICAL_ONLY_PATTERNS` in
 * `packages/copy/src/banned-terms.ts`. This card needs track-aware copy from
 * `@pbh/copy`, not the literal Figma strings.
 *
 * Stub: this card's slot in the grid is final. Everything inside, `min-h-*`
 * included, goes when the real card lands.
 */
export function PlanCard() {
  return (
    <AccountCard className="min-h-[417px] p-7">
      <p className="font-body text-base text-on-surface-variant">
        Current Plan — coming soon.
      </p>
    </AccountCard>
  );
}

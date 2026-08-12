/**
 * The one place clinical and wellness vocabulary is written down.
 *
 * Two mechanisms, used deliberately (see
 * docs/track-copy-mapping.md):
 *
 * - TERMS — nouns swapped inside otherwise-identical sentences.
 * - PHRASES — whole sentences, for anywhere the *claim* changes and not just
 *   the noun. Reach for these more often than feels necessary: word-level
 *   substitution inside a clinical sentence is how clinical claims leak onto
 *   the wellness path.
 *
 * ⚠️ The strings below are structurally correct but the wording is PLACEHOLDER
 * pending David's sign-off (see the plan's Open decisions). The keys and the
 * shape are what the code depends on; changing a value changes no call site.
 */
import type { Track } from "./track";

export type Term = { one: string; many: string };

export type TermKey = "role.reviewer" | "role.guide" | "visit.name";

/**
 * `satisfies` is load-bearing: adding a key to one track and forgetting the
 * other is a typecheck failure, not a runtime surprise on one product.
 */
export const TERMS = {
  clinical: {
    "role.reviewer": { one: "Specialist", many: "Specialists" },
    "role.guide": { one: "Care Coordinator", many: "Care Coordinators" },
    "visit.name": { one: "consultation", many: "consultations" },
  },
  wellness: {
    "role.reviewer": {
      one: "Brain Health Navigator",
      many: "Brain Health Navigators",
    },
    "role.guide": {
      one: "Brain Health Navigator",
      many: "Brain Health Navigators",
    },
    "visit.name": { one: "results review", many: "results reviews" },
  },
} as const satisfies Record<Track, Record<TermKey, Term>>;

/** Values interpolated into a phrase, e.g. `{ assessmentName: "…" }`. */
export type PhraseVars = Record<string, string>;

/**
 * A phrase is a plain string, or a function of its interpolated values. The
 * vars are loosely typed on purpose — a per-key generic buys little here and
 * costs a lot of declaration noise, and the render test below exercises every
 * function with sample vars.
 */
export type PhraseValue = string | ((vars: PhraseVars) => string);

/**
 * `booking.headline` / `booking.subheadline` are written but not yet rendered.
 * The landing section now heads *both* package cards at once, so it can't speak
 * in one track's voice; these land when a page sells a single track (the Tina
 * `track` field, PR 5 of the plan). They stay in the lexicon so the wording is
 * reviewed in one place — and so the banned-terms sweep already covers them.
 */
export type PhraseKey =
  | "signup.patientQuestion"
  | "consent.subtitle"
  | "booking.headline"
  | "booking.subheadline"
  | "assessments.intro"
  | "email.reportReady.subject"
  | "email.reportReady.body";

export const PHRASES = {
  clinical: {
    "signup.patientQuestion": "Who is this consultation for?",
    "consent.subtitle":
      "Please read the following form carefully to understand the terms of your assessment and consultation.",
    "booking.headline": "Start With a Brain Health Assessment & Consultation",
    "booking.subheadline":
      "A clinically grounded starting point to understand your cognitive health, review risk factors, and get a personalized plan for what to do next.",
    "assessments.intro": "Complete your assessments, then review your report with your Specialist.",
    "email.reportReady.subject": "Your assessment report is ready",
    "email.reportReady.body": ({ assessmentName }: PhraseVars) =>
      `The results from your ${assessmentName} have been reviewed by your Specialist and your report is now available.`,
  },
  wellness: {
    "signup.patientQuestion": "Who is this assessment for?",
    "consent.subtitle":
      "Please read the following form carefully to understand the terms of your assessment.",
    "booking.headline": "Start With a Brain Health Assessment",
    "booking.subheadline":
      "A structured starting point to understand your cognitive health, review lifestyle factors, and get a personalized plan for what to do next.",
    "assessments.intro":
      "Complete your assessments, then view your report and what it means for you.",
    "email.reportReady.subject": "Your assessment report is ready",
    "email.reportReady.body": ({ assessmentName }: PhraseVars) =>
      `Your ${assessmentName} is complete and your report is now available. Your Brain Health Navigator can walk you through what it means.`,
  },
} as const satisfies Record<Track, Record<PhraseKey, PhraseValue>>;

/**
 * Deliverables lists deliberately do NOT live here.
 *
 * `ASSESSMENT_PACKAGES` in `@pbh/booking` already owns what each package
 * includes, and that same object owns the Stripe price backing it — so the
 * bullets a customer reads and the amount they are charged cannot drift apart.
 * A second per-track list here would reintroduce exactly that drift, one axis
 * removed. The compliance sweep follows the data: `packages.test.ts` scans each
 * package's `includes` against the banned terms for the track it sells.
 */

/** Values every upgrade phrase is rendered with. */
export interface UpgradeVars extends PhraseVars {
  /**
   * The credit, already formatted for display (e.g. "$149.00"). Passed in
   * pre-formatted so this package stays dependency-free — every consumer
   * (emails, funnel, marketing) already has its own money formatter.
   */
  credit: string;
}

export type UpgradePhraseKey = "upgrade.headline" | "upgrade.body" | "upgrade.cta";

/**
 * Upgrade copy lives outside the per-track map because it only ever renders on
 * the wellness path — a clinical user has nothing to upgrade to, so a
 * `Record<Track, …>` would force a meaningless clinical half.
 *
 * ⚠️ Highest-compliance-risk strings in the system. They render on a
 * wellness-coded purchase and their whole job is to make the clinical product
 * appealing, which is precisely where someone reaches for "Specialist" to lift
 * conversion. The banned-terms test covers this object as wellness copy.
 */
export const UPGRADE_PHRASES = {
  "upgrade.headline": () => "Want a deeper look?",
  "upgrade.body": ({ credit }: UpgradeVars) =>
    `You can move up to our full brain health program, and the ${credit} you've already paid comes off the price.`,
  "upgrade.cta": () => "See what's included",
} as const satisfies Record<UpgradePhraseKey, (vars: UpgradeVars) => string>;

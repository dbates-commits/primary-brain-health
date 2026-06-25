/**
 * Display copy + ordering for each assessment, taken verbatim from the Figma
 * "Welcome Back" design (node 472-1102). Keyed by the `LINUS_CAMPAIGNS` key so
 * the page shows the Figma label/description/duration regardless of the name
 * configured in the env, and renders the cards in a fixed order (DAC first,
 * shown under "Start Here").
 */

export interface AssessmentContent {
  /** Card title, e.g. "DAC / Digital Assessment of Cognition". */
  label: string;
  /** One-line description under the title. */
  description: string;
  /** Duration label shown by the CTA, e.g. "less than 10 min". */
  duration: string;
  /** Sort order; lowest first. The first card renders as "Start Here". */
  order: number;
}

/** Keyed by the campaign `key` from `LINUS_CAMPAIGNS`. */
export const ASSESSMENT_CONTENT: Record<string, AssessmentContent> = {
  DAC: {
    label: "DAC / Digital Assessment of Cognition",
    description:
      "This is the description of the text that is simple and easy to understand.",
    duration: "less than 10 min",
    order: 0,
  },
  LHQ: {
    label: "LHQ / Lifestyle Health Questionnaire",
    description:
      "This is the description of the text that is simple and easy to understand.",
    duration: "less than 2 min",
    order: 1,
  },
  ePSOM: {
    label: "Personal Priorities Assessment",
    description:
      "Describe, in your own words, the aspects of your brain health that matter most to you—then see how they change over time.",
    duration: "less than 2 min",
    order: 2,
  },
};

/** Cards with no entry here sort after the known ones, keeping their order. */
export const ASSESSMENT_ORDER_FALLBACK = Number.MAX_SAFE_INTEGER;

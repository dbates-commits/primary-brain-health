/**
 * Option lists for the details-form selects.
 *
 * The stored `value`s are the canonical **Linus Health** enum values
 * (`sexAssignedAtBirth`, `education`) so they can be sent to the Linus API
 * verbatim, with no runtime translation. The `label`s are what the user sees.
 *
 * NOTE: the marketing consultation/intake form (IntakeForm.tsx) still writes
 * the old human-readable strings ("Male", "Bachelors (4 years)", …). The two
 * entry points have intentionally diverged for now — only the funnel feeds
 * Linus registration. Re-aligning marketing is a follow-up.
 */

/** Maps to the Linus `sexAssignedAtBirth` enum. */
export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "INTERSEX", label: "Intersex" },
  { value: "OTHER", label: "Other" },
] as const;

/** Maps to the Linus `education` enum (representative `ED_YEARS_*` per bucket). */
export const EDUCATION_LEVELS = [
  { value: "ED_YEARS_11", label: "Less than high school" },
  { value: "ED_YEARS_12", label: "High school graduate" },
  { value: "ED_YEARS_14", label: "Associate's (2 years)" },
  { value: "ED_YEARS_16", label: "Bachelor's (4 years)" },
  { value: "ED_YEARS_18", label: "Master's (6 years)" },
  { value: "ED_YEARS_20", label: "Doctorate (8+ years)" },
] as const;

/**
 * Rendered as a segmented toggle on the details step. The stored `value`s are
 * unchanged from the original select — only the visible labels track the design
 * — so this carries no data-migration impact.
 */
export const PATIENT_IDENTIFICATION_OPTIONS = [
  { value: "Self", label: "Myself" },
  { value: "Someone else", label: "Someone Else" },
] as const;

export const GENDER_VALUES = new Set<string>(
  GENDER_OPTIONS.map((o) => o.value),
);
export const EDUCATION_LEVEL_VALUES = new Set<string>(
  EDUCATION_LEVELS.map((o) => o.value),
);
export const PATIENT_IDENTIFICATION_VALUES = new Set<string>(
  PATIENT_IDENTIFICATION_OPTIONS.map((o) => o.value),
);

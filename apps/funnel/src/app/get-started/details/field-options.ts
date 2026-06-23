/**
 * Option lists for the details-form selects. Values mirror the marketing
 * consultation/intake form (IntakeForm.tsx) so the two entry points write the
 * same canonical strings into `users.gender` / `education_level` /
 * `patient_identification`.
 */

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const EDUCATION_LEVELS = [
  "Less than high school",
  "High school graduate",
  "Associates (2 years)",
  "Bachelors (4 years)",
  "Masters (6 years)",
  "Doctorate (8+ years)",
] as const;

export const PATIENT_IDENTIFICATION_OPTIONS = [
  { value: "Self", label: "Myself" },
  { value: "Someone else", label: "Someone else" },
] as const;

export const GENDER_VALUES = new Set<string>(GENDER_OPTIONS);
export const EDUCATION_LEVEL_VALUES = new Set<string>(EDUCATION_LEVELS);
export const PATIENT_IDENTIFICATION_VALUES = new Set<string>(
  PATIENT_IDENTIFICATION_OPTIONS.map((o) => o.value),
);

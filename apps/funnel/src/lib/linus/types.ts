/**
 * Shapes for the Linus Health Public API (see docs/linus/Linus Health Public
 * API.pdf). We only model the fields we send/read; the API returns more on the
 * subject/enrollment records than is typed here.
 */

/** One configured assessment battery, from the `LINUS_CAMPAIGNS` env list. */
export interface LinusCampaign {
  /** Short label we use internally (e.g. "LHQ", "ePSOM", "DAC"). */
  key: string;
  /** Display name shown on the page. */
  name: string;
  /** Linus campaign UUID — differs between sandbox and production. */
  campaignId: string;
  /** Optional one-line description shown under the title on the card. */
  description?: string;
  /** Optional duration label, e.g. "less than 10 min". */
  duration?: string;
  /** Optional link target for the "Assessment Information" card link. */
  infoUrl?: string;
}

/** Linus `sexAssignedAtBirth` enum (also the canonical `users.gender` values). */
export type SexAssignedAtBirth = "MALE" | "FEMALE" | "INTERSEX" | "OTHER";

/** For healthcare use cases Linus requires a birth date (`YYYY-MM-DD`). */
export interface AgeIndicator {
  birthDate: string;
}

/** Request body for `POST /v1/participants`. */
export interface RegisterSubjectInput {
  firstName: string;
  lastName: string;
  email: string;
  sexAssignedAtBirth: SexAssignedAtBirth;
  /** Linus `education` enum (`ED_YEARS_*`); omitted when we don't have it. */
  education?: string;
  ageIndicator: AgeIndicator;
  consent: boolean;
}

/** Subset of the registered-subject record we rely on. */
export interface Subject {
  participantId: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** Response from `POST /v1/participants/{id}/enrollments`. */
export interface Enrollment {
  enrollmentId: string;
  participantId: string;
  campaignId: string;
  /** Link the subject uses to take the battery online. */
  redirect: string;
}

export type ReportType = "patient-report" | "provider-report";

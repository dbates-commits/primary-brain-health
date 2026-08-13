/**
 * Map a funnel `users` row to a Linus `RegisterSubjectInput`. After the enum
 * alignment, `users.gender` and `users.educationLevel` already store canonical
 * Linus enum values, so this is mostly pass-through.
 *
 * The one piece of real logic is *who* the subject is — see `buildRegisterInput`.
 */

import type { User } from "@pbh/db";
import type { RegisterSubjectInput, SexAssignedAtBirth } from "./types";

/**
 * Thrown when a legacy "Someone else" booking has no patient name on file.
 * Registering the buyer instead would attach the patient's assessment to the
 * wrong person, so this fails loudly rather than guessing.
 *
 * Unreachable for anything booked after the details step began collecting the
 * patient's name unconditionally; it guards rows created before that.
 */
export class MissingPatientNameError extends Error {
  constructor() {
    super(
      "This booking is for someone else but has no patient name on file, so " +
        "the Linus subject can't be identified. Complete the details step first.",
    );
  }
}

/** Thrown when a user has no DOB, which Linus requires (healthcare use case). */
export class MissingDateOfBirthError extends Error {
  constructor() {
    super(
      "This account has no date of birth on file, which Linus requires to " +
        "register a subject. Complete the details step first.",
    );
  }
}

const SEX_VALUES = new Set<SexAssignedAtBirth>([
  "MALE",
  "FEMALE",
  "INTERSEX",
  "OTHER",
]);

function toSexAssignedAtBirth(gender: string | null): SexAssignedAtBirth {
  if (gender && SEX_VALUES.has(gender as SexAssignedAtBirth)) {
    return gender as SexAssignedAtBirth;
  }
  return "OTHER";
}

export function buildRegisterInput(user: User): RegisterSubjectInput {
  if (!user.dateOfBirth) {
    throw new MissingDateOfBirthError();
  }

  // The subject is whoever is being assessed, which is not always the account
  // holder. Every demographic on the row (DOB, gender, education) describes the
  // patient, so the name has to come from the patient columns too — otherwise
  // Linus receives a subject that is half buyer and half patient.
  //
  // The details step now always writes those columns, prefilled with the account
  // name, so they are set for every new booking. The `??` fallback covers rows
  // created before that, where they are null and the account holder *was* the
  // patient. The guard below catches the one legacy shape that would be wrong:
  // a "Someone else" row that never reached the details step.
  if (
    user.patientIdentification === "Someone else" &&
    !(user.patientFirstName && user.patientLastName)
  ) {
    throw new MissingPatientNameError();
  }

  // Email is deliberately the account holder's in every case: it is the address
  // we have verified and the one the report should reach. The patient is
  // identified by name + date of birth, not by their inbox.
  const input: RegisterSubjectInput = {
    firstName: user.patientFirstName ?? user.firstName,
    lastName: user.patientLastName ?? user.lastName,
    email: user.email,
    sexAssignedAtBirth: toSexAssignedAtBirth(user.gender),
    ageIndicator: { birthDate: user.dateOfBirth },
    consent: true,
  };
  // `education` is optional to Linus — only send it when we have a value.
  if (user.educationLevel) {
    input.education = user.educationLevel;
  }
  return input;
}

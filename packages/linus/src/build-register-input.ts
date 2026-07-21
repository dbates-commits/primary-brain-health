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
 * Thrown when a booking is for someone else but no patient name was captured.
 * Registering the buyer instead would attach the patient's assessment to the
 * wrong person, so this fails loudly rather than guessing.
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
  // holder. On a "Someone else" booking every demographic on the row (DOB,
  // gender, education) already describes the patient — so the name has to come
  // from the patient columns too, or Linus receives a subject that is half buyer
  // and half patient.
  const isForSomeoneElse = user.patientIdentification === "Someone else";
  if (isForSomeoneElse && !(user.patientFirstName && user.patientLastName)) {
    throw new MissingPatientNameError();
  }

  // Email is deliberately the account holder's in both cases: it is the address
  // we have verified and the one the report should reach. The patient is
  // identified by name + date of birth, not by their inbox.
  const input: RegisterSubjectInput = {
    firstName: isForSomeoneElse ? user.patientFirstName! : user.firstName,
    lastName: isForSomeoneElse ? user.patientLastName! : user.lastName,
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

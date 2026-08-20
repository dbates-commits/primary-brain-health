/**
 * Map a funnel `users` row to a Linus `RegisterSubjectInput`. After the enum
 * alignment, `users.gender` and `users.educationLevel` already store canonical
 * Linus enum values, so this is mostly pass-through.
 *
 * The subject is the account holder — see `buildRegisterInput`.
 */

import type { User } from "@pbh/db";
import type { RegisterSubjectInput, SexAssignedAtBirth } from "./types";

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

  // The subject is the account holder: the funnel sells an assessment to the
  // person taking it, and every demographic on the row (DOB, gender, education)
  // describes them. The second name pair this used to prefer (`patient_*`) was
  // dropped in migration 0022 — one person, one name. The email is that
  // person's too: the address we verified, and where the report should land.
  const input: RegisterSubjectInput = {
    firstName: user.firstName,
    lastName: user.lastName,
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

import { EDUCATION_LEVEL_VALUES, GENDER_VALUES } from "./field-options";

/**
 * The validation rules for the demographic profile, in one place.
 *
 * Two surfaces submit these same seven fields into the same seven `users`
 * columns: the booking details step (`completeProfileCore`, which finishes a
 * partial account) and the account settings Profile Information card
 * (`saveProfileCore`, which edits a completed one). The forms differ, the
 * writes differ, the rules must not — a ZIP the card accepts and the booking
 * step rejects is the same customer, the same column, and one of the two
 * answers is wrong.
 *
 * Deliberately not `server-only`: the values it checks against live here, and
 * a client-side pre-check may want it later.
 */

const ZIP_RE = /^\d{5}$/;

/** Count the digits in a (possibly formatted) phone string. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** The seven validated fields, under canonical names — see `nameKeys` below. */
export interface ProfileFieldValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  zip: string;
  phone: string;
  gender: string;
  educationLevel: string;
}

/**
 * Field-level errors, keyed by form field name. Empty means valid.
 *
 * `nameKeys` exists because the booking step submits the *patient* pair
 * (`patientFirstName` / `patientLastName`) while the account card submits the
 * account holder's — the same rule, a different input to hang the message on.
 */
export function validateProfileFields(
  values: ProfileFieldValues,
  nameKeys: { first: string; last: string } = {
    first: "firstName",
    last: "lastName",
  },
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!values.firstName) {
    fieldErrors[nameKeys.first] = "Enter a first name.";
  }
  if (!values.lastName) {
    fieldErrors[nameKeys.last] = "Enter a last name.";
  }
  if (!values.dateOfBirth) {
    fieldErrors.dateOfBirth = "Enter your date of birth.";
  } else {
    const dob = new Date(values.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      fieldErrors.dateOfBirth = "Enter a valid date.";
    } else if (dob > new Date()) {
      fieldErrors.dateOfBirth = "Date of birth can't be in the future.";
    }
  }
  if (phoneDigits(values.phone).length !== 10) {
    fieldErrors.phone = "Enter a 10-digit phone number.";
  }
  if (!ZIP_RE.test(values.zip)) {
    fieldErrors.zip = "Enter a 5-digit ZIP code.";
  }
  // Load-bearing beyond form hygiene: both values go to Linus verbatim, and
  // `field-options.ts` records that an out-of-set `education` fails the whole
  // registration with a 500 rather than a validation error.
  if (!GENDER_VALUES.has(values.gender)) {
    fieldErrors.gender = "Select your gender.";
  }
  if (!EDUCATION_LEVEL_VALUES.has(values.educationLevel)) {
    fieldErrors.educationLevel = "Select your highest level of education.";
  }

  return fieldErrors;
}

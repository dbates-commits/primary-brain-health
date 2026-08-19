import "server-only";

import { eq } from "drizzle-orm";
import { EDUCATION_LEVEL_VALUES, GENDER_VALUES } from "@pbh/booking";
import { db, users } from "@pbh/db";
import {
  phoneDigits,
  readProfileValues,
  type ProfileState,
} from "./profile-values";

const ZIP_RE = /^\d{5}$/;

/**
 * Save the Profile Information card (Figma 2092:13144).
 *
 * The sibling of `completeProfileCore` in `@pbh/booking/server`: the same seven
 * demographic columns, the same rules, the same failure shape. The difference
 * is only that this edits a completed profile where that one finishes a partial
 * account. Rules are duplicated rather than shared for now — sharing them means
 * refactoring a file on the paid booking path, which is its own change.
 *
 * `userId` is resolved by the action wrapper from the Auth.js session, never
 * trusted from the form.
 *
 * **The name assumption.** `users` keeps two name pairs — `first_name` (the
 * account holder) and `patient_first_name` (the person assessed). We assume a
 * customer always registers themselves, so both are written in step. Writing
 * only the account pair would leave the patient pair stale, and
 * `buildRegisterInput` prefers it (`patientFirstName ?? firstName`), so Linus
 * would keep registering the old name. If booking on someone else's behalf ever
 * returns, this write is the first thing that has to change.
 *
 * TODO(linus): this writes Neon only. `registerAndEnrollUser` sends the name,
 * `sexAssignedAtBirth`, `education` and `ageIndicator.birthDate` to Linus once,
 * when it mints the subject, and reuses `users.linus_participant_id` forever
 * after. So an edit is free while that column is null — `buildRegisterInput`
 * reads the row at registration time — but once it is set, Linus keeps the old
 * values until we push the change. Re-registering is NOT the fix: it mints a
 * duplicate subject, which that column exists to prevent. The fix is an
 * `updateSubject` in `@pbh/linus`'s client plus a push from here.
 */
export async function saveProfileCore(
  userId: string,
  formData: FormData,
): Promise<ProfileState> {
  // `email` is never read from this form. The disabled input is the UI half of
  // that guarantee; not looking is the half that holds against a hand-rolled
  // POST.
  const values = readProfileValues(formData);

  if (!userId) {
    return {
      status: "error",
      message: "We couldn't find your account. Please sign in again.",
      values,
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!values.firstName) {
    fieldErrors.firstName = "Enter a first name.";
  }
  if (!values.lastName) {
    fieldErrors.lastName = "Enter a last name.";
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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the fields below.",
      fieldErrors,
      values,
    };
  }

  try {
    const updated = await db
      .update(users)
      .set({
        firstName: values.firstName,
        lastName: values.lastName,
        patientFirstName: values.firstName,
        patientLastName: values.lastName,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
        zip: values.zip,
        gender: values.gender,
        educationLevel: values.educationLevel,
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (updated.length === 0) {
      return {
        status: "error",
        message: "We couldn't find your account. Please sign in again.",
        values,
      };
    }

    // Field names only in production. Name + date of birth + ZIP + phone is a
    // re-identifiable set, and stdout goes to a log drain outside the store the
    // data-minimisation note in `users.ts` is written about. The user id is an
    // opaque UUID already logged elsewhere, and `updated_at` carries the when.
    console.info("[profile] demographics updated", {
      userId,
      ...(process.env.NODE_ENV === "production"
        ? { fields: Object.keys(values) }
        : { values }),
    });

    return { status: "success", values };
  } catch (err) {
    // The error object only — never `values`.
    console.error("saveProfileCore failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your details. Please try again.",
      values,
    };
  }
}

import "server-only";

import { eq } from "drizzle-orm";
import { validateProfileFields } from "@pbh/booking";
import { db, users } from "@pbh/db";
import { readProfileValues, type ProfileState } from "./profile-values";

/**
 * Save the Profile Information card (Figma 2092:13144).
 *
 * The sibling of `completeProfileCore` in `@pbh/booking/server`: the same seven
 * demographic columns, the same rules, the same failure shape. The difference
 * is only that this edits a completed profile where that one finishes a partial
 * account. The rules themselves live in `@pbh/booking`'s `profile-rules.ts`, so
 * the two surfaces cannot drift.
 *
 * `userId` is resolved by the action wrapper from the Auth.js session, never
 * trusted from the form.
 *
 * There is one name here, not two. `patient_first_name` /
 * `patient_last_name` were dropped in migration 0022: the funnel registers the
 * account holder as the Linus subject, so a second pair only gave one person
 * two names that could disagree — and this card, editing the account pair,
 * could rename a subject by writing them in step.
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

  const fieldErrors = validateProfileFields(values);

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

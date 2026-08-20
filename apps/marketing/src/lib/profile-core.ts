import "server-only";

import { eq, sql } from "drizzle-orm";
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
 * **The two name pairs.** `users` keeps `first_name` (the account holder) and
 * `patient_first_name` (the person assessed), and they are not always the same
 * person: the details step arrives prefilled with the account name, and someone
 * booking for a parent or spouse types over it. Both pairs are live —
 * `buildRegisterInput` registers the Linus subject as
 * `patientFirstName ?? firstName`, and `resolveBookingResume` prefills the
 * details step from the patient pair.
 *
 * This card edits the *account holder's* name, so the patient pair is mirrored
 * only when it is the same name — either unset (a legacy row where the buyer
 * was the patient) or still equal to the account name. That keeps the common
 * self-booking case in step with Linus without overwriting a patient who is
 * somebody else: a customer who booked for their mother and later fixes their
 * own ZIP must not silently rename the subject.
 *
 * The condition is evaluated in the UPDATE rather than by reading the row
 * first, so there is no window between the read and the write. Postgres
 * evaluates the right-hand side of `SET` against the *old* row, which is what
 * makes comparing against `first_name` here mean "before this save".
 *
 * The demographic columns are a looser version of the same problem: they
 * describe the patient, and this card presents them as the account holder's.
 * That is the existing behaviour of the whole card, not something this write
 * decides, but it is the next thing to reckon with if booking for someone else
 * becomes common.
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
        patientFirstName: sql`case when (${users.patientFirstName} is null and ${users.patientLastName} is null)
            or (${users.patientFirstName} = ${users.firstName} and ${users.patientLastName} = ${users.lastName})
          then ${values.firstName} else ${users.patientFirstName} end`,
        patientLastName: sql`case when (${users.patientFirstName} is null and ${users.patientLastName} is null)
            or (${users.patientFirstName} = ${users.firstName} and ${users.patientLastName} = ${users.lastName})
          then ${values.lastName} else ${users.patientLastName} end`,
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

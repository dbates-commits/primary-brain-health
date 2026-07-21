import "server-only";

import { eq } from "drizzle-orm";
import { db, users } from "@pbh/db";
import { EDUCATION_LEVEL_VALUES, GENDER_VALUES } from "../field-options";
import { US_STATE_CODES } from "../us-states";
import type { DetailsState, DetailsValues } from "../types";

const ZIP_RE = /^\d{5}$/;

/** Count the digits in a (possibly formatted) phone string. */
function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Complete the partial account created at signup: set the remaining profile
 * fields (DOB, ZIP, state of residence, plus the intake details) on the
 * existing `users` row. Password collection is deferred for now.
 *
 * `userId` is resolved by the app wrapper (via the identity seam), not trusted
 * from the form — see `resolveBookingUserId`.
 */
export async function completeProfileCore(
  userId: string,
  formData: FormData,
): Promise<DetailsState> {
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const stateOfResidence = String(formData.get("stateOfResidence") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const educationLevel = String(formData.get("educationLevel") ?? "").trim();
  const patientFirstName = String(
    formData.get("patientFirstName") ?? "",
  ).trim();
  const patientLastName = String(formData.get("patientLastName") ?? "").trim();

  const values: DetailsValues = {
    patientFirstName,
    patientLastName,
    dateOfBirth,
    zip,
    stateOfResidence,
    phone,
    gender,
    educationLevel,
  };

  if (!userId) {
    return {
      status: "error",
      message: "We couldn't find your account. Please restart and try again.",
      values,
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!dateOfBirth) {
    fieldErrors.dateOfBirth = "Enter your date of birth.";
  } else {
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      fieldErrors.dateOfBirth = "Enter a valid date.";
    } else if (dob > new Date()) {
      fieldErrors.dateOfBirth = "Date of birth can't be in the future.";
    }
  }
  if (!ZIP_RE.test(zip)) {
    fieldErrors.zip = "Enter a 5-digit ZIP code.";
  }
  if (!US_STATE_CODES.has(stateOfResidence)) {
    fieldErrors.stateOfResidence = "Select your state of residence.";
  }
  if (phoneDigits(phone).length !== 10) {
    fieldErrors.phone = "Enter a 10-digit phone number.";
  }
  if (!GENDER_VALUES.has(gender)) {
    fieldErrors.gender = "Select your gender.";
  }
  if (!EDUCATION_LEVEL_VALUES.has(educationLevel)) {
    fieldErrors.educationLevel = "Select your highest level of education.";
  }
  // Whose details these are was answered at signup, so it's read from the row
  // rather than trusted from this form — the client never re-submits it, and it
  // decides whether the patient-name fields are required at all.
  const [existing] = await db
    .select({ patientIdentification: users.patientIdentification })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!existing) {
    return {
      status: "error",
      message:
        "We couldn't find your account. Please restart and create your account again.",
      values,
    };
  }
  const isForSomeoneElse = existing.patientIdentification === "Someone else";
  if (isForSomeoneElse) {
    if (!patientFirstName) {
      fieldErrors.patientFirstName = "Enter the patient's first name.";
    }
    if (!patientLastName) {
      fieldErrors.patientLastName = "Enter the patient's last name.";
    }
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
        dateOfBirth,
        zip,
        stateOfResidence,
        phone,
        gender,
        educationLevel,
        // Cleared on a self booking so a buyer who switches back can't leave a
        // stale patient name attached to their own assessment.
        patientFirstName: isForSomeoneElse ? patientFirstName : null,
        patientLastName: isForSomeoneElse ? patientLastName : null,
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (updated.length === 0) {
      return {
        status: "error",
        message:
          "We couldn't find your account. Please restart and create your account again.",
        values,
      };
    }

    return { status: "success" };
  } catch (err) {
    console.error("completeProfileCore failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your details. Please try again.",
      values,
    };
  }
}

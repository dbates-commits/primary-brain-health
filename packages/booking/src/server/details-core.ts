import "server-only";

import { eq } from "drizzle-orm";
import { db, users } from "@pbh/db";
import { EDUCATION_LEVEL_VALUES, GENDER_VALUES } from "../field-options";
import type { DetailsState, DetailsValues } from "../types";

const ZIP_RE = /^\d{5}$/;

/** Count the digits in a (possibly formatted) phone string. */
function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Complete the partial account created at signup: set the remaining profile
 * fields (the patient's name, DOB, ZIP, and the intake details) on the existing
 * `users` row.
 *
 * Every field here describes the person being assessed. The name arrives
 * prefilled with the account holder's, so it is the buyer unless they edited it
 * — which is the only place we ask who the assessment is for.
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
  if (phoneDigits(phone).length !== 10) {
    fieldErrors.phone = "Enter a 10-digit phone number.";
  }
  if (!GENDER_VALUES.has(gender)) {
    fieldErrors.gender = "Select your gender.";
  }
  if (!EDUCATION_LEVEL_VALUES.has(educationLevel)) {
    fieldErrors.educationLevel = "Select your highest level of education.";
  }
  // Always required now: the fields are prefilled rather than conditional, so
  // an empty one means the customer cleared it. No pre-SELECT to decide this —
  // the UPDATE's empty result below already proves whether the row exists.
  if (!patientFirstName) {
    fieldErrors.patientFirstName = "Enter a first name.";
  }
  if (!patientLastName) {
    fieldErrors.patientLastName = "Enter a last name.";
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
        phone,
        gender,
        educationLevel,
        patientFirstName,
        patientLastName,
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

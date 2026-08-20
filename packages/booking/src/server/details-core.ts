import "server-only";

import { eq } from "drizzle-orm";
import { db, users } from "@pbh/db";
import { validateProfileFields } from "../profile-rules";
import type { DetailsState, DetailsValues } from "../types";

/**
 * Complete the partial account created at signup: set the remaining profile
 * fields (name, DOB, ZIP, and the intake details) on the existing `users` row.
 *
 * Every field here describes the account holder, who is the person assessed.
 * The name arrives prefilled from signup and is written back because the
 * customer may have corrected it.
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
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  const values: DetailsValues = {
    firstName,
    lastName,
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

  // The same rules the account settings card enforces on these seven columns —
  // see `profile-rules.ts`.
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
        dateOfBirth,
        zip,
        phone,
        gender,
        educationLevel,
        firstName,
        lastName,
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

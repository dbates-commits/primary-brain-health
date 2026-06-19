"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { US_STATE_CODES } from "./us-states";

/** Non-secret fields echoed back so the form can repopulate after a reset. */
export type DetailsValues = {
  dateOfBirth: string;
  zip: string;
  stateOfResidence: string;
};

export type DetailsState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: DetailsValues;
    };

const ZIP_RE = /^\d{5}$/;

/**
 * Complete the partial account created at signup: set the remaining profile
 * fields (DOB, ZIP, state of residence) on the existing `users` row. Password
 * collection is deferred for now.
 *
 * NOTE: `userId` arrives from a (client-trusted) hidden field — fine for this
 * scaffold; derive it from the session once auth lands.
 */
export async function completeProfile(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const stateOfResidence = String(formData.get("stateOfResidence") ?? "").trim();

  const values: DetailsValues = { dateOfBirth, zip, stateOfResidence };

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
      .set({ dateOfBirth, zip, stateOfResidence })
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
    console.error("completeProfile failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your details. Please try again.",
      values,
    };
  }
}

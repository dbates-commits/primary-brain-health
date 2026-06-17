"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";
import { hashPassword } from "@/lib/password";
import { US_STATE_CODES } from "./us-states";

/** Non-secret fields echoed back so the form can repopulate after a reset. */
export type SignupValues = {
  legalName: string;
  email: string;
  dateOfBirth: string;
  zip: string;
  stateOfResidence: string;
};

export type SignupState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: SignupValues;
    };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

export async function createAccount(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const legalName = String(formData.get("legalName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const stateOfResidence = String(formData.get("stateOfResidence") ?? "").trim();

  // Echoed back on error so the form keeps what the user typed (never the password).
  const values: SignupValues = {
    legalName,
    email,
    dateOfBirth,
    zip,
    stateOfResidence,
  };

  const fieldErrors: Record<string, string> = {};
  if (!legalName) {
    fieldErrors.legalName = "Enter your full legal name.";
  }
  if (!EMAIL_RE.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }
  if (!dateOfBirth || Number.isNaN(Date.parse(dateOfBirth))) {
    fieldErrors.dateOfBirth = "Enter your date of birth.";
  } else if (Date.parse(dateOfBirth) > Date.now()) {
    fieldErrors.dateOfBirth = "Date of birth can't be in the future.";
  }
  if (!ZIP_RE.test(zip)) {
    fieldErrors.zip = "Enter a valid ZIP code.";
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
    const passwordHash = await hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        legalName,
        dateOfBirth,
        zip,
        stateOfResidence,
      })
      .returning({ id: users.id });

    await writeAuditLog({
      eventType: "signup",
      userId: created.id,
      metadata: { source: "get-started" },
    });

    return { status: "success", email };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // 23505 = unique_violation
    if (
      message.includes("users_email_unique") ||
      (err as { code?: string }).code === "23505"
    ) {
      return {
        status: "error",
        message: "An account with that email already exists.",
        fieldErrors: { email: "This email is already registered." },
        values,
      };
    }
    console.error("createAccount failed:", err);
    return {
      status: "error",
      message: "Something went wrong creating your account. Please try again.",
      values,
    };
  }
}

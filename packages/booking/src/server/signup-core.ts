import "server-only";

import { db, users, writeAuditLog } from "@pbh/db";
import type { SignupState, SignupValues } from "../types";
import { PATIENT_IDENTIFICATION_VALUES } from "../field-options";
import { isPgError, PgErrorCode } from "./db-errors";
import { isValidEmail, normalizeEmail } from "./email";
import { resolvePackageKey } from "../packages";
import { sendBookingConfirmation } from "./email-verification";

/**
 * Create the partial account at signup: validate the first/last/email, insert a
 * `users` row, and write a `signup` audit entry. Framework-agnostic — each app's
 * `"use server"` wrapper passes the submitted `FormData` and its own audit
 * `source` label. Returns the shared `SignupState` the form renders.
 */
export async function createAccountCore(
  formData: FormData,
  opts: { source: string },
): Promise<SignupState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const patientIdentification = String(
    formData.get("patientIdentification") ?? "",
  ).trim();

  // Echoed back on error so the form keeps what the user typed.
  const values: SignupValues = {
    firstName,
    lastName,
    email,
    patientIdentification,
  };

  const fieldErrors: Record<string, string> = {};
  if (!firstName) {
    fieldErrors.firstName = "Enter your first name.";
  }
  if (!lastName) {
    fieldErrors.lastName = "Enter your last name.";
  }
  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  // Asked here rather than on the details step because it decides what every
  // later question means — see SignupResult.patientIdentification.
  if (!PATIENT_IDENTIFICATION_VALUES.has(patientIdentification)) {
    fieldErrors.patientIdentification = "Select who this consultation is for.";
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
    const [created] = await db
      .insert(users)
      .values({
        email,
        firstName,
        lastName,
        patientIdentification,
        // Captured now so it survives the email-confirmation round-trip; the
        // client's in-memory choice is gone by the time they return.
        selectedPackageKey: resolvePackageKey(formData.get("packageKey")),
      })
      .returning({ id: users.id });

    await writeAuditLog({
      eventType: "signup",
      userId: created.id,
      metadata: { source: opts.source },
    });

    // Best-effort (never throws): a failed send must not fail signup — they can
    // re-send from the confirmation step. The welcome email deliberately does
    // NOT go out here: the flow is now blocked until this link is clicked, and
    // two emails arriving together buries the one they have to act on. Welcome
    // is sent on successful confirmation instead.
    await sendBookingConfirmation(created.id);

    return {
      status: "success",
      userId: created.id,
      email,
      firstName,
      lastName,
      patientIdentification,
    };
  } catch (err) {
    if (isPgError(err, PgErrorCode.UniqueViolation, "users_email_unique")) {
      return {
        status: "error",
        message: "Please fix the fields below.",
        fieldErrors: {
          email:
            "An account with this email already exists. Try signing in instead.",
        },
        values,
      };
    }
    console.error("createAccountCore failed:", err);
    return {
      status: "error",
      message: "Something went wrong creating your account. Please try again.",
      values,
    };
  }
}

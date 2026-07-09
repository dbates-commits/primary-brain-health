"use server";

import { db, users, writeAuditLog } from "@pbh/db";
import { isPgError, PgErrorCode } from "@/lib/db-errors";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import type { SignupState, SignupValues } from "@pbh/booking";

export async function createAccount(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  // Echoed back on error so the form keeps what the user typed.
  const values: SignupValues = { firstName, lastName, email };

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
      })
      .returning({ id: users.id });

    await writeAuditLog({
      eventType: "signup",
      userId: created.id,
      metadata: { source: "get-started" },
    });

    return { status: "success", userId: created.id, email, firstName, lastName };
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
    console.error("createAccount failed:", err);
    return {
      status: "error",
      message: "Something went wrong creating your account. Please try again.",
      values,
    };
  }
}

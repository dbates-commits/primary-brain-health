"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";

/** Non-secret fields echoed back so the form can repopulate after a reset. */
export type SignupValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export type SignupState =
  | { status: "idle" }
  | { status: "success"; userId: string; email: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: SignupValues;
    };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function createAccount(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  // Echoed back on error so the form keeps what the user typed.
  const values: SignupValues = { firstName, lastName, email };

  const fieldErrors: Record<string, string> = {};
  if (!firstName) {
    fieldErrors.firstName = "Enter your first name.";
  }
  if (!lastName) {
    fieldErrors.lastName = "Enter your last name.";
  }
  if (!EMAIL_RE.test(email)) {
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

    return { status: "success", userId: created.id, email };
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

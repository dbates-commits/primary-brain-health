import "server-only";

import { db, users, writeAuditLog } from "@pbh/db";
import { DUPLICATE_EMAIL_ERROR, type SignupState, type SignupValues } from "../types";
import { issueBookingSession, type BookingCookieJar } from "./booking-session";
import { isPgError, PgErrorCode } from "./db-errors";
import { isValidEmail, normalizeEmail } from "./email";
import { resolvePackageKey } from "../packages";

/**
 * Create the partial account at signup: validate the first/last/email, insert a
 * `users` row, write a `signup` audit entry, and issue the signed booking cookie
 * that identifies this browser for the rest of the flow. Framework-agnostic —
 * each app's `"use server"` wrapper passes the submitted `FormData`, its own
 * audit `source` label, and its cookie jar. Returns the shared `SignupState` the
 * form renders.
 *
 * The new user's id is deliberately not in that state: it goes to the browser
 * only inside the HttpOnly cookie, so no later step can post it back.
 */
export async function createAccountCore(
  formData: FormData,
  opts: { source: string; cookies: BookingCookieJar },
): Promise<SignupState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  // Echoed back on error so the form keeps what the user typed.
  const values: SignupValues = {
    firstName,
    lastName,
    email,
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

    // Issued before the customer leaves for Auth0, so the very next step
    // already has an identity to act on when they come back. It proves nothing
    // about the address — `resolveBookingResumeState` still gates on
    // `users.emailVerified`, which only Auth0 now stamps.
    issueBookingSession(opts.cookies, created.id);

    // No confirmation email from us any more. The caller sends the customer to
    // Auth0 next, which emails them a code; entering it is what proves the
    // address and stamps `emailVerified` (see `markEmailVerified`). The welcome
    // email rides on that same transition, so it still lands only once the
    // address is real.

    return {
      status: "success",
      email,
      firstName,
      lastName,
    };
  } catch (err) {
    if (isPgError(err, PgErrorCode.UniqueViolation, "users_email_unique")) {
      return {
        status: "error",
        message: "Please fix the fields below.",
        fieldErrors: { email: DUPLICATE_EMAIL_ERROR },
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

"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { isValidEmail, normalizeEmail } from "@pbh/booking/server";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string };

/**
 * Request a magic-link sign-in. Validates the email, then hands off to Auth.js
 * (`redirect: false` so it processes the send but returns instead of throwing a
 * redirect) and forwards to the check-your-email page.
 *
 * The response is identical whether or not the email has an account:
 * `sendMagicLinkEmail` simply sends nothing for an unknown address, so this
 * never reveals whether someone is registered.
 */
export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) {
    return { status: "error", email, message: "Enter a valid email address." };
  }

  try {
    await signIn("magic-link", { email, redirect: false });
  } catch {
    // AuthError (rare — e.g. provider/config issue). Keep the message generic
    // so it never leaks internal state or account existence.
    return {
      status: "error",
      email,
      message: "We couldn't start sign-in just now. Please try again.",
    };
  }

  redirect("/login/check-email");
}

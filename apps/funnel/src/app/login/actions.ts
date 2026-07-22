"use server";

import { AuthError } from "next-auth";
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
    // `redirectTo` is where the magic link lands once redeemed. Without it
    // Auth.js falls back to the Referer header, which only works by accident.
    await signIn("magic-link", {
      email,
      redirect: false,
      redirectTo: "/assessments",
    });
  } catch (err) {
    // AccessDenied is our own login-only rejection from the `signIn` callback
    // (see auth.ts) — the address has no account. Fall through to the same
    // check-your-email page a registered address gets, so the response never
    // reveals who is registered. Anything else is a real provider/config
    // failure; keep its message generic so it leaks nothing either.
    const isUnregistered = err instanceof AuthError && err.type === "AccessDenied";
    if (!isUnregistered) {
      return {
        status: "error",
        email,
        message: "We couldn't start sign-in just now. Please try again.",
      };
    }
  }

  redirect("/login/check-email");
}

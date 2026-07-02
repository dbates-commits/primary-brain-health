"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/authjs/config";
import { completeProviderLogin } from "@/lib/auth/complete-login";

export type AuthjsState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string };

/**
 * `/authjs` sign-in form action. Validate the credentials through Auth.js
 * (which establishes its own JWT session), then run the SHARED login logic
 * (`completeProviderLogin`) so this route converges on the same assessment
 * session as the Clerk demo, and forward to /assessments.
 */
export async function signInWithCredentials(
  _prev: AuthjsState,
  formData: FormData,
): Promise<AuthjsState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password.", email };
  }

  let result: unknown;
  try {
    result = await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    // A bad password (authorize → null) surfaces as CredentialsSignin.
    if (err instanceof AuthError) {
      return { status: "error", message: "Invalid email or password.", email };
    }
    throw err;
  }

  // Depending on the path, next-auth v5 can also report a failure by returning
  // an object with an `error` instead of throwing — treat that the same way.
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    (result as { error?: unknown }).error
  ) {
    return { status: "error", message: "Invalid email or password.", email };
  }

  await completeProviderLogin({ email });
  redirect("/assessments");
}

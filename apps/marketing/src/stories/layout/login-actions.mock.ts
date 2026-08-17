/**
 * Storybook stand-in for `src/app/login/actions.ts`.
 *
 * That module is `"use server"` and pulls in Auth.js, the Drizzle adapter and
 * the database, so no story can import it. `LoginPanel` takes its action as a
 * prop and the stories pass this in directly; `LoginMenu` imports the real
 * module statically (it has no prop seam — it *is* the wiring), so
 * `.storybook/main.ts` also aliases the module to this file.
 *
 * Keep the exported names in step with the real module: a drifted name fails
 * loudly at import rather than silently rendering the wrong thing.
 */

import type { LoginState } from "@/app/login/actions";

/** Any address containing this is treated as having no account. */
const UNREGISTERED_MARKER = "unknown";

/** Resolves after a beat so the pending state is visible in a story. */
export async function requestLoginLinkInline(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  await new Promise((resolve) => {
    setTimeout(resolve, 400);
  });

  if (!email.includes("@")) {
    return { status: "error", email, message: "Enter a valid email address." };
  }
  if (email.includes(UNREGISTERED_MARKER)) {
    return {
      status: "error",
      email,
      message: "Not an active user. Try checking spelling or another email.",
    };
  }
  return { status: "sent", email };
}

/** Exists so anything reaching for the module gets a working import. */
export async function requestMagicLink(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return requestLoginLinkInline(prev, formData);
}

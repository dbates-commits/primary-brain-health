"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@pbh/ui";

/**
 * "Continue with Auth0" — the second door into the same account.
 *
 * Rendered only where the caller has been told Auth0 is configured, since
 * `AUTH0_ENABLED` is a server-side check and this is a client component (see
 * `lib/auth0-enabled.ts`). With Auth0 unset nothing here is on the page.
 *
 * `signIn` from `next-auth/react`, not a server action, because the flow is a
 * top-level redirect out to Auth0's Universal Login and back to
 * `/api/auth/callback/auth0` — the client helper is what builds that URL with
 * its CSRF token. `useSignOut` takes the server-action route instead, and for
 * the opposite reason: it has session state to revoke first.
 *
 * `pending` never resets on success; the document is being replaced.
 */
export function Auth0SignInButton({ callbackUrl = "/welcome" }: { callbackUrl?: string }) {
  const [pending, setPending] = useState(false);

  function start() {
    if (pending) {
      return;
    }
    setPending(true);
    void signIn("auth0", { callbackUrl }).catch((err: unknown) => {
      console.error("[auth] Auth0 sign-in failed to start:", err);
      setPending(false);
    });
  }

  return (
    <Button
      type="button"
      color="secondary"
      onClick={start}
      disabled={pending}
      className="h-14 w-full text-body"
    >
      {pending ? "Redirecting…" : "Continue with Auth0"}
    </Button>
  );
}

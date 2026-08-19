"use client";

import { useState } from "react";
import { signOutAction } from "@/app/welcome/sign-out";

/**
 * Sign out from a client component: revoke the session, then leave.
 *
 * The navigation is a **full document load**, not `router.push` and not a
 * `redirect()` inside the action. The header reads its session from
 * `SessionProvider` (see `AuthProvider`), which caches it in client state and
 * only refetches on window focus. A soft navigation keeps that cache — and with
 * it the avatar, the first name and the account menu — for someone who is
 * already signed out, so Dashboard and Profile would still behave as if they
 * had a session. A document load rebuilds the provider from a request that no
 * longer carries a session cookie, which is the only thing that reliably clears
 * every copy of that state.
 *
 * `pending` is for disabling the control; on success the page is being replaced,
 * so it never resets.
 */
export function useSignOut(): { signOut: () => void; pending: boolean } {
  const [pending, setPending] = useState(false);

  function signOut() {
    if (pending) {
      return;
    }
    setPending(true);
    void signOutAction()
      .catch((err: unknown) => {
        // The session may well be gone anyway; leaving the page is still the
        // right outcome, so this only records why the revoke didn't land.
        console.error("[auth] sign-out failed:", err);
      })
      .finally(() => {
        window.location.assign("/");
      });
  }

  return { signOut, pending };
}

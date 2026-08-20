"use client";

import { useSession } from "next-auth/react";
import { ProfileForm } from "./ProfileForm";
import type { ProfileAction, ProfileInitialValues } from "@/lib/profile-values";

/**
 * `ProfileForm` wired to the live Auth.js session.
 *
 * The header greets the signed-in customer by first name and reads it from
 * `SessionProvider` (see `AuthProvider`), which caches the session in client
 * state and only refetches on window focus. Saving a new first name therefore
 * left the header — directly under the toast confirming the save — greeting the
 * old one for the rest of the page's life. `update()` refetches
 * `/api/auth/session`, and because sessions are database-backed the callback
 * rebuilds the name from the row that was just written.
 *
 * A separate component so `ProfileForm` stays provider-free: `useSession`
 * throws outside a `SessionProvider`, which every story would then have to
 * supply. This is the same seam the injected `action` uses.
 */
export function ProfileFormWithSession({
  action,
  initial,
}: {
  action: ProfileAction;
  initial: ProfileInitialValues;
}) {
  const { update } = useSession();

  return (
    <ProfileForm
      action={action}
      initial={initial}
      onSaved={() => {
        // The save itself succeeded either way — a failed refetch only means
        // the header keeps the old name until the next focus or navigation.
        void update()?.catch((err: unknown) => {
          console.error("[profile] session refresh failed:", err);
        });
      }}
    />
  );
}

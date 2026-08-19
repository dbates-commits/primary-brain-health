"use client";

import { Button } from "@pbh/ui";
import { useSignOut } from "@/lib/use-sign-out";

/** Revokes the current session, then leaves for the home page. */
export function SignOutButton() {
  const { signOut, pending } = useSignOut();

  return (
    <Button
      type="button"
      onClick={signOut}
      disabled={pending}
      variant="ghost"
      color="secondary"
      size="sm"
      className="w-full"
    >
      Sign out
    </Button>
  );
}

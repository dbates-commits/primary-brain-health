"use client";

import { Button } from "@pbh/ui";
import { signOutAction } from "./sign-out";

/** Submits the sign-out server action, revoking the current session. */
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" color="secondary" size="sm">
        Sign out
      </Button>
    </form>
  );
}

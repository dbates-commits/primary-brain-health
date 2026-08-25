"use client";

import { useSignOut } from "@/lib/use-sign-out";
import type { DeleteAccountAction } from "@/lib/delete-account-state";
import { DeleteAccountPanel } from "./DeleteAccountPanel";

/**
 * `DeleteAccountPanel` wired to the real sign-out.
 *
 * A separate component for the same reason `ProfileFormWithSession` is one: it
 * keeps the panel free of `@/app/welcome/sign-out`, which Storybook aliases to a
 * mock, and free of anything that would navigate a story out of its frame.
 *
 * `pending` is forwarded as `busy` because `useActionState`'s own pending flag
 * drops the moment the action resolves, and the sign-out round trip runs after
 * that. Without it the confirm button would flash back to "Request for Deletion"
 * while the page is already on its way out. `useSignOut`'s `pending` never
 * resets on success, which is exactly what is wanted here.
 */
export function DeleteAccountPanelWithSignOut({
  email,
  action,
}: {
  email: string;
  action: DeleteAccountAction;
}) {
  const { signOut, pending } = useSignOut();

  return (
    <DeleteAccountPanel
      email={email}
      action={action}
      onDeactivated={signOut}
      busy={pending}
    />
  );
}

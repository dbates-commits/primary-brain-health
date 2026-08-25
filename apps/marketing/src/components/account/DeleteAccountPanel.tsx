"use client";

import { useRef, useState } from "react";
import { Button, Heading } from "@pbh/ui";
import type { DeleteAccountAction } from "@/lib/delete-account-state";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface DeleteAccountPanelProps {
  /** The address the request is filed against. Shown in the modal. */
  email: string;
  action: DeleteAccountAction;
  /** Fired once, on success. The caller signs out and leaves. */
  onDeactivated?: () => void;
  /** True while the caller is signing out, so the modal keeps its pending look. */
  busy?: boolean;
}

/**
 * Everything visible in the Delete Account card (Figma 1988:12282), plus the
 * confirmation modal it opens.
 *
 * Props-only and free of the database and of `next-auth`, which is what makes it
 * storyable — `DeleteAccountCard` is the async half that does the reading and
 * `DeleteAccountPanelWithSignOut` is the one that touches the session. Same
 * split, and same reason, as `PlanSummary` under `PlanCard`.
 *
 * The copy is Figma's, with one edit: the design reads "Your account will be
 * permanentely deleted." **Worth a second read from whoever owns the wording.**
 * Nothing is deleted when the button is pressed — `users.deactivated_at` is
 * stamped, the account is locked out, and an operator runs the erasure later
 * (see `deactivate-account-core.ts`). The modal's own "Request for Deletion" is
 * the honest half of the design. `AccountDeactivatedEmail` already carries a
 * note that its language needs Linus's attorney; this needs the same pass.
 */
export function DeleteAccountPanel({
  email,
  action,
  onDeactivated,
  busy,
}: DeleteAccountPanelProps) {
  const [open, setOpen] = useState(false);
  // `Button` forwards no ref, so the wrapper holds it and the query below finds
  // the real control. `useFocusTrap` deliberately dropped focus restoration —
  // callers place focus explicitly, the way `LoginMenu` does.
  const triggerRef = useRef<HTMLSpanElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.querySelector("button")?.focus();
  }

  return (
    <>
      <Heading
        as="h2"
        size="md"
        className="font-thin leading-[1.06] md:text-[2rem]"
      >
        Delete Account
      </Heading>
      <p className="mt-2 font-body text-base leading-[1.2] text-text-secondary">
        Your account will be permanently deleted.
      </p>
      <hr className="mt-6 border-t border-border-subtle" />

      <span ref={triggerRef} className="mt-6 inline-block">
        <Button
          color="danger"
          onClick={() => {
            setOpen(true);
          }}
        >
          Delete Account
        </Button>
      </span>

      {/* Rendered unconditionally so the close transition has something to run
          on; the modal early-returns null once it has finished animating out. */}
      <DeleteAccountModal
        open={open}
        email={email}
        onClose={close}
        action={action}
        onDeactivated={onDeactivated}
        busy={busy}
      />
    </>
  );
}

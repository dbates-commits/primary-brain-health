"use client";

import { useState } from "react";
import type { LoginState } from "@/app/login/actions";
import { MobileLoginModal } from "@/components/layout/MobileLoginModal";

/**
 * Owns the `open` state for the `MobileLoginModal` stories, and stands in for
 * the drawer row that opens it.
 *
 * The modal is controlled — it renders from `open` and only *reports* intent
 * through `onBack`/`onClose`. Handing it bare spies leaves nothing to act on
 * those reports, so the overlay stays up however you dismiss it, which reads as
 * a broken button rather than a story missing its controller.
 *
 * The trigger is what makes the round trip visible: `Header` puts focus back on
 * the Login row after "back", and only a story with a real row can show that.
 */
export function MobileLoginModalHarness({
  action,
  onBack,
  onClose,
}: {
  action: (prev: LoginState, formData: FormData) => Promise<LoginState>;
  onBack: () => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-[40rem] bg-background-default p-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="py-2 text-left font-body text-body font-semibold text-brand-default"
      >
        Login
      </button>
      <MobileLoginModal
        open={open}
        action={action}
        onBack={() => {
          // Report first, then act: the spy assertions read the call, and the
          // state change is what actually dismisses the overlay.
          onBack();
          setOpen(false);
        }}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </div>
  );
}

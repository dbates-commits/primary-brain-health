"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Modal } from "@/components/booking/Modal";

/**
 * Owns the `open` state for the `Modal` stories.
 *
 * `Modal` is controlled: it renders from the `open` prop and only *reports*
 * intent through `onClose`. Handing it a bare spy leaves nothing to act on that
 * report, so the dialog stays open however you dismiss it — which reads as a
 * broken close button rather than as a story missing its controller.
 *
 * Rendering the trigger button too is what makes the round trip visible: on
 * close, `Modal` restores focus to whatever was focused when it opened, so
 * reopening from here is the only way a story shows that working.
 */
export function ModalStoryHarness({
  onClose,
  children,
  ...modalProps
}: Omit<ComponentProps<typeof Modal>, "open"> & { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-[24rem] items-center justify-center bg-surface p-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 rounded-full bg-primary px-6 text-base font-bold text-on-primary"
      >
        Open the dialog
      </button>
      <Modal
        {...modalProps}
        open={open}
        onClose={() => {
          // Report first, then act — the story's spy assertions read the call,
          // and the state change is what actually dismisses the dialog.
          onClose();
          setOpen(false);
        }}
      >
        {children}
      </Modal>
    </div>
  );
}

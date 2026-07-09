"use client";

import { Button, StepHeader } from "@pbh/ui";

/**
 * Modal step 4: confirmation. Shown after the (placeholder) payment completes.
 * In `.5` this is where the real post-payment handoff / next-steps copy lands.
 */
export function DoneStep({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <StepHeader
        title="You're all set 🎉"
        subtitle={
          email
            ? `We've saved your details for ${email}. Check your inbox for next steps.`
            : "We've saved your details. Check your inbox for next steps."
        }
      />
      <Button
        type="button"
        color="primary"
        onClick={onClose}
        className="h-14 w-full text-base"
      >
        Done
      </Button>
    </div>
  );
}

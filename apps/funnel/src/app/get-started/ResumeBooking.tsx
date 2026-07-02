"use client";

import { Button } from "@pbh/ui";

/**
 * Shown in the booking card after the account has been created but the user
 * dismissed the details modal. Re-opening resumes the flow instead of
 * re-submitting signup (which would fail — the email already exists).
 */
export function ResumeBooking({
  firstName,
  onResume,
}: {
  firstName?: string;
  onResume: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-on-surface">
        {firstName ? `You're almost there, ${firstName}.` : "You're almost there."}{" "}
        Finish the remaining details to book your assessment.
      </p>
      <Button
        type="button"
        color="white"
        onClick={onResume}
        className="h-14 w-full text-base font-bold text-[#45474d] shadow-[0px_8px_12px_rgba(0,0,0,0.12)]"
      >
        Continue Your Booking
      </Button>
    </div>
  );
}

"use client";

import { Button, StepHeader } from "@pbh/ui";

// Where paid + enrolled users continue to reach their assessments. The funnel's
// `/login` reads `?email=` (prefill), drops the assessment cookie, and lands on
// `/assessments` — the seam Clerk replaces later. Falls back to a relative
// `/login` if the funnel URL isn't configured.
const FUNNEL_URL = process.env.NEXT_PUBLIC_FUNNEL_URL ?? "";

/**
 * Modal step 4: confirmation. Shown after payment + Linus enrollment complete.
 * Hands the user off to the funnel to view their assessments (see `FUNNEL_URL`).
 */
export function DoneStep({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const assessmentsHref = `${FUNNEL_URL}/login${
    email ? `?email=${encodeURIComponent(email)}` : ""
  }`;

  return (
    <div className="flex flex-col gap-8 pb-6 sm:pb-10">
      <StepHeader
        title="You're all set 🎉"
        subtitle={
          email
            ? `Your payment is confirmed and we've saved your details for ${email}. Continue to view your brain health assessments.`
            : "Your payment is confirmed and we've saved your details. Continue to view your brain health assessments."
        }
      />
      <div className="flex flex-col gap-3">
        <Button
          href={assessmentsHref}
          color="primary"
          className="h-14 w-full text-base"
        >
          Continue to your assessments
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="h-12 w-full text-base"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

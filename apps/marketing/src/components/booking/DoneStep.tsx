"use client";

import { Button } from "@pbh/ui";
import { EngagementAppCta } from "@/components/welcome/EngagementAppCta";

/**
 * Modal step 6: confirmation. Shown after payment + Linus enrollment complete,
 * and the last thing we own — the CTA hands off to the Linus Engagement App.
 *
 * No gate of its own: reaching this step means completing a Stripe payment in
 * this request. The same component backs the `/welcome` route, which is where
 * a returning customer lands instead.
 */
export function DoneStep({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 pb-6 sm:pb-10">
      <EngagementAppCta email={email} />
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        className="w-full"
      >
        Done
      </Button>
    </div>
  );
}

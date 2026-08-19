"use client";

import { Button } from "@pbh/ui";
import { SignupForm, type SignupAction, type SignupResult } from "@pbh/booking";

/**
 * The white card on the left of the booking section (Figma 1804:17908): the
 * signup form itself, on the page rather than behind a CTA. Submitting it
 * creates the account and sends the confirmation email — the modal opens
 * straight at "confirm your email".
 *
 * Once that has happened the form must not stay submittable. It is still
 * mounted behind the modal, React has reset its fields, and a second submit
 * would fail on the unique-email constraint — so the card swaps to a short
 * "check your inbox" state with a way back into the modal.
 */
export function BookingFormCard({
  action,
  onComplete,
  submitLabel,
  submitLabelShort,
  signedUp,
  onReopen,
}: {
  action: SignupAction;
  onComplete: (result: SignupResult) => void;
  submitLabel?: string;
  submitLabelShort?: string;
  /** True once an account exists for this visit — see the note above. */
  signedUp: boolean;
  onReopen: () => void;
}) {
  return (
    <div className="rounded-xl bg-background-default p-8 shadow-[0_4px_12px_rgba(0,0,0,0.24)]">
      <h3 id="booking-form-title" className="sr-only">
        Book your assessment
      </h3>

      {signedUp ? (
        <div className="flex flex-col gap-6">
          <p className="text-lg text-grey-850">
            We&rsquo;ve emailed you a link to confirm your address. Open it to
            pick up where you left off.
          </p>
          <Button type="button" color="primary" className="w-full" onClick={onReopen}>
            I haven&rsquo;t received it
          </Button>
        </div>
      ) : (
        <div aria-labelledby="booking-form-title">
          <SignupForm
            action={action}
            onComplete={onComplete}
            showHeader={false}
            submitLabel={submitLabel}
            submitLabelShort={submitLabelShort}
            submitColor="white"
            sticky={false}
          />
        </div>
      )}
    </div>
  );
}

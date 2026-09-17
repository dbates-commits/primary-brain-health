"use client";

import { Button } from "@pbh/ui";
import { SignupForm, type SignupAction, type SignupResult } from "@pbh/booking";

/**
 * The white card on the left of the booking section (Figma 1804:17908): the
 * signup form itself, on the page rather than behind a CTA. Submitting it
 * creates the account and hands the customer to Auth0 to prove the address.
 *
 * Once an account exists the form must not stay submittable. It is still
 * mounted behind the modal, React has reset its fields, and a second submit
 * would fail on the unique-email constraint — so the card swaps to a state
 * whose only control is the way back into the modal.
 *
 * That state is also what a customer sees on the resume path, after they come
 * back from Auth0 and close the modal — so it must not describe an email of
 * ours that is waiting to be opened. There is no confirmation link any more;
 * the code is Auth0's, on its own screen, and the way back is this button.
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
    <div className="rounded-form-card bg-background-default p-8 shadow-card">
      <h3 id="booking-form-title" className="sr-only">
        Book your assessment
      </h3>

      {signedUp ? (
        <div className="flex flex-col gap-6">
          <p className="text-lg text-ink-strong">
            Your booking is under way. Pick up where you left off.
          </p>
          <Button type="button" color="primary" className="w-full" onClick={onReopen}>
            Continue my booking
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

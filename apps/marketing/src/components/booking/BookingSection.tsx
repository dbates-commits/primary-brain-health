"use client";

import { Section } from "@pbh/ui";
import type { SignupAction, SignupResult } from "@pbh/booking";
import { BookingFormCard } from "./BookingFormCard";
import { BookingIncludesPanel } from "./BookingIncludesPanel";

const DEFAULT_HEADLINE = "Start with a brain health assessment";
const DEFAULT_SUBHEADLINE =
  "A clinically grounded starting point to understand your cognitive health, review risk factors, and get a personalized plan for what to do next.";

/**
 * The booking landing section (Figma 1804:17908): headline, subheadline and the
 * signup form in a white card on the left; what the assessment includes and its
 * price on the right.
 *
 * The form is on the page rather than behind a CTA, so this section *is* the
 * first step of the flow — submitting it creates the account and opens the
 * modal at the confirmation step. There is one package, so there is nothing to
 * choose: the price is stated beside the form rather than picked.
 *
 * `headline`/`subheadline`/`buttonText` stay props so the Tina block binds them.
 */
export function BookingSection({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
  buttonText,
  buttonTextShort,
  showIncludes = true,
  action,
  onSignupComplete,
  signedUp,
  onReopen,
  tinaFields,
}: {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonTextShort?: string;
  /** Tina's "Show 'Includes:' panel" toggle — off gives the one-column variant. */
  showIncludes?: boolean;
  action: SignupAction;
  onSignupComplete: (result: SignupResult) => void;
  signedUp: boolean;
  onReopen: () => void;
  tinaFields?: { headline?: string; subheadline?: string };
}) {
  return (
    <Section
      id="booking"
      className="bg-brand-default px-6 py-16 text-brand-on-brand md:px-20 md:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-10 lg:flex-row lg:gap-[60px]">
        {/* Equal halves. `flex-1` on both with a zero basis splits the row
            evenly whatever the content measures — the design's 659px left
            column is close to half of its own frame. Below `lg` they stack and
            each goes full width, panel underneath. */}
        <div className="flex flex-col gap-4 lg:flex-1">
          <h2
            data-tina-field={tinaFields?.headline}
            className="text-balance font-headline text-4xl font-thin leading-tight text-white md:text-5xl"
          >
            {headline}
          </h2>
          <p
            data-tina-field={tinaFields?.subheadline}
            className="text-pretty text-xl leading-relaxed text-brand-wash"
          >
            {subheadline}
          </p>
          <div className="mt-2">
            <BookingFormCard
              action={action}
              onComplete={onSignupComplete}
              submitLabel={buttonText}
              submitLabelShort={buttonTextShort}
              signedUp={signedUp}
              onReopen={onReopen}
            />
          </div>
        </div>

        {showIncludes ? (
          <div className="lg:flex-1">
            <BookingIncludesPanel />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

import { Section } from "@pbh/ui";
import { SignupForm, type SignupAction, type SignupResult } from "@pbh/booking";
import { IncludesPanel } from "./IncludesPanel";

const DEFAULT_HEADLINE = "Start With a Brain Health assessment & Consultation";
const DEFAULT_SUBHEADLINE =
  "A clinically grounded starting point to understand your cognitive health, review risk factors, and get a personalized plan for what to do next.";

/**
 * The inline landing section (Figma 360-2502): copy + the shared `SignupForm`
 * entry on the left, the "Includes" / price panel on the right. The form renders
 * headerless under the section heading with the booking CTA copy; on a valid
 * submit `onStart` opens the booking modal. `headline`/`subheadline` are props
 * (design defaults) so the Tina block can bind them.
 */
export function BookingSection({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
  signupAction,
  onStart,
}: {
  headline?: string;
  subheadline?: string;
  signupAction: SignupAction;
  onStart: (result: SignupResult) => void;
}) {
  return (
    <Section
      id="booking"
      className="bg-primary px-6 py-16 text-on-primary md:px-10 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="flex flex-col">
          <h2 className="mb-6 text-balance font-headline text-4xl font-thin leading-[1.1] md:text-5xl lg:text-6xl">
            {headline}
          </h2>
          <p className="mb-8 text-pretty text-xl leading-relaxed text-on-primary-container">
            {subheadline}
          </p>
          <div className="rounded-[1.25rem] bg-surface-container-lowest p-5 text-on-surface shadow-lg sm:p-8">
            <SignupForm
              action={signupAction}
              onComplete={onStart}
              showHeader={false}
              submitLabel="Book Your Assessment and Consultation"
            />
          </div>
        </div>
        <IncludesPanel />
      </div>
    </Section>
  );
}

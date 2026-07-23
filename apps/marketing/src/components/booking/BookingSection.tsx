import { Section } from "@pbh/ui";
import { SignupForm, type SignupAction, type SignupResult } from "@pbh/booking";
import { copyFor, type Track } from "@pbh/copy";
import { IncludesPanel } from "./IncludesPanel";

/**
 * The inline landing section (Figma 360-2502): copy + the shared `SignupForm`
 * entry on the left, the "Includes" / price panel on the right. The form renders
 * headerless under the section heading with the booking CTA copy; on a valid
 * submit `onStart` opens the booking modal.
 *
 * `headline`/`subheadline` are props so the Tina block can bind them; when the
 * editor leaves them empty they fall back to the track's lexicon rather than to
 * one product's wording. The previous default described "a clinically grounded
 * starting point … review risk factors", which is a clinical claim and cannot
 * stand on the wellness path.
 */
export function BookingSection({
  track,
  priceLabel,
  headline,
  subheadline,
  signupAction,
  onStart,
}: {
  track: Track;
  /** Display price for the "Includes" panel — see IncludesPanel. */
  priceLabel: string;
  headline?: string;
  subheadline?: string;
  signupAction: SignupAction;
  onStart: (result: SignupResult) => void;
}) {
  const copy = copyFor({ track });
  const resolvedHeadline = headline || copy.phrase("booking.headline");
  const resolvedSubheadline =
    subheadline || copy.phrase("booking.subheadline");
  return (
    <Section
      id="booking"
      className="bg-primary px-6 py-16 text-on-primary md:px-10 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="flex flex-col">
          <h2 className="mb-6 text-balance font-headline text-4xl font-thin leading-[1.1] md:text-5xl lg:text-6xl">
            {resolvedHeadline}
          </h2>
          <p className="mb-8 text-pretty text-xl leading-relaxed text-on-primary-container">
            {resolvedSubheadline}
          </p>
          <div className="rounded-[1.25rem] bg-surface-container-lowest p-5 text-on-surface shadow-lg sm:p-8">
            <SignupForm
              action={signupAction}
              track={track}
              onComplete={onStart}
              showHeader={false}
              submitLabel="Book Your Assessment and Consultation"
            />
          </div>
        </div>
        <IncludesPanel track={track} priceLabel={priceLabel} />
      </div>
    </Section>
  );
}

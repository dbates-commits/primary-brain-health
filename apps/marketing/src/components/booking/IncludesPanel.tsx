import { Heading } from "@pbh/ui";
import { INCLUDES, type Track } from "@pbh/copy";

/**
 * "Includes" card for the booking section: the deliverables, the price, and the
 * HSA/FSA note. Presentational — mirrors the panel in the existing `IntakeForm`
 * block so the booking entry matches the current site treatment.
 *
 * The deliverables come from the track's lexicon. The previous hardcoded list
 * promised a "Clinician review of your results" on the $149 wellness product,
 * which is a clinical claim against a wellness-coded purchase.
 *
 * `priceLabel` is a prop because this renders inside a client component and so
 * can't fetch the Stripe catalog itself. It is supplied at the same seam that
 * pins the track (see BlockRenderer) — the two must move together, and reading
 * the real amount from the catalog is the follow-up that removes both.
 */
export function IncludesPanel({
  track,
  priceLabel,
}: {
  track: Track;
  priceLabel: string;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-[1.25rem] bg-primary-container p-6 sm:p-8">
      <Heading as="h4" size="sm" className="mb-4 text-white">
        Includes:
      </Heading>
      <ul className="space-y-3 text-on-primary-container">
        {INCLUDES[track].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <svg
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary-fixed"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-10 border-t border-white/15 pt-8">
        <span className="font-headline text-3xl font-normal text-white">
          {priceLabel}
        </span>
        <p className="mt-2 text-sm text-on-primary-container/60">
          This service may be eligible for{" "}
          <span className="text-white">HSA/FSA reimbursement</span>. We can
          provide documentation to support submission.
        </p>
      </div>
    </div>
  );
}

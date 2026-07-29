"use client";

import { Section } from "@pbh/ui";
import { ASSESSMENT_PACKAGES, type AssessmentPackage } from "@pbh/booking";
import { PackageCard } from "./PackageCard";

const DEFAULT_HEADLINE = "Start with a brain health consultation";
const DEFAULT_SUBHEADLINE =
  "A grounded starting point to understand your cognitive health, review risk factors, and get a personalized plan for what to do next.";

/**
 * The booking landing section (Figma 1088:4452): centred header, the two
 * package cards side by side, then the full-width HSA/FSA note.
 *
 * There is no inline signup form here any more — each card's CTA opens the
 * booking modal, which now starts at signup. `headline`/`subheadline` stay props
 * (design defaults) so the Tina block can keep binding them.
 */
export function BookingSection({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
  onSelectPackage,
}: {
  headline?: string;
  subheadline?: string;
  onSelectPackage: (pkg: AssessmentPackage) => void;
}) {
  return (
    <Section
      id="booking"
      className="bg-primary px-6 py-16 text-on-primary md:px-20 md:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-balance font-headline text-4xl font-thin leading-tight text-white md:text-5xl">
            {headline}
          </h2>
          <p className="text-pretty text-xl leading-relaxed text-on-primary-container">
            {subheadline}
          </p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-2 lg:gap-[60px]">
          {ASSESSMENT_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.key} pkg={pkg} onSelect={onSelectPackage} />
          ))}
        </div>

        <p className="text-center text-on-primary-container">
          Both services may be eligible for{" "}
          <span className="text-on-primary-highlight">
            HSA/FSA reimbursement
          </span>
          , depending on your plan. We can provide documentation to support
          submission.
        </p>
      </div>
    </Section>
  );
}

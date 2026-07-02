import { PhosphorIcon } from "@pbh/ui";

/** What the $149 assessment includes — mirrors the marketing "Includes" panel. */
const INCLUDES = [
  "Digital brain health assessment.",
  "Clinician review of your results.",
  "Consultation to collect relevant health history.",
  "Clear explanation of findings and risk profile.",
  "Personalized recommendations and next steps.",
  "Optional support from a Brain Health Navigator.",
];

/**
 * The dark "Includes" card shown beside the booking form: the six inclusions,
 * the $149 price, and the HSA/FSA reimbursement note. Colors follow the Figma
 * (`360-2579`) rather than tokens where no close token exists.
 */
export function IncludesPanel() {
  return (
    <div className="flex flex-col gap-10 rounded-xl bg-[#224b60] p-5">
      <div className="flex flex-col gap-4">
        <p className="font-headline text-xl font-thin text-white">Includes</p>
        <ul className="flex flex-col gap-4">
          {INCLUDES.map((item) => (
            <li key={item} className="flex items-center gap-4">
              <PhosphorIcon
                name="SealCheck"
                size={24}
                weight="regular"
                className="shrink-0 text-[#afd2e3]"
              />
              <span className="text-base text-[#afd2e3]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-t border-white/20" />

      <div className="flex flex-col gap-4">
        <p className="font-headline text-5xl font-thin text-white">$149</p>
        <p className="text-xs text-[#779caf]">
          This service may be eligible for{" "}
          <span className="text-white">HSA/FSA reimbursement</span>, depending on
          your plan. We can provide documentation to support submission.
        </p>
      </div>
    </div>
  );
}

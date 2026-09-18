import type { Example } from "./stack-compare-model";

const EVIDENCE_LABELS: Record<Example["evidence"], string> = {
  "checked-live": "Checked live, 18 Sep 2026",
  vendor: "The vendor's claim",
};

/**
 * One side's named sites.
 *
 * Every entry says how we know, because "checked live" and "it is on their
 * customer page" are not the same kind of fact, and the difference is exactly
 * what a sceptical reader will ask about.
 */
export function ExampleList({ heading, examples }: { heading: string; examples: Example[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-background-default p-5">
      <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
        {heading}
      </h3>
      <ul className="flex flex-col gap-3">
        {examples.map((example) => (
          <li key={example.name}>
            <a
              href={example.href}
              target="_blank"
              rel="noreferrer"
              className="text-body font-semibold text-text-heading underline"
            >
              {example.name}
            </a>
            <span className="text-body-sm text-text-secondary"> — {example.runs}</span>
            <p className="mt-0.5 text-body-sm text-text-default">{example.soWhat}</p>
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              {EVIDENCE_LABELS[example.evidence]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

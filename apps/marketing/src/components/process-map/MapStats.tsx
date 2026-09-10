import { NODES } from "./process-data";
import { isPlanned } from "./process-model";

const steps = NODES;

const STATS: { value: number; label: string }[] = [
  { value: steps.length, label: "steps" },
  {
    value: steps.filter((node) => node.systems.length > 0).length,
    label: "call a vendor",
  },
  {
    value: steps.filter((node) => node.sends.length > 0).length,
    label: "send an email",
  },
  {
    value: steps.filter((node) => node.state === "blocked").length,
    label: "blocked",
  },
  { value: steps.filter(isPlanned).length, label: "carry planned work" },
];

/**
 * The counts, as one line rather than a row of cards — on this screen the
 * canvas is what deserves the vertical space. Computed from the model, never
 * typed in.
 */
export function MapStats() {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-secondary">
      {STATS.map((stat, index) => (
        <span key={stat.label} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-text-tertiary">·</span> : null}
          <span className="font-semibold text-text-heading tabular-nums">{stat.value}</span>
          {stat.label}
        </span>
      ))}
    </p>
  );
}

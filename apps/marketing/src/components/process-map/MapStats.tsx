import { NODES } from "./process-data";
import { isPlanned } from "./process-model";

const steps = NODES;

const STATS: { value: number; label: string }[] = [
  { value: steps.length, label: "steps in the journey" },
  {
    value: steps.filter((node) => node.systems.length > 0).length,
    label: "steps that call a vendor",
  },
  {
    value: steps.filter((node) => node.state === "blocked").length,
    label: "blocked, with nothing behind them",
  },
  {
    value: steps.filter(isPlanned).length,
    label: "carrying planned work",
  },
];

/** The counts above the map — computed from the model, never typed in. */
export function MapStats() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border-default bg-background-default px-4 py-3"
        >
          <p className="text-2xl font-semibold text-text-heading tabular-nums">{stat.value}</p>
          <p className="text-[12px] text-text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

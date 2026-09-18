import { cn } from "@pbh/ui/utils";

import { VERDICT_LABELS, type Verdict } from "./stack-compare-model";

const VERDICT_STYLE: Record<Verdict, string> = {
  ours: "border-brand-default text-brand-default",
  hubspot: "border-aqua-default text-aqua-default",
  even: "border-border-strong text-text-secondary",
  depends: "border-border-strong text-text-secondary",
};

/**
 * Which way a row falls.
 *
 * Two colours, not a red and a green: the point of the page is that a row going
 * to HubSpot is information, not a defeat. The "HubSpot wins" rows use the same
 * aqua the services list uses for "partly wired" — a state, not a warning.
 */
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap",
        VERDICT_STYLE[verdict],
      )}
    >
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

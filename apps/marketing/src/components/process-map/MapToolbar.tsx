"use client";

import { cn } from "@pbh/ui/utils";

import { STATE_DOT } from "./node-styles";
import { STATE_LABELS, SYSTEM_LABELS, type NodeState, type SystemId } from "./process-model";

const SYSTEMS: SystemId[] = ["neon", "resend", "stripe", "linus"];
const STATES: NodeState[] = ["built", "planned", "blocked"];

export type MapFilters = {
  systems: SystemId[];
  states: NodeState[];
};

type MapToolbarProps = {
  filters: MapFilters;
  onChange: (next: MapFilters) => void;
};

function toggle<T>(list: T[], value: T): T[] {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }
  return [...list, value];
}

/**
 * The filters. Nothing selected means nothing dimmed — an empty filter is
 * "show me everything", not "show me nothing", which is what a reader opening
 * the page expects to see.
 */
export function MapToolbar({ filters, onChange }: MapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-wide text-text-secondary uppercase">Touches</span>
        {SYSTEMS.map((system) => {
          const on = filters.systems.includes(system);
          return (
            <button
              key={system}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filters, systems: toggle(filters.systems, system) })}
              className={cn(
                "h-7 rounded-full border px-3 text-[12px] transition-colors",
                on
                  ? "border-brand-default bg-brand-subtle text-brand-default"
                  : "border-border-default text-text-secondary hover:bg-background-warm",
              )}
            >
              {SYSTEM_LABELS[system]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-wide text-text-secondary uppercase">State</span>
        {STATES.map((state) => {
          const on = filters.states.includes(state);
          return (
            <button
              key={state}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filters, states: toggle(filters.states, state) })}
              className={cn(
                "flex h-7 items-center gap-2 rounded-full border px-3 text-[12px] transition-colors",
                on
                  ? "border-brand-default bg-brand-subtle text-brand-default"
                  : "border-border-default text-text-secondary hover:bg-background-warm",
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATE_DOT[state])} />
              {STATE_LABELS[state]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

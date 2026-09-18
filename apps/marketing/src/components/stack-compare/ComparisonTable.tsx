"use client";

import { useState } from "react";

import { ComparisonCard } from "./ComparisonCard";
import { ComparisonTableRow } from "./ComparisonTableRow";
import type { Mode } from "./mode";
import { DIMENSIONS } from "./stack-compare-data";

/**
 * The comparison as one screen you can run an eye down.
 *
 * A real `<table>`, because this genuinely is tabular — nine dimensions against
 * two options — and because a screen reader should announce "row, Speed, what
 * we have…" rather than reading nine unlabelled cards. It is the first table in
 * the codebase for the same reason nothing else here is one: nothing else here
 * was a grid of facts.
 *
 * Everything the long version said is still here, one click down. The two rows
 * that go to HubSpot sit at the top, which is where the eye lands first.
 *
 * Below `md` the same rows render as cards instead. A four-column table on a
 * phone is either unreadable or a horizontal scroll, and this page gets read on
 * a phone.
 */
export function ComparisonTable({ mode }: { mode: Mode }) {
  // A set rather than a single id: two rows worth comparing side by side is the
  // obvious thing to want, and an accordion that shut the last one would fight
  // that. Shared by both shapes, so opening a row and turning the phone keeps
  // it open.
  const [open, setOpen] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const allOpen = open.size === DIMENSIONS.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(DIMENSIONS.map((d) => d.id)))}
          className="shrink-0 text-body-sm text-brand-default underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border-default bg-background-default md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {`Our current stack compared with HubSpot Content Hub, across ${DIMENSIONS.length} dimensions. Select a row for the detail behind it.`}
          </caption>
          <thead>
            <tr className="bg-background-warm">
              <th scope="col" className="w-[22%] px-4 py-2.5">
                <span className="sr-only">What is being compared</span>
              </th>
              <th
                scope="col"
                className="w-[30%] px-4 py-2.5 text-[11px] font-semibold tracking-wide text-brand-default uppercase"
              >
                What we have
              </th>
              <th
                scope="col"
                className="w-[30%] px-4 py-2.5 text-[11px] font-semibold tracking-wide text-text-secondary uppercase"
              >
                HubSpot Content Hub
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-[11px] font-semibold tracking-wide text-text-secondary uppercase"
              >
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((dimension, index) => (
              <ComparisonTableRow
                key={dimension.id}
                dimension={dimension}
                number={index + 1}
                mode={mode}
                open={open.has(dimension.id)}
                onToggle={() => toggle(dimension.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {DIMENSIONS.map((dimension, index) => (
          <ComparisonCard
            key={dimension.id}
            dimension={dimension}
            number={index + 1}
            mode={mode}
            open={open.has(dimension.id)}
            onToggle={() => toggle(dimension.id)}
          />
        ))}
      </div>
    </div>
  );
}

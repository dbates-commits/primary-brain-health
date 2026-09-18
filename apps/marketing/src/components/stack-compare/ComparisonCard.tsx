"use client";

import { cn } from "@pbh/ui/utils";

import type { Mode } from "./mode";
import { RowDetail } from "./RowDetail";
import type { Dimension } from "./stack-compare-model";
import { VerdictBadge } from "./VerdictBadge";

/**
 * The same row at phone width, where a four-column table is unreadable.
 *
 * The two summaries stack as a labelled pair rather than as columns, which is
 * the one thing a narrow screen can still show side by side: a short label and
 * a short answer.
 */
export function ComparisonCard({
  dimension,
  mode,
  open,
  onToggle,
}: {
  dimension: Dimension;
  mode: Mode;
  open: boolean;
  onToggle: () => void;
}) {
  const detailId = `${dimension.id}-card-detail`;

  return (
    <div className="rounded-2xl border border-border-default bg-background-default">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailId}
        className="flex w-full flex-col gap-2 px-4 py-3 text-left"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            aria-hidden
            className={cn(
              "text-[10px] text-text-tertiary transition-transform",
              open && "rotate-90",
            )}
          >
            ▶
          </span>
          <span className="text-body font-semibold text-text-heading">{dimension.name}</span>
          <span className="ml-auto">
            <VerdictBadge verdict={dimension.verdict} />
          </span>
        </span>

        <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <span className="text-[11px] tracking-wide text-brand-default uppercase">Ours</span>
          <span className="text-body-sm text-text-default">{dimension.ours.summary}</span>
          <span className="text-[11px] tracking-wide text-text-secondary uppercase">HubSpot</span>
          <span className="text-body-sm text-text-default">{dimension.hubspot.summary}</span>
        </span>
      </button>

      {open ? (
        <div id={detailId} className="border-t border-border-subtle px-4 py-4">
          <RowDetail dimension={dimension} mode={mode} />
        </div>
      ) : null}
    </div>
  );
}

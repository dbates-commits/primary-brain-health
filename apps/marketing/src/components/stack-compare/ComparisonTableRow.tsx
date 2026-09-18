"use client";

import { cn } from "@pbh/ui/utils";

import type { Mode } from "./mode";
import { RowDetail } from "./RowDetail";
import type { Dimension } from "./stack-compare-model";
import { VerdictBadge } from "./VerdictBadge";

/**
 * One line of the table, plus the detail it hides.
 *
 * The whole row is the control rather than a chevron in the last cell: the
 * target is then the width of the table, which matters on a tab somebody is
 * scrolling through in a meeting.
 *
 * The detail lives in a second `<tr>` rather than inside the first one's last
 * cell, so it can span the full width without the columns above it reflowing
 * when it opens.
 */
export function ComparisonTableRow({
  dimension,
  number,
  mode,
  open,
  onToggle,
}: {
  dimension: Dimension;
  /** 1-based, so a row can be referred to out loud: "row four". */
  number: number;
  mode: Mode;
  open: boolean;
  onToggle: () => void;
}) {
  const detailId = `${dimension.id}-detail`;

  return (
    <>
      <tr
        id={dimension.id}
        onClick={onToggle}
        className={cn(
          "cursor-pointer border-t border-border-subtle align-top transition-colors",
          open ? "bg-background-warm" : "hover:bg-background-warm",
        )}
      >
        <th scope="row" className="px-4 py-3 text-left">
          {/* The real control is this button, not the row. `aria-expanded` on a
              <tr> is invalid — an implicit role="row" does not take it — so a
              screen reader would never announce the state. The row stays
              clickable for a mouse; the button is what assistive tech and the
              keyboard actually get. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={(event) => {
              // The row's own handler would otherwise fire second and toggle it back.
              event.stopPropagation();
              onToggle();
            }}
            className="flex items-baseline gap-2 text-left"
          >
            <span
              aria-hidden
              className={cn(
                "text-[10px] text-text-tertiary transition-transform",
                open && "rotate-90",
              )}
            >
              ▶
            </span>
            <span className="text-body-sm text-text-tertiary tabular-nums">{number}.</span>
            <span className="text-body font-semibold text-text-heading">{dimension.name}</span>
          </button>
        </th>
        <td className="px-4 py-3 text-body-sm text-text-default">{dimension.ours.summary}</td>
        <td className="px-4 py-3 text-body-sm text-text-default">{dimension.hubspot.summary}</td>
        <td className="px-4 py-3">
          <VerdictBadge verdict={dimension.verdict} />
        </td>
      </tr>

      {open ? (
        <tr id={detailId} className="border-t border-border-subtle bg-background-default">
          <td colSpan={4} className="px-4 py-5">
            <RowDetail dimension={dimension} mode={mode} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

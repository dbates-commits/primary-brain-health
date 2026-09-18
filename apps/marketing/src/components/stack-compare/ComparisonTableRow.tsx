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
  mode,
  open,
  onToggle,
}: {
  dimension: Dimension;
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
        aria-expanded={open}
        aria-controls={detailId}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "cursor-pointer border-t border-border-subtle align-top transition-colors",
          open ? "bg-background-warm" : "hover:bg-background-warm",
        )}
      >
        <th scope="row" className="px-4 py-3 text-left">
          <span className="flex items-baseline gap-2">
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
          </span>
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

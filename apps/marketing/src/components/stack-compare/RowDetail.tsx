import type { Mode } from "./mode";
import { SideColumn } from "./SideColumn";
import { SourceList } from "./SourceList";
import type { Dimension } from "./stack-compare-model";

/**
 * Everything behind one row, once somebody opens it.
 *
 * Shared by the table and the phone-width cards so the two never drift: the
 * table is a different shape on a small screen, but it must not be a different
 * argument.
 */
export function RowDetail({ dimension, mode }: { dimension: Dimension; mode: Mode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-text-secondary">{dimension.whyItMatters}</p>

      <div className="grid gap-5 md:grid-cols-2">
        <SideColumn heading="What we have" side={dimension.ours} mode={mode} emphasis />
        <SideColumn
          heading="HubSpot Content Hub"
          side={dimension.hubspot}
          mode={mode}
          emphasis={false}
        />
      </div>

      <p className="rounded-xl bg-background-warm px-4 py-3 text-body-sm text-text-default">
        <span className="font-semibold text-text-heading">In a sentence: </span>
        {dimension.takeaway}
      </p>

      {/* Kept visually distinct from the takeaway: this is the thing we do not
          know, and it must not be read as a finding. */}
      {dimension.toConfirm ? (
        <p className="text-body-sm text-text-secondary">
          <span className="font-semibold text-text-heading">To confirm: </span>
          {dimension.toConfirm}
        </p>
      ) : null}

      <SourceList sources={dimension.sources} />
    </div>
  );
}

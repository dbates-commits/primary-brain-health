import type { Mode } from "./mode";
import { SideColumn } from "./SideColumn";
import { SourceList } from "./SourceList";
import type { Dimension } from "./stack-compare-model";
import { VerdictBadge } from "./VerdictBadge";

/**
 * One dimension, both sides, and the sentence to say about it.
 *
 * The two columns are a plain grid rather than a table: a real `<table>` would
 * force every row to share a column width, and these rows are paragraphs of
 * very different lengths. It stacks on a phone, which is where Alec will
 * screenshot it from.
 */
export function ComparisonRow({ dimension, mode }: { dimension: Dimension; mode: Mode }) {
  return (
    <article
      id={dimension.id}
      className="flex flex-col gap-4 rounded-2xl border border-border-default bg-background-default p-5"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold text-text-heading">{dimension.name}</h2>
        <span className="ml-auto">
          <VerdictBadge verdict={dimension.verdict} />
        </span>
        <p className="w-full text-body-sm text-text-secondary">{dimension.whyItMatters}</p>
      </header>

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
    </article>
  );
}

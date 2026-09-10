import { EnvelopeSimple } from "@phosphor-icons/react";

/**
 * What this step puts in the customer's inbox.
 *
 * On the shape rather than only in the panel: "where do we email them?" is a
 * question the map should answer at a glance, and there are only four places.
 */
export function EmailBadge({ sends }: { sends: string[] }) {
  return (
    <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-brand-default bg-brand-subtle px-1.5 py-px text-[9px] whitespace-nowrap text-brand-default">
      <EnvelopeSimple weight="fill" className="size-2.5" />
      {sends.join(" · ")}
    </span>
  );
}

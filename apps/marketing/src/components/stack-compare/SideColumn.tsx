import { cn } from "@pbh/ui/utils";

import type { Mode } from "./mode";
import type { Side } from "./stack-compare-model";

/**
 * One side of one row: the claim, then what is good about it, then what is not.
 *
 * Both columns render identically whichever side they are — the only thing
 * marking "ours" is the heading tint. A comparison that styles its own column
 * more generously than the other is an advert, and this page is read by the
 * person who would notice.
 */
export function SideColumn({
  heading,
  side,
  mode,
  emphasis,
}: {
  heading: string;
  side: Side;
  mode: Mode;
  emphasis: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3
        className={cn(
          "text-[11px] font-semibold tracking-wide uppercase",
          emphasis ? "text-brand-default" : "text-text-secondary",
        )}
      >
        {heading}
      </h3>

      <p className="text-body text-text-default">{side.claim[mode]}</p>

      <div className="flex flex-col gap-2">
        {side.pros.map((pro) => (
          <p key={pro} className="flex gap-2 text-body-sm text-text-default">
            {/* A glyph rather than an icon component: this list is read as
                prose, and a plus sign needs no legend. */}
            <span aria-hidden className="text-brand-default">
              +
            </span>
            <span>{pro}</span>
          </p>
        ))}
        {side.cons.map((con) => (
          <p key={con} className="flex gap-2 text-body-sm text-text-secondary">
            <span aria-hidden className="text-text-tertiary">
              −
            </span>
            <span>{con}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

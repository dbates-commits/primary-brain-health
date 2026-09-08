"use client";

import { StackRow } from "./StackRow";
import type { StackSectionsProps } from "./stack-utils";

/** How It Works (Figma 2267:2770): a centred heading over a stack of alternating
 *  step rows, 20px apart. The rows sit on the design's 1280px text column — the
 *  same one the hero uses — rather than the page's full 1880px. */
export function StackSections({
  label,
  headline,
  subheadline,
  items = [],
  tinaFields,
  blockData,
}: StackSectionsProps) {
  return (
    <section className="bg-background-default px-6 md:px-10 py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        {(label || headline || subheadline) && (
          <div
            data-scroll-reveal
            data-scroll-stagger="90"
            className="flex flex-col gap-4 py-5 text-center"
          >
            {label && (
              <p
                data-scroll-item
                data-tina-field={tinaFields?.label}
                className="font-body text-caption uppercase tracking-[1px] text-text-brand"
              >
                {label}
              </p>
            )}
            {headline && (
              <h2
                data-scroll-item
                data-tina-field={tinaFields?.headline}
                className="font-headline font-thin text-h3 md:text-h2 text-text-default text-balance"
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p
                data-scroll-item
                data-tina-field={tinaFields?.subheadline}
                className="font-body text-body md:text-body-lg text-text-secondary text-pretty"
              >
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <StackRow
              key={i}
              item={item}
              itemData={blockData?.items?.[i]}
              reversed={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

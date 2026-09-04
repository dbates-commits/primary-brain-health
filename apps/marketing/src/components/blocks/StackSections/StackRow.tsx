"use client";

import { tinaField } from "tinacms/dist/react";
import { cn } from "@pbh/ui/utils";
import { StackBullet } from "./StackBullet";
import type { StackItem } from "./stack-utils";

/** One step of How It Works (Figma 2267:2812): a copy panel beside a photo,
 *  the two swapping sides on alternate rows. Even rows are the white,
 *  hairline-bordered panel; odd rows are the brand-subtle tint with no border. */
export function StackRow({
  item,
  itemData,
  reversed = false,
}: {
  item: StackItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemData?: any;
  reversed?: boolean;
}) {
  const field = (name: string) =>
    itemData ? tinaField(itemData, name) : undefined;
  const bulletField = (index: number) =>
    itemData?.bullets?.[index]
      ? tinaField(itemData.bullets[index], "text")
      : undefined;

  return (
    <div
      data-scroll-reveal-self
      className="grid grid-cols-1 items-stretch md:grid-cols-2"
    >
      <div
        className={cn(
          "flex flex-col gap-6 px-8 py-10 md:px-14 md:py-12",
          // 20px in Figma, applied per corner: only the pair on the outside of
          // the row is rounded. Stacked on mobile, the outside pair is the top
          // two; side by side from `md`, it is whichever end the panel sits at.
          "rounded-tl-[1.25rem] rounded-tr-[1.25rem]",
          reversed
            ? "bg-background-brand-subtle md:order-2 md:rounded-tl-none md:rounded-br-[1.25rem]"
            : "border border-border-default bg-background-default md:rounded-tr-none md:rounded-bl-[1.25rem]"
        )}
      >
        {item.eyebrow && (
          <p
            data-tina-field={field("eyebrow")}
            className="font-body text-caption uppercase tracking-[1px] text-text-brand"
          >
            {item.eyebrow}
          </p>
        )}

        {item.title && (
          <h3
            data-tina-field={field("title")}
            className="font-headline font-thin text-h5 md:text-h4 text-text-heading text-balance"
          >
            {item.title}
          </h3>
        )}

        {item.body && (
          <p
            data-tina-field={field("body")}
            className="font-body text-body text-text-secondary text-pretty"
          >
            {item.body}
          </p>
        )}

        {item.bullets && item.bullets.length > 0 && (
          <ul className="flex flex-col gap-6">
            {item.bullets.map((bullet, i) => (
              <StackBullet
                key={i}
                text={bullet?.text}
                tinaField={bulletField(i)}
              />
            ))}
          </ul>
        )}
      </div>

      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden md:aspect-auto",
          "rounded-bl-[1.25rem] rounded-br-[1.25rem]",
          reversed
            ? "md:order-1 md:rounded-br-none md:rounded-tl-[1.25rem]"
            : "md:rounded-bl-none md:rounded-tr-[1.25rem]"
        )}
      >
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.title || ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

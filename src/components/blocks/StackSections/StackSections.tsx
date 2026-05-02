"use client";

import { useEffect, useRef, useState } from "react";
import { tinaField } from "tinacms/dist/react";
import { cn } from "@/lib/utils";
import { PhosphorIcon } from "@/components/shared/PhosphorIcon";

interface StackItem {
  title?: string;
  body?: string;
  icon?: string;
  image?: string;
}

interface StackSectionsProps {
  label?: string;
  headline?: string;
  subheadline?: string;
  items?: StackItem[];
  tinaFields?: {
    label?: string;
    headline?: string;
    subheadline?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}

export function StackSections({
  label,
  headline,
  subheadline,
  items = [],
  tinaFields,
  blockData,
}: StackSectionsProps) {
  const getItemField = (index: number, field: string) =>
    blockData?.items?.[index]
      ? tinaField(blockData.items[index], field)
      : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  // Per-card progress (0 = fully visible, 1 = fully covered by next card)
  const [progress, setProgress] = useState<number[]>(() =>
    new Array(items.length).fill(0)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!container) return;
      // Mobile (<md): cards stack naturally — skip the sticky-driven transforms
      if (window.matchMedia("(max-width: 767px)").matches) {
        setProgress((prev) =>
          prev.some((v) => v !== 0) ? new Array(items.length).fill(0) : prev
        );
        return;
      }
      const itemEls = container.querySelectorAll<HTMLElement>("[data-stack-item]");
      const next: number[] = [];
      itemEls.forEach((el, i) => {
        const nextEl = itemEls[i + 1];
        if (!nextEl) {
          next[i] = 0;
          return;
        }
        // Progress = how close the next card's top is to its sticky pin point.
        // When next card's top reaches this card's pin position, progress = 1.
        const thisTopRem = 6 + i * 0.875;
        const nextTopRem = 6 + (i + 1) * 0.875;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const thisRect = el.getBoundingClientRect();
        const nextRect = nextEl.getBoundingClientRect();
        // Distance from next card's top to its pin position
        const toPinPx = nextRect.top - nextTopRem * rem;
        // The scroll distance over which we animate (height of this card)
        const animDistance = thisRect.height;
        const raw = 1 - toPinPx / animDistance;
        next[i] = Math.max(0, Math.min(1, raw));
        void thisTopRem;
      });
      setProgress(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  return (
    <section className="px-6 md:px-10 pt-10 md:pt-14 pb-6 md:pb-10">
      {(label || headline || subheadline) && (
        <div
          data-scroll-reveal
          data-scroll-stagger="90"
          className="max-w-4xl mx-auto text-center mb-10 md:mb-0"
        >
          {label && (
            <p
              data-scroll-item
              data-tina-field={tinaFields?.label}
              className="font-body font-bold text-primary text-xs md:text-sm uppercase tracking-[0.18em] mb-4"
            >
              {label}
            </p>
          )}
          {headline && (
            <h2
              data-scroll-item
              data-tina-field={tinaFields?.headline}
              className="font-headline font-normal text-on-surface text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-balance"
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              data-scroll-item
              data-tina-field={tinaFields?.subheadline}
              className="mt-5 text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto text-pretty"
            >
              {subheadline}
            </p>
          )}
        </div>
      )}

      <div ref={containerRef} className="max-w-5xl mx-auto relative">
        {items.map((item, i) => {
          const reversed = i % 2 === 1;
          const isLast = i === items.length - 1;
          // Cards stagger their sticky offset so each previous card peeks
          // above the next. The last card sits flush with the first so it
          // covers earlier cards completely.
          const stickyTopRem = isLast ? 6 : 6 + i * 0.875;
          const p = easeOutCubic(progress[i] ?? 0);
          // Subtle retreat: scale down + dim as the next card approaches
          const scale = 1 - p * 0.05;
          const translateY = -p * 16; // cards lift slightly as they retreat
          const dim = p * 0.35; // brightness dim
          return (
            <div
              key={i}
              data-stack-item
              className="md:sticky md:h-[70vh] md:flex md:items-start md:pt-10 mb-8 md:mb-0"
              style={{
                zIndex: i + 1,
                top: `${stickyTopRem}rem`,
              }}
            >
              <div
                className={cn(
                  "relative w-full bg-[#EFF6F9] rounded-[1.25rem] shadow-[0_10px_20px_-16px_rgba(4,22,50,0.25)] overflow-hidden grid grid-cols-1 md:grid-cols-2 md:min-h-[440px] origin-center",
                  reversed && "md:[&>div:first-of-type]:order-2"
                )}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  filter: `brightness(${1 - dim})`,
                  transition:
                    "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  willChange: "transform, filter",
                }}
              >
                <div className="relative flex flex-col md:justify-end items-start gap-5 md:gap-6 p-8 md:p-10">
                  <span
                    aria-hidden="true"
                    className="font-headline font-normal text-primary text-base md:text-lg leading-none tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.icon && (
                    <PhosphorIcon
                      name={item.icon}
                      aria-hidden="true"
                      weight="regular"
                      className="w-14 h-14 md:w-16 md:h-16 text-on-surface"
                    />
                  )}
                  {item.title && (
                    <h3
                      data-tina-field={getItemField(i, "title")}
                      className="font-headline font-normal text-on-surface text-3xl md:text-4xl leading-[1.15] text-balance"
                    >
                      {item.title}:
                    </h3>
                  )}
                  {item.body && (
                    <p
                      data-tina-field={getItemField(i, "body")}
                      className="text-on-surface-variant text-base md:text-lg leading-relaxed text-pretty max-w-md"
                    >
                      {item.body}
                    </p>
                  )}
                </div>

                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-full">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

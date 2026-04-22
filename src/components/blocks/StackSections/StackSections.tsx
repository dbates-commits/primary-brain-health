"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
}

export function StackSections({
  label,
  headline,
  subheadline,
  items = [],
}: StackSectionsProps) {
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
    <section className="px-6 md:px-10 py-20 md:py-28">
      {(label || headline || subheadline) && (
        <div
          data-scroll-reveal
          data-scroll-stagger="90"
          className="max-w-4xl mx-auto text-center mb-16 md:mb-24"
        >
          {label && (
            <p
              data-scroll-item
              className="font-body font-bold text-primary text-xs md:text-sm uppercase tracking-[0.18em] mb-4"
            >
              {label}
            </p>
          )}
          {headline && (
            <h2
              data-scroll-item
              className="font-headline font-normal text-on-surface text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-balance"
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              data-scroll-item
              className="mt-5 text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto text-pretty"
            >
              {subheadline}
            </p>
          )}
        </div>
      )}

      <div ref={containerRef} className="max-w-6xl mx-auto relative">
        {items.map((item, i) => {
          const reversed = i % 2 === 1;
          const stickyTopRem = 6 + i * 0.875;
          const p = easeOutCubic(progress[i] ?? 0);
          // Subtle retreat: scale down + dim as the next card approaches
          const scale = 1 - p * 0.05;
          const translateY = -p * 16; // cards lift slightly as they retreat
          const dim = p * 0.35; // brightness dim
          return (
            <div
              key={i}
              data-stack-item
              className="md:sticky md:h-[85vh] md:flex md:items-center mb-8 md:mb-0"
              style={{
                zIndex: i + 1,
                top: `${stickyTopRem}rem`,
              }}
            >
              <div
                className={cn(
                  "w-full bg-[#EFF6F9] rounded-[1.25rem] shadow-[0_10px_20px_-16px_rgba(4,22,50,0.25)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[480px] md:min-h-[560px] origin-center",
                  reversed && "md:[&>*:first-child]:order-2"
                )}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  filter: `brightness(${1 - dim})`,
                  transition:
                    "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  willChange: "transform, filter",
                }}
              >
                <div className="flex flex-col justify-end items-start gap-6 p-10">
                  {item.icon && (
                    <span
                      aria-hidden="true"
                      className="block w-10 h-10 bg-on-surface"
                      style={{
                        maskImage: `url(${item.icon})`,
                        WebkitMaskImage: `url(${item.icon})`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                      }}
                    />
                  )}
                  {item.title && (
                    <h3 className="font-headline font-normal text-on-surface text-3xl md:text-4xl leading-[1.15] text-balance">
                      {item.title}
                    </h3>
                  )}
                  {item.body && (
                    <p className="text-on-surface-variant text-base md:text-lg leading-relaxed text-pretty max-w-md">
                      {item.body}
                    </p>
                  )}
                </div>

                <div className="relative min-h-[280px] md:min-h-full">
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

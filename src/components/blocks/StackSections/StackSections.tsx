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
  // Per-card progress.
  //   entry:   0 = below fade-in window, 1 = at sticky pin (overlap begins).
  //            Drives the fade-up so each card is opaque *before* it covers
  //            the previous one.
  //   retreat: 0 = fully visible, 1 = fully covered by next card. Drives
  //            the existing scale-down + dim retreat as the next card pins.
  const [progress, setProgress] = useState<
    { entry: number; retreat: number }[]
  >(() =>
    Array.from({ length: items.length }, () => ({ entry: 0, retreat: 0 }))
  );
  // Mobile (<md): hand the entry fade-up to the existing CSS-only
  // [data-scroll-reveal-self] observer (one-shot). The per-frame React
  // re-render + chasing CSS transition combo was causing scroll stutter
  // on phones; on desktop we keep the scroll-driven sticky choreography.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!container) return;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) {
        // Skip per-frame work on mobile — set a one-time "fully present"
        // default so any computed opacity/transform resolves to the resting
        // state, then bail. The CSS scroll-reveal handles the fade-up.
        setProgress((prev) => {
          if (prev.every((p) => p.entry === 1 && p.retreat === 0)) return prev;
          return Array.from({ length: items.length }, () => ({
            entry: 1,
            retreat: 0,
          }));
        });
        return;
      }
      const itemEls =
        container.querySelectorAll<HTMLElement>("[data-stack-item]");
      const viewportH = window.innerHeight;
      // Fade-up window: card starts becoming visible once its top crosses
      // 85% of the viewport, fully opaque by the time it reaches 35%. The
      // sticky pin sits much higher (~6rem ≈ 100px), so cards are always
      // fully opaque before they begin overlapping the previous card.
      const fadeStartY = viewportH * 0.85;
      const fadeEndY = viewportH * 0.35;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const next: { entry: number; retreat: number }[] = [];
      itemEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const entryRaw = (fadeStartY - rect.top) / (fadeStartY - fadeEndY);
        const entry = Math.max(0, Math.min(1, entryRaw));

        let retreat = 0;
        if (!isMobile) {
          const nextEl = itemEls[i + 1];
          if (nextEl) {
            const nextTopRem = 6 + (i + 1) * 0.875;
            const nextRect = nextEl.getBoundingClientRect();
            const toPinPx = nextRect.top - nextTopRem * rem;
            const animDistance = rect.height;
            const raw = 1 - toPinPx / animDistance;
            retreat = Math.max(0, Math.min(1, raw));
          }
        }
        next[i] = { entry, retreat };
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
    <section className="px-6 md:px-10 pt-[368px] md:pt-[432px] pb-6 md:pb-10">
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
          const cardP = progress[i] ?? { entry: 0, retreat: 0 };
          // Entry: scroll-driven fade-up. Cap at 0.7 so cards are fully
          // opaque while still 30% of the runway away from overlap.
          const entryEased = easeOutCubic(Math.min(1, cardP.entry / 0.7));
          const cardOpacity = entryEased;
          const entryTranslateY = (1 - entryEased) * 32;
          // Watermark lags ~30% behind the card so the digit ghosts in
          // after the card itself has settled.
          const watermarkOpacity = easeOutCubic(
            Math.min(1, Math.max(0, cardP.entry - 0.3) / 0.5)
          );
          // Retreat: existing scale/lift/dim as next card approaches.
          const retreatEased = easeOutCubic(cardP.retreat);
          const scale = 1 - retreatEased * 0.05;
          const retreatTranslateY = -retreatEased * 16;
          const dim = retreatEased * 0.35;
          return (
            <div
              key={i}
              data-stack-item
              className="md:sticky md:h-[clamp(540px,55vh,620px)] md:flex md:items-start md:pt-10 mb-8 md:mb-0"
              style={{
                zIndex: i + 1,
                top: `${stickyTopRem}rem`,
              }}
            >
              <div
                data-scroll-reveal-self
                className={cn(
                  "relative w-full bg-[#EFF6F9] rounded-[1.25rem] shadow-[0_10px_20px_-16px_rgba(4,22,50,0.25)] overflow-hidden grid grid-cols-1 md:grid-cols-2 md:min-h-[440px] origin-center",
                  reversed && "md:[&>div:first-of-type]:order-2"
                )}
                style={
                  isMobile
                    ? undefined
                    : {
                        opacity: cardOpacity,
                        transform: `scale(${scale}) translateY(${
                          retreatTranslateY + entryTranslateY
                        }px)`,
                        filter: `brightness(${1 - dim})`,
                        transition:
                          "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                        willChange: "transform, filter, opacity",
                      }
                }
              >
                <div className="relative flex flex-col md:justify-end items-start p-8 md:p-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/watermark-${i + 1}.svg`}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute right-6 -bottom-4 md:right-10 md:-bottom-6 h-[200px] md:h-[300px] w-auto"
                    style={
                      isMobile
                        ? undefined
                        : {
                            opacity: watermarkOpacity,
                            transition:
                              "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                          }
                    }
                  />
                  <div className="relative flex flex-col items-start gap-5 md:gap-6">
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
                        {item.title}
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

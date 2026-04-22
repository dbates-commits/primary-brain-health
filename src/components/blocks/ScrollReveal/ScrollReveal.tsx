"use client";

import { Fragment, useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  label?: string;
  headline?: string;
  tinaFields?: {
    label?: string;
    headline?: string;
  };
}

export function ScrollReveal({ label, headline, tinaFields }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // reveal window — starts earlier, ends later so the effect plays out
      // over a longer scroll distance and feels smoother
      const startY = vh * 1.0;
      const endY = vh * 0.15;
      const denom = startY - endY;
      const p = (startY - rect.top) / denom;
      setProgress(Math.max(0, Math.min(1, p)));
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
  }, []);

  const words = (headline || "").split(/\s+/).filter(Boolean);
  const total = Math.max(words.length, 1);
  // Reveal window per word — wide enough that consecutive words overlap
  // into a smooth wave rather than stepping one at a time.
  const windowSize = 0.28;
  // Spacing between consecutive words' start positions — chosen so the
  // last word's reveal *ends* exactly when progress reaches 1.
  const spacing = total > 1 ? (1 - windowSize) / (total - 1) : 0;

  // Smooth easing applied to each word's local progress
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  return (
    <section ref={ref} className="px-6 md:px-10 py-28 md:py-36 lg:py-48 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        {label && (
          <p
            className="text-xs md:text-sm font-body font-bold uppercase tracking-[0.18em] text-primary mb-8"
            data-tina-field={tinaFields?.label}
          >
            {label}
          </p>
        )}

        <p
          className="font-headline font-normal text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.2] text-balance"
          data-tina-field={tinaFields?.headline}
        >
          {words.map((word, i) => {
            const wordStart = i * spacing;
            const raw = Math.max(
              0,
              Math.min(1, (progress - wordStart) / windowSize)
            );
            const eased = easeOutCubic(raw);

            const opacity = 0.08 + 0.92 * eased;
            const blur = (1 - eased) * 14;
            const translateY = (1 - eased) * 18;
            // Color lerp from muted surface-variant tone to full on-surface
            // #44474d (on-surface-variant) → #1b1c19 (on-surface)
            const r = Math.round(0x44 + (0x1b - 0x44) * eased);
            const g = Math.round(0x47 + (0x1c - 0x47) * eased);
            const b = Math.round(0x4d + (0x19 - 0x4d) * eased);

            return (
              <Fragment key={i}>
                <span
                  style={{
                    opacity,
                    color: `rgb(${r}, ${g}, ${b})`,
                    filter: `blur(${blur}px)`,
                    transform: `translateY(${translateY}px)`,
                    display: "inline-block",
                    transition:
                      "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1), color 500ms linear",
                    willChange: "opacity, filter, transform",
                  }}
                >
                  {word}
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </p>
      </div>
    </section>
  );
}

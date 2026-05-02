"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { tinaField } from "tinacms/dist/react";

interface Slide {
  label?: string;
  headline?: string;
}

interface ScrollFillLogoProps {
  slides?: Slide[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}

// Page-loop ribbon: exported from /public/images/page-loop.svg. A single
// gesture sweeping lower-right → upper-mid (with a loop) → off the
// lower-left edge. The path intentionally extends past the 1440×776
// viewBox on both ends so the gesture bleeds off the section.
const RIBBON_PATH =
  "M1447.65 501.677C817.598 268.795 613.098 568.118 369.498 470.375C125.898 372.632 238.062 -10.1091 540.379 96.6115C842.697 203.332 938.092 1180.3 -313.759 393.052";
const RIBBON_VIEWBOX = "0 0 1440 776";
const RIBBON_STROKE_COLOR = "#F2F8FA";
const RIBBON_STROKE_WIDTH = 120;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const interp = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));

export function ScrollFillLogo({
  slides = [],
  blockData,
}: ScrollFillLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brushRef = useRef<SVGPathElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lengthRef = useRef(0);

  // Filter out empty slides for rendering, but remember the original index so
  // each slide's tinaField path points back at the right repeater item.
  const populated = slides
    .map((slide, originalIndex) => ({ ...slide, originalIndex }))
    .filter((s) => s.label || s.headline);
  const count = populated.length;

  const getSlideField = (originalIndex: number, field: string) =>
    blockData?.slides?.[originalIndex]
      ? tinaField(blockData.slides[originalIndex], field)
      : undefined;

  useLayoutEffect(() => {
    const brush = brushRef.current;
    if (!brush) return;
    const length = brush.getTotalLength();
    lengthRef.current = length;
    brush.style.strokeDasharray = String(length);
    brush.style.strokeDashoffset = String(length);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Each slide owns an equal slice of scroll progress. Within its slice it
    // fades in over the first ~30% and fades out over the last ~30%, leaving
    // a long, calm hold in the middle. The final slide skips the fade-out
    // and holds through the end of the section.
    const fadeFrac = 0.3;

    let ticking = false;
    const update = () => {
      ticking = false;
      const brush = brushRef.current;
      const length = lengthRef.current;
      if (!brush || !length) return;

      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollable = rect.height - viewportH;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const progress = scrollable > 0 ? scrolled / scrollable : 0;

      // Entry fraction: 0 when the section is a full viewport below, 1 when
      // its top has reached the viewport top (sticky activated). Used so the
      // first slide can fade in before the scroll-linked `progress` starts.
      const entryFraction = Math.max(
        0,
        Math.min(1, 1 - rect.top / viewportH)
      );

      // Negative offset makes the dash slide off the path's *end* instead of
      // its start, so the stroke fills in from the opposite direction.
      brush.style.strokeDashoffset = String(-length * (1 - progress));

      if (svgRef.current) {
        const logoOpacity = smoothstep(interp(progress, 0.08, 0.28));
        svgRef.current.style.opacity = String(logoOpacity);
      }

      for (let i = 0; i < count; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;

        const sliceStart = i / count;
        const sliceEnd = (i + 1) / count;
        const span = sliceEnd - sliceStart;
        const inEnd = sliceStart + span * fadeFrac;
        const outStart = sliceEnd - span * fadeFrac;
        const isLast = i === count - 1;

        const inT =
          i === 0
            ? smoothstep(interp(entryFraction, 0.4, 0.85))
            : smoothstep(interp(progress, sliceStart, inEnd));
        const outT = isLast
          ? 0
          : smoothstep(interp(progress, outStart, sliceEnd));

        el.style.opacity = String(inT * (1 - outT));
        el.style.transform = `translateY(${(1 - inT) * 24}px)`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return (
    <section
      ref={containerRef}
      className="relative bg-surface"
      style={{
        // Sticky viewport (100vh) + per-slide scroll runway. The last slide
        // gets an extra ~50vh tail so it holds at full opacity well after it
        // finishes fading in, before the section unsticks.
        height: `${100 + Math.max(count, 1) * 100 + 50}vh`,
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={RIBBON_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          style={{
            overflow: "visible",
            opacity: 0,
            transform: "translateY(-50px)",
          }}
        >
          <path
            ref={brushRef}
            d={RIBBON_PATH}
            fill="none"
            stroke={RIBBON_STROKE_COLOR}
            strokeWidth={RIBBON_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10 grid max-w-6xl px-6 md:px-10 mx-auto text-center">
          {populated.map((slide, i) => (
            <div
              key={slide.originalIndex}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="col-start-1 row-start-1"
              style={{
                opacity: 0,
                transform: "translateY(24px)",
                willChange: "opacity, transform",
              }}
            >
              {slide.label && (
                <p
                  className="text-lg font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-10"
                  data-tina-field={getSlideField(slide.originalIndex, "label")}
                >
                  {slide.label}
                </p>
              )}
              {slide.headline && (
                <p
                  className="font-headline font-normal text-xl md:text-2xl lg:text-3xl leading-[1.3] text-balance text-on-surface"
                  data-tina-field={getSlideField(
                    slide.originalIndex,
                    "headline"
                  )}
                >
                  {slide.headline}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

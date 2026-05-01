"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface ScrollFillLogoProps {
  label?: string;
  headline?: string;
  secondLabel?: string;
  secondHeadline?: string;
  thirdLabel?: string;
  thirdHeadline?: string;
  tinaFields?: {
    label?: string;
    headline?: string;
    secondLabel?: string;
    secondHeadline?: string;
    thirdLabel?: string;
    thirdHeadline?: string;
  };
}

// Ribbon shape: an arcing trajectory from lower-left to upper-right with a
// single loop detour in the middle. Line-in and line-out are both segments
// of the same underlying arc — the line continues following the same curve
// after the loop, not a straight line. One fluid gesture throughout.
const RIBBON_PATH =
  "M 0 500 C 200 460, 320 400, 466 342 C 540 320, 600 130, 700 100 C 850 100, 870 280, 750 290 C 650 290, 530 320, 600 300 C 800 240, 1000 160, 1200 100";

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const interp = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));

export function ScrollFillLogo({
  label,
  headline,
  secondLabel,
  secondHeadline,
  thirdLabel,
  thirdHeadline,
  tinaFields,
}: ScrollFillLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brushRef = useRef<SVGPathElement>(null);
  const firstTextRef = useRef<HTMLDivElement>(null);
  const secondTextRef = useRef<HTMLDivElement>(null);
  const thirdTextRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);

  useLayoutEffect(() => {
    const brush = brushRef.current;
    if (!brush) return;
    const length = brush.getTotalLength();
    lengthRef.current = length;
    brush.style.strokeDasharray = String(length);
    brush.style.strokeDashoffset = String(length);
  }, []);

  const hasFirst = Boolean(label || headline);
  const hasSecond = Boolean(secondLabel || secondHeadline);
  const hasThird = Boolean(thirdLabel || thirdHeadline);
  const slideCount =
    (hasFirst ? 1 : 0) + (hasSecond ? 1 : 0) + (hasThird ? 1 : 0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Each slide owns an equal slice of scroll progress. Within its slice
    // it fades in over the first ~20% and fades out over the last ~20%,
    // leaving a long, calm hold in the middle. The final slide skips the
    // fade-out and holds through the end of the section.
    const slideRefs = [
      hasFirst ? firstTextRef : null,
      hasSecond ? secondTextRef : null,
      hasThird ? thirdTextRef : null,
    ].filter((r): r is React.RefObject<HTMLDivElement | null> => r !== null);
    const count = slideRefs.length;
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
      // first text can fade in before the scroll-linked `progress` starts.
      const entryFraction = Math.max(
        0,
        Math.min(1, 1 - rect.top / viewportH)
      );

      brush.style.strokeDashoffset = String(length * (1 - progress));

      // Ribbon container: hold invisible until the section is pinned and the
      // brush has started drawing, then fade in. Without this, the freshly
      // drawn brush appears at full opacity from the first pixel.
      if (svgRef.current) {
        const logoOpacity = smoothstep(interp(progress, 0.08, 0.28));
        svgRef.current.style.opacity = String(logoOpacity);
      }

      slideRefs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;

        const sliceStart = i / count;
        const sliceEnd = (i + 1) / count;
        const span = sliceEnd - sliceStart;
        const inEnd = sliceStart + span * fadeFrac;
        const outStart = sliceEnd - span * fadeFrac;
        const isLast = i === count - 1;

        // First slide uses the section-entry fraction for its initial fade
        // so it appears as the section pins, before scroll-progress starts.
        const inT =
          i === 0
            ? smoothstep(interp(entryFraction, 0.4, 0.85))
            : smoothstep(interp(progress, sliceStart, inEnd));
        const outT = isLast
          ? 0
          : smoothstep(interp(progress, outStart, sliceEnd));

        el.style.opacity = String(inT * (1 - outT));
        el.style.transform = `translateY(${(1 - inT) * 24}px)`;
      });
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
  }, [hasFirst, hasSecond, hasThird]);

  return (
    <section
      ref={containerRef}
      className="relative bg-surface"
      style={{
        // Sticky viewport (100vh) + per-slide scroll runway. The last slide
        // gets an extra ~50vh tail so it holds at full opacity well after it
        // finishes fading in, before the section unsticks.
        height: `${100 + Math.max(slideCount, 1) * 100 + 50}vh`,
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 600"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-auto hidden"
          style={{ overflow: "visible", opacity: 0 }}
        >
          <path
            ref={brushRef}
            d={RIBBON_PATH}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="60"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10 grid max-w-6xl px-6 md:px-10 mx-auto text-center">
          <div
            ref={firstTextRef}
            className="col-start-1 row-start-1"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              willChange: "opacity, transform",
            }}
          >
            {label && (
              <p
                className="text-lg font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-10"
                data-tina-field={tinaFields?.label}
              >
                {label}
              </p>
            )}
            {headline && (
              <p
                className="font-headline font-normal text-xl md:text-2xl lg:text-3xl leading-[1.3] text-balance text-on-surface"
                data-tina-field={tinaFields?.headline}
              >
                {headline}
              </p>
            )}
          </div>

          <div
            ref={secondTextRef}
            className="col-start-1 row-start-1"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              willChange: "opacity, transform",
            }}
          >
            {secondLabel && (
              <p
                className="text-lg font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-8"
                data-tina-field={tinaFields?.secondLabel}
              >
                {secondLabel}
              </p>
            )}
            {secondHeadline && (
              <p
                className="font-headline font-normal text-xl md:text-2xl lg:text-3xl leading-[1.3] text-balance text-on-surface"
                data-tina-field={tinaFields?.secondHeadline}
              >
                {secondHeadline}
              </p>
            )}
          </div>

          <div
            ref={thirdTextRef}
            className="col-start-1 row-start-1"
            style={{
              opacity: 0,
              transform: "translateY(24px)",
              willChange: "opacity, transform",
            }}
          >
            {thirdLabel && (
              <p
                className="text-lg font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-8"
                data-tina-field={tinaFields?.thirdLabel}
              >
                {thirdLabel}
              </p>
            )}
            {thirdHeadline && (
              <p
                className="font-headline font-normal text-xl md:text-2xl lg:text-3xl leading-[1.3] text-balance text-on-surface"
                data-tina-field={tinaFields?.thirdHeadline}
              >
                {thirdHeadline}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

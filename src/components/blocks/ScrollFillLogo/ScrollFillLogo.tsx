"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
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

// PBH logomark, revealed by an invisible brush stroke used as an SVG mask.
// As the section scrolls through view, the brush's stroke-dashoffset shrinks
// to zero, "painting in" the logo through the mask.
const LOGO_PATH =
  "M983.604 975.191C961.698 981.175 945.775 978.9 935.885 977.219C882.579 967.823 808.949 931.577 706.391 882.325C689.281 892.809 671.331 901.957 652.639 909.671C528.966 960.95 390.854 946.758 276.775 878.172C259.418 867.738 235.88 839.65 234.545 793.02C233.408 753.806 247.748 729.774 266.39 720.824C293.39 707.868 323.554 725.868 350.207 737.785C409.942 764.586 456.078 773.24 511.313 770.52C442.282 722.159 381.607 666.528 342.641 603.925C270.099 487.571 276.775 350.646 360.048 246.703C443.716 142.266 580.344 103.646 708.22 148.448C868.634 204.622 962.093 384.024 921.05 556.899C902.952 632.952 874.37 699.808 836.739 755.537C921.298 795.097 956.555 805.135 1012.33 825.211C1019.95 827.98 1026.28 830.255 1031.22 832.035C1074.99 848.205 1071.82 881.138 1063.71 897.16C1035.13 953.335 1008.23 968.466 983.604 975.191ZM502.412 340.608C498.605 344.415 495.094 348.322 491.879 352.327C454.199 399.403 452.023 460.028 486.044 514.62C523.181 574.206 596.366 629.886 683.644 679.583C716.231 638.392 740.906 583.948 756.631 517.884C780.169 418.985 720.78 331.905 652.343 307.971C588.009 285.472 534.703 308.416 502.412 340.707L502.412 340.608Z";
const BRUSH_PATH =
  "M200 700C215 730 230 755 246.807 778.811C502.312 1034.32 942.099 667.084 823.229 359.318C770.442 222.65 535.371 148.994 437.229 280.317C179.39 625.325 794.312 840.202 1037.19 929.24";
const LOGO_VIEWBOX = "0 0 1291 1291";
const LOGO_FILL = "#F2F8FA";
const BRUSH_STROKE_WIDTH = 170;

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
  const maskId = `scroll-fill-mask-${useId().replace(/:/g, "")}`;

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

    const fadeFrac = 0.2;

    let ticking = false;
    const update = () => {
      ticking = false;
      const brush = brushRef.current;
      const length = lengthRef.current;
      if (!brush || !length) return;

      // Intersection-based progress: 0 when section enters from bottom,
      // 1 when it exits from top. Works for any section height (including
      // a section that's exactly one viewport tall, where the older
      // sticky-runway formula would divide by zero).
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height + viewportH;
      const passed = viewportH - rect.top;
      const progress = Math.max(0, Math.min(1, passed / total));

      // Brush starts painting after progress ~0.15 so that on shorter
      // viewports — where the section's top edge is already partially
      // visible at page load (progress can be 0.04–0.08) — nothing is
      // drawn until the user actively scrolls. Completes by ~0.6, well
      // before the section exits, so the next block enters cleanly.
      const brushProgress = smoothstep(interp(progress, 0.15, 0.6));
      brush.style.strokeDashoffset = String(-length * (1 - brushProgress));

      if (svgRef.current) {
        // Logo opacity fades in just ahead of the brush so the shape is
        // ready to paint on, but stays invisible at page load.
        const logoOpacity = smoothstep(interp(progress, 0.13, 0.2));
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
          i === 0 ? 1 : smoothstep(interp(progress, sliceStart, inEnd));
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
    <section ref={containerRef} className="relative bg-surface h-[150vh]">
      {/* Sticky stage is pinned 120px from the viewport top with the slide
          content anchored to the top (items-start), so the gap above the
          label is a consistent 120px regardless of viewport height. */}
      <div className="sticky top-[20vh] h-[45vh] pt-24 w-full overflow-hidden flex items-center justify-center">
        <div className="relative w-full max-w-4xl mx-auto px-6 md:px-10 text-center">
          <svg
            ref={svgRef}
            viewBox={LOGO_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[calc(-50%+32px)] w-[min(68.75vmin,525px)] h-auto pointer-events-none"
            style={{
              overflow: "visible",
              opacity: 0,
            }}
          >
            <defs>
              <mask id={maskId}>
                {/* Oversized black backdrop = "hide everything"; the white
                    brush stroke punches a window through which the logo
                    becomes visible. */}
                <rect
                  x="-500"
                  y="-500"
                  width="2291"
                  height="2291"
                  fill="black"
                />
                <path
                  ref={brushRef}
                  d={BRUSH_PATH}
                  fill="none"
                  stroke="white"
                  strokeWidth={BRUSH_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
            </defs>
            <path
              d={LOGO_PATH}
              fill={LOGO_FILL}
              fillRule="evenodd"
              mask={`url(#${maskId})`}
            />
          </svg>

          {/* Slides share a single grid cell so the stage sizes to the
              tallest slide; cross-fades toggle which one is visible. */}
          <div className="relative z-10 grid">
            {populated.map((slide, i) => {
              // Slide 0's label + headline ride a continuous fade-up sweep
              // chained after the hero (hero h1 at 150ms, CTA at 350ms),
              // so the page entrance reads as one motion. Subsequent
              // slides keep the scroll-driven cross-fade.
              const isFirst = i === 0;
              return (
                <div
                  key={slide.originalIndex}
                  ref={(el) => {
                    slideRefs.current[i] = el;
                  }}
                  className="col-start-1 row-start-1"
                  style={
                    isFirst
                      ? { willChange: "opacity, transform" }
                      : {
                          opacity: 0,
                          transform: "translateY(24px)",
                          willChange: "opacity, transform",
                        }
                  }
                >
                  {slide.label && (
                    <p
                      className={`text-lg font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-10${
                        isFirst ? " animate-fade-up" : ""
                      }`}
                      style={isFirst ? { animationDelay: "550ms" } : undefined}
                      data-tina-field={getSlideField(
                        slide.originalIndex,
                        "label",
                      )}
                    >
                      {slide.label}
                    </p>
                  )}
                  {slide.headline && (
                    <p
                      className={`font-headline font-normal text-xl md:text-2xl lg:text-3xl leading-[1.3] text-balance text-on-surface${
                        isFirst ? " animate-fade-up" : ""
                      }`}
                      style={isFirst ? { animationDelay: "750ms" } : undefined}
                      data-tina-field={getSlideField(
                        slide.originalIndex,
                        "headline",
                      )}
                    >
                      {slide.headline}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

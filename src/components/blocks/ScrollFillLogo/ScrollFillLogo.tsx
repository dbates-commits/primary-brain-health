"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";

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

const LOGO_PATH =
  "M983.604 975.191C961.698 981.175 945.775 978.9 935.885 977.219C882.579 967.823 808.949 931.577 706.391 882.325C689.281 892.809 671.331 901.957 652.639 909.671C528.966 960.95 390.854 946.758 276.775 878.172C259.418 867.738 235.88 839.65 234.545 793.02C233.408 753.806 247.748 729.774 266.39 720.824C293.39 707.868 323.554 725.868 350.207 737.785C409.942 764.586 456.078 773.24 511.313 770.52C442.282 722.159 381.607 666.528 342.641 603.925C270.099 487.571 276.775 350.646 360.048 246.703C443.716 142.266 580.344 103.646 708.22 148.448C868.634 204.622 962.093 384.024 921.05 556.899C902.952 632.952 874.37 699.808 836.739 755.537C921.298 795.097 956.555 805.135 1012.33 825.211C1019.95 827.98 1026.28 830.255 1031.22 832.035C1074.99 848.205 1071.82 881.138 1063.71 897.16C1035.13 953.335 1008.23 968.466 983.604 975.191ZM502.412 340.608C498.605 344.415 495.094 348.322 491.879 352.327C454.199 399.403 452.023 460.028 486.044 514.62C523.181 574.206 596.366 629.886 683.644 679.583C716.231 638.392 740.906 583.948 756.631 517.884C780.169 418.985 720.78 331.905 652.343 307.971C588.009 285.472 534.703 308.416 502.412 340.707L502.412 340.608Z";

const BRUSH_PATH =
  "M200 700C215 730 230 755 246.807 778.811C502.312 1034.32 942.099 667.084 823.229 359.318C770.442 222.65 535.371 148.994 437.229 280.317C179.39 625.325 794.312 840.202 1037.19 929.24";

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
  const brushRef = useRef<SVGPathElement>(null);
  const solidFillRef = useRef<SVGPathElement>(null);
  const firstTextRef = useRef<HTMLDivElement>(null);
  const secondTextRef = useRef<HTMLDivElement>(null);
  const thirdTextRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);
  const maskId = `scroll-fill-mask-${useId().replace(/:/g, "")}`;

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

    let ticking = false;
    const update = () => {
      ticking = false;
      const brush = brushRef.current;
      const solidFill = solidFillRef.current;
      const firstText = firstTextRef.current;
      const secondText = secondTextRef.current;
      const thirdText = thirdTextRef.current;
      const length = lengthRef.current;
      if (!brush || !solidFill || !length) return;

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

      const fadeStart = 0.92;
      const fadeAmount = Math.max(0, (progress - fadeStart) / (1 - fadeStart));
      solidFill.setAttribute("opacity", String(fadeAmount));

      // Text 1: fade in during entry (fraction 0.35 → 0.9 — settles before
      // the section pins), fade out around progress 0.28 → 0.36.
      if (firstText) {
        const inT = smoothstep(interp(entryFraction, 0.35, 0.9));
        const outT = smoothstep(interp(progress, 0.28, 0.36));
        firstText.style.opacity = String(inT * (1 - outT));
        firstText.style.transform = `translateY(${(1 - inT) * 24}px)`;
      }

      // Text 2: in 0.34 → 0.45, out 0.60 → 0.68
      if (secondText) {
        const inT = smoothstep(interp(progress, 0.34, 0.45));
        const outT = smoothstep(interp(progress, 0.60, 0.68));
        secondText.style.opacity = String(inT * (1 - outT));
        secondText.style.transform = `translateY(${(1 - inT) * 24}px)`;
      }

      // Text 3: in 0.66 → 0.78, holds through end
      if (thirdText) {
        const inT = smoothstep(interp(progress, 0.66, 0.78));
        thirdText.style.opacity = String(inT);
        thirdText.style.transform = `translateY(${(1 - inT) * 24}px)`;
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
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-surface h-[180vh] sm:h-[220vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 1291 1291"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="absolute inset-0 m-auto w-[min(70vmin,500px)] h-auto"
          style={{ overflow: "visible" }}
        >
          <defs>
            <mask id={maskId}>
              <rect x="-500" y="-500" width="2291" height="2291" fill="black" />
              <path
                ref={brushRef}
                d={BRUSH_PATH}
                fill="none"
                stroke="white"
                strokeWidth="170"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          <path
            ref={solidFillRef}
            d={LOGO_PATH}
            fill="#CCE2E8"
            fillRule="evenodd"
            opacity="0"
          />
          <path
            d={LOGO_PATH}
            fill="#CCE2E8"
            fillRule="evenodd"
            mask={`url(#${maskId})`}
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
                className="text-xs md:text-sm font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-10"
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
                className="text-xs md:text-sm font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-8"
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
                className="text-xs md:text-sm font-body font-bold uppercase tracking-[0.18em] text-primary mb-6 md:mb-8"
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

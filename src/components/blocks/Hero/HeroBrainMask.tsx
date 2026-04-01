"use client";

import { cn } from "@/lib/utils";
import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
  DEFAULT_HERO_IMAGE,
} from "./hero-utils";

const BRAIN_COLUMNS = [
  { height: "34.6%", top: "32.7%", width: 136 },   // left short
  { height: "73.9%", top: "13.0%", width: 136 },   // left-mid
  { height: "100%", top: "0%", width: 136 },        // center-left
  { height: "100%", top: "0%", width: 136 },        // center-right
  { height: "73.9%", top: "13.0%", width: 136 },   // right-mid
  { height: "34.6%", top: "32.7%", width: 136 },   // right short
];

export function HeroBrainMask({
  headline,
  subheadline,
  image,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  const imgSrc = image || DEFAULT_HERO_IMAGE;

  return (
    <section className="relative overflow-hidden bg-[#eff3f7] px-6 md:px-12 lg:px-20 py-16 lg:py-20">
      {/* Faint background texture */}
      <div className="absolute inset-0 opacity-10 mix-blend-luminosity">
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        {/* Text — below image on mobile, left on desktop */}
        <div className="flex flex-col gap-10 lg:gap-16 flex-1 order-2 lg:order-1">
          <div className="flex flex-col gap-6">
            <h1
              className="text-4xl md:text-5xl lg:text-[56px] font-bold font-headline text-on-surface leading-[1.1] tracking-tight"
              data-tina-field={tinaFields?.headline}
            >
              {headline ? highlightBrainHealth(headline, "text-[#456991]") : null}
            </h1>
            {subheadline && (
              <p
                className="text-lg md:text-2xl text-on-surface leading-relaxed max-w-xl"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>

          {primaryButtonText && (
            <a
              href={primaryButtonLink || "#"}
              className="bg-secondary text-on-secondary px-6 py-4 rounded-xl font-headline text-lg md:text-2xl font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all inline-flex items-center justify-center w-fit"
              data-tina-field={tinaFields?.primaryButtonText}
            >
              {primaryButtonText}
            </a>
          )}

          {/* Trust bar */}
          <div className="border-l-4 border-outline-variant pl-6 flex flex-col gap-2">
            <TrustAvatars />
            <p className="text-2xl font-medium text-on-surface">
              3,200+ Patients
            </p>
            <p className="text-xl text-outline">Trust Us</p>
          </div>
        </div>

        {/* Brain-shaped image mask */}
        <div className="order-1 lg:order-2 shrink-0 w-[280px] md:w-[400px] lg:w-[500px] xl:w-[560px]">
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <div className="absolute inset-0 flex items-center justify-center gap-[10px]">
              {BRAIN_COLUMNS.map((col, i) => {
                // Each column needs to show the correct horizontal slice of the full image.
                // The image should span the full container width, positioned so each
                // pill reveals the matching portion.
                const colCount = BRAIN_COLUMNS.length;
                const colWidthPct = 100 / colCount - 2; // ~14.67%
                // Position of this column's left edge as % of container
                const colLeftPct = i * (100 / colCount);

                return (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-full"
                    style={{
                      width: `${colWidthPct}%`,
                      height: col.height,
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt=""
                      className="absolute max-w-none object-cover"
                      style={{
                        width: `${(100 / colWidthPct) * 100}%`,
                        height: "100%",
                        left: `${-(colLeftPct / colWidthPct) * 100}%`,
                        top: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

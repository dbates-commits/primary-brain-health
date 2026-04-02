"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
  DEFAULT_HERO_IMAGE,
} from "./hero-utils";

export function HeroNeuralSplit({
  variant = "split",
  headline,
  subheadline,
  image,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  const isReverse = variant === "splitReverse";
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface px-6 md:px-12 lg:px-20 pt-6 lg:pt-8 pb-16 lg:pb-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursor(null)}
    >
      {/* SVG filter: maps dark brain shapes → green (#c6ebda), white gaps → transparent */}
      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <filter id="nh-brain-green" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 0.776
                0 0 0 0 0.922
                0 0 0 0 0.855
                -0.2126 -0.7152 -0.0722 0 1
              "
            />
          </filter>
        </defs>
      </svg>

      {/* Base pattern — very light */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/brain-p.svg')",
          backgroundSize: "42%",
          opacity: 0.018,
        }}
      />

      {/* Cursor hover — green fills only the brain channel shapes via luminance→alpha filter */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/brain-p.svg')",
          backgroundSize: "42%",
          filter: "url(#nh-brain-green)",
          opacity: cursor ? 1 : 0,
          transition: "opacity 0.3s ease",
          WebkitMaskImage: cursor
            ? `radial-gradient(circle 320px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`
            : "none",
          maskImage: cursor
            ? `radial-gradient(circle 320px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`
            : "none",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

        {/* Text */}
        <div
          className={cn(
            "z-10 flex flex-col gap-8 lg:gap-10 flex-1",
            isReverse ? "order-2 lg:order-2" : "order-2 lg:order-1"
          )}
        >
          <div className="flex flex-col gap-4">
            <h1
              className="animate-fade-up text-4xl md:text-5xl lg:text-[56px] font-bold font-headline text-on-surface leading-[1.1] tracking-tight text-pretty"
              style={{ animationDelay: "0ms" }}
              data-tina-field={tinaFields?.headline}
            >
              {headline
                ? highlightBrainHealth(headline, "animate-brain-health-in")
                : null}
            </h1>
            {subheadline && (
              <p
                className="animate-fade-up text-lg text-on-surface leading-relaxed max-w-xl text-pretty"
                style={{ animationDelay: "180ms" }}
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>

          {primaryButtonText && (
            <a
              href={primaryButtonLink || "#"}
              className="animate-fade-up bg-primary text-on-primary px-6 py-3 rounded font-headline text-sm font-bold active:scale-90 transition-transform duration-200 inline-flex items-center justify-center w-fit"
              style={{ animationDelay: "320ms" }}
              data-tina-field={tinaFields?.primaryButtonText}
            >
              {primaryButtonText}
            </a>
          )}

          {/* Trust bar */}
          <div
            className="animate-fade-up flex flex-row items-center gap-3"
            style={{ animationDelay: "460ms" }}
          >
            <TrustAvatars />
            <p className="text-sm text-on-surface">Trusted by <span className="font-semibold">3,200+</span> patients and families</p>
          </div>
        </div>

        {/* Image */}
        <div
          className={cn(
            "animate-fade-up relative w-full lg:w-[400px] xl:w-[460px] shrink-0",
            isReverse ? "order-1 lg:order-1" : "order-1 lg:order-2"
          )}
          style={{ animationDelay: "80ms" }}
        >
          {image ? (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden">
              <Image src={image} alt={headline || ""} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden bg-surface-container-high">
              <img
                src={DEFAULT_HERO_IMAGE}
                alt="Couple enjoying cognitive wellness"
                className="w-full h-full object-cover object-[65%_center]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

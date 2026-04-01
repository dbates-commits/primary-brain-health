"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
  DEFAULT_HERO_IMAGE,
} from "./hero-utils";

export function HeroSplit({
  variant = "split",
  headline,
  subheadline,
  image,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  const isReverse = variant === "splitReverse";

  return (
    <section className="relative overflow-hidden bg-surface px-6 md:px-12 lg:px-20 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
        {/* Text */}
        <div
          className={cn(
            "z-10 flex flex-col gap-10 lg:gap-16 flex-1",
            isReverse ? "order-2 lg:order-2" : "order-2 lg:order-1"
          )}
        >
          <div className="flex flex-col gap-6">
            <h1
              className="text-4xl md:text-5xl lg:text-[56px] font-bold font-headline text-on-surface leading-[1.1] tracking-tight"
              data-tina-field={tinaFields?.headline}
            >
              {headline ? highlightBrainHealth(headline) : null}
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

        {/* Image */}
        <div
          className={cn(
            "relative w-full lg:w-[500px] xl:w-[600px] shrink-0",
            isReverse ? "order-1 lg:order-1" : "order-1 lg:order-2"
          )}
        >
          {image ? (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden">
              <Image
                src={image}
                alt={headline || ""}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square lg:aspect-[3/4] rounded-[2rem] overflow-hidden bg-surface-container-high">
              <img
                src={DEFAULT_HERO_IMAGE}
                alt="Couple enjoying cognitive wellness"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

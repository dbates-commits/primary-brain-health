"use client";

import { Button } from "@/components/shared/Button";
import { HeroProps, DEFAULT_HERO_IMAGE } from "./hero-utils";

export function HeroFullImage({
  headline,
  image,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  return (
    <div className="mx-auto max-w-[1880px] px-6 lg:px-10 mt-8">
      <section
        className="relative overflow-hidden min-h-[520px] lg:min-h-[720px] rounded-[1.25rem]"
        style={{ isolation: "isolate", transform: "translateZ(0)" }}
      >
      {/* Background video — fills edge to edge, up behind the header */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover rounded-[1.25rem]"
        poster={image || DEFAULT_HERO_IMAGE}
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        <img
          src={image || DEFAULT_HERO_IMAGE}
          alt={headline || "Hero background"}
          className="absolute inset-0 w-full h-full object-cover rounded-[1.25rem]"
        />
      </video>

      {/* Gradient overlay — bottom scrim only for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-[1.25rem]" />

      {/* Content — centered column, bottom-aligned */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full min-h-[520px] lg:min-h-[720px] px-6 md:px-10 pt-24 pb-10 lg:pb-14 gap-10 text-center">
        <h1
          className="animate-fade-up font-headline font-normal text-white text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-pretty max-w-5xl"
          style={{ animationDelay: "150ms" }}
          data-tina-field={tinaFields?.headline}
        >
          {headline}
        </h1>

        {primaryButtonText && (
          <div
            className="animate-fade-up"
            style={{ animationDelay: "350ms" }}
            data-tina-field={tinaFields?.primaryButtonText}
          >
            <Button
              href={primaryButtonLink}
              variant="solid"
              color="primary"
              size="lg"
            >
              {primaryButtonText}
            </Button>
          </div>
        )}
      </div>
      </section>
    </div>
  );
}

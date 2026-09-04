"use client";

import type { ReactNode } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Button } from "@pbh/ui";
import { HeroProps, DEFAULT_HERO_IMAGE } from "./hero-utils";

export function HeroFullImage({
  headline,
  subheadlineRich,
  image,
  primaryButtonText,
  primaryButtonTextMobile,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  return (
    <div className="mx-auto max-w-[1880px] px-6 lg:px-10 mt-8">
      <section
        className="relative overflow-hidden min-h-[440px] sm:min-h-[520px] lg:min-h-[min(78vh,720px)] rounded-[1.25rem]"
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
      <div className="relative z-10 flex flex-col items-center justify-end h-full min-h-[440px] sm:min-h-[520px] lg:min-h-[min(78vh,720px)] px-6 lg:px-10 pt-20 sm:pt-24 pb-8 sm:pb-10 lg:pb-14 gap-6 sm:gap-10 text-center">
        {/* Headline and subhead are one block (Figma 2267:2764): 8px apart from
            each other, and the column's own gap away from the button. The 1280px
            cap is the design's text column — anything narrower breaks
            "Take Control of Your Brain Health" across two lines at 80px. (The
            40px inner padding waits for `lg` for the same reason: at 768 it
            costs the 48px step the ~2px it needs to stay on one line.) */}
        <div className="flex w-full max-w-[1280px] flex-col gap-2">
          <h1
            className="animate-fade-up font-headline font-thin text-text-inverse text-h3 md:text-h2 lg:text-h1 xl:text-display text-pretty"
            style={{ animationDelay: "150ms" }}
            data-tina-field={tinaFields?.headline}
          >
            {headline}
          </h1>

          {subheadlineRich && (
            <div
              className="animate-fade-up"
              style={{ animationDelay: "250ms" }}
              data-tina-field={tinaFields?.subheadline}
            >
              <TinaMarkdown
                content={subheadlineRich}
                // The field is rich text, but the design is one quiet line
                // under the headline — so a paragraph is all that is styled,
                // and anything else an editor reaches for renders unstyled
                // rather than silently taking on the subhead's size.
                components={{
                  p: (props?: { children?: ReactNode }) => (
                    <p className="font-headline font-thin text-body-lg md:text-h5 lg:text-h4 text-text-inverse-secondary text-pretty">
                      {props?.children}
                    </p>
                  ),
                }}
              />
            </div>
          )}
        </div>

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
              size="md"
              className="text-balance"
            >
              <span className="sm:hidden">
                {primaryButtonTextMobile || primaryButtonText}
              </span>
              <span className="hidden sm:inline">{primaryButtonText}</span>
            </Button>
          </div>
        )}
      </div>
      </section>
    </div>
  );
}

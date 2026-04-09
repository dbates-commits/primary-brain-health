"use client";

import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
  DEFAULT_HERO_IMAGE,
} from "./hero-utils";

export function HeroFullImage({
  headline,
  subheadline,
  image,
  tinaFields,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[520px] lg:min-h-[640px] mx-4 lg:mx-6 mt-8 mb-8 max-w-[1800px] 2xl:mx-auto rounded-3xl">

      {/* Background video — fills edge to edge, up behind the header */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={image || DEFAULT_HERO_IMAGE}
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        <img
          src={image || DEFAULT_HERO_IMAGE}
          alt={headline || "Hero background"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </video>

      {/* Gradient overlay — bottom scrim only for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content — pt-20 clears the fixed header */}
      <div className="relative z-10 flex flex-col justify-end h-full min-h-[520px] lg:min-h-[640px] px-0 pt-20 lg:pt-24 pb-10 lg:pb-14 max-w-7xl mx-auto w-full">

        {/* Mobile headline */}
        <div className="lg:hidden mb-auto animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h1
            className="text-3xl font-bold text-white leading-[1.15] text-pretty font-headline"
            data-tina-field={tinaFields?.headline}
          >
            {headline ? highlightBrainHealth(headline, "text-secondary-container") : null}
          </h1>
        </div>

        {/* Desktop: headline left, card right */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div
            className="hidden lg:block flex-1 max-w-[580px] animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            <h1
              className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] text-pretty font-headline"
              data-tina-field={tinaFields?.headline}
            >
              {headline ? highlightBrainHealth(headline, "text-secondary-container") : null}
            </h1>
          </div>

          {/* Info card */}
          <div
            className="lg:w-[340px] shrink-0 bg-black/30 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3 border border-white/10 animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
            {subheadline && (
              <p
                className="text-xs text-white/90 leading-relaxed text-pretty"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
            <div className="border-t border-white/15 pt-3 flex items-center gap-2.5">
              <TrustAvatars borderClass="border-white/30" />
              <div>
                <p className="text-xs text-white/65 whitespace-nowrap">Trusted by <span className="font-semibold text-white">3,200+</span> patients and families</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

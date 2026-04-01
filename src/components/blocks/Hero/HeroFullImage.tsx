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
    <section className="bg-surface px-5 lg:px-10 pt-5 lg:pt-10">
      <div className="relative rounded-3xl overflow-hidden min-h-[700px] lg:min-h-[900px]">
        {/* Background image */}
        <img
          src={image || DEFAULT_HERO_IMAGE}
          alt={headline || "Hero background"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/40" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end h-full min-h-[700px] lg:min-h-[900px] p-6 lg:p-10 gap-6">
          {/* Mobile: headline at top */}
          <div className="lg:hidden mb-auto">
            <h1
              className="text-4xl md:text-5xl font-bold font-headline text-white leading-[1.1] tracking-tight"
              data-tina-field={tinaFields?.headline}
            >
              {headline
                ? highlightBrainHealth(headline, "text-secondary-container")
                : null}
            </h1>
          </div>

          {/* Bottom content */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Desktop: headline at bottom-left */}
            <div className="hidden lg:block flex-1">
              <h1
                className="text-6xl xl:text-[80px] font-bold font-headline text-white leading-[1.1] tracking-tight"
                data-tina-field={tinaFields?.headline}
              >
                {headline
                  ? highlightBrainHealth(headline, "text-secondary-container")
                  : null}
              </h1>
            </div>

            {/* Right column: trust card + subheadline */}
            <div className="flex flex-col gap-4 lg:w-[400px] shrink-0">
              {/* Trust card */}
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center gap-2">
                <TrustAvatars borderClass="border-white/50" />
                <p className="text-2xl font-bold text-on-surface">
                  3,200,000+
                </p>
                <p className="text-xl text-on-surface">Patients Trust Us</p>
              </div>

              {subheadline && (
                <p
                  className="text-lg lg:text-2xl text-white leading-relaxed"
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

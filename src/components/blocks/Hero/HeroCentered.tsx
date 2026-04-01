"use client";

import { HeroProps } from "./hero-utils";

export function HeroCentered({
  headline,
  subheadline,
  primaryButtonText,
  primaryButtonLink,
  badge,
  tinaFields,
}: HeroProps) {
  return (
    <section className="relative py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-3xl mx-auto text-center">
        {badge && (
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-secondary-container text-on-secondary-container font-headline"
            data-tina-field={tinaFields?.badge}
          >
            {badge}
          </span>
        )}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-primary tracking-tight mb-6"
          data-tina-field={tinaFields?.headline}
        >
          {headline}
        </h1>
        {subheadline && (
          <p
            className="text-lg md:text-xl text-on-surface-variant mb-8"
            data-tina-field={tinaFields?.subheadline}
          >
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButtonText && (
            <a
              href={primaryButtonLink || "#"}
              className="bg-secondary text-on-secondary px-10 py-5 rounded-xl font-headline text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
              data-tina-field={tinaFields?.primaryButtonText}
            >
              {primaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

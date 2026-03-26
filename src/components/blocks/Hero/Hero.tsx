"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface TinaFieldsMap {
  headline?: string;
  subheadline?: string;
  badge?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export interface HeroProps {
  variant?: "centered" | "split" | "splitReverse" | "video" | "gradient";
  theme?: "light" | "dark" | "primary" | "secondary";
  headline?: string;
  subheadline?: string;
  image?: string;
  videoUrl?: string;
  backgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badge?: string;
  gradientFrom?: string;
  gradientTo?: string;
  tinaFields?: TinaFieldsMap;
}

export function Hero({
  variant = "centered",
  headline,
  subheadline,
  image,
  primaryButtonText,
  primaryButtonLink,
  badge,
  tinaFields,
}: HeroProps) {
  if (variant === "split" || variant === "splitReverse") {
    const isReverse = variant === "splitReverse";
    return (
      <section className="relative min-h-[870px] flex items-center overflow-hidden px-8 md:px-16 py-12">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className={cn("z-10", isReverse ? "order-1 md:order-2" : "order-2 md:order-1")}>
            {badge && (
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-secondary-container text-on-secondary-container font-headline"
                data-tina-field={tinaFields?.badge}
              >
                {badge}
              </span>
            )}
            <h1
              className="text-5xl md:text-7xl font-extrabold font-headline text-primary leading-[1.1] mb-6 tracking-tight"
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                className="text-xl md:text-2xl text-on-surface-variant leading-relaxed mb-10 max-w-xl"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryButtonText && (
                <a
                  href={primaryButtonLink || "#"}
                  className="bg-secondary text-on-secondary px-10 py-5 rounded-xl font-headline text-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
                  data-tina-field={tinaFields?.primaryButtonText}
                >
                  {primaryButtonText}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          <div className={cn("relative", isReverse ? "order-2 md:order-1" : "order-1 md:order-2")}>
            {image ? (
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={image}
                  alt={headline || ""}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl bg-surface-container-high">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNxnMqkM7wh-NeTbmWT0l2NlKUmJrrTidcZnWEXxvnju2Jei6aDT63L4nXAt4hLnKpR4AMo0x0Bbid-t81ttvL3rMd_PITyqJLpFd3_eyjDKgKi_lBlIPPg8xKtKCFciAth4zPjMVEhM5dmUvoN7EWuV42RwaKVZGe3K80g-xQAURoDSV8EXI2JAHYyllON3lyJiu1xdFKgu1m53AQ2Xw-cdOvkEx1ZMgIlfBd3DIt03CqdxUNKudZTJL2iPRbSShdEMxFqbcz2WQ"
                  alt="Couple enjoying cognitive wellness"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Neural motif overlay */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-container/30 rounded-full blur-3xl" />
          </div>
        </div>
      </section>
    );
  }

  // Centered variant
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

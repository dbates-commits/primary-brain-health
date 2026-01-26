"use client";

import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
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

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    badge: "bg-indigo-100 text-indigo-700",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-300",
    badge: "bg-indigo-900 text-indigo-300",
  },
  primary: {
    bg: "bg-indigo-600",
    headline: "text-white",
    subheadline: "text-indigo-100",
    badge: "bg-white/20 text-white",
  },
  secondary: {
    bg: "bg-gray-800",
    headline: "text-white",
    subheadline: "text-gray-300",
    badge: "bg-indigo-500 text-white",
  },
};

export function Hero({
  variant = "centered",
  theme = "light",
  headline,
  subheadline,
  image,
  videoUrl,
  backgroundImage,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  badge,
  gradientFrom = "#6366f1",
  gradientTo = "#8b5cf6",
  tinaFields,
}: HeroProps) {
  const styles = themeStyles[theme];
  const isDark = theme === "dark" || theme === "primary" || theme === "secondary";

  if (variant === "centered") {
    return (
      <section className={cn("relative py-20 lg:py-32", styles.bg)}>
        {backgroundImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {badge && (
              <span
                className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6", styles.badge)}
                data-tina-field={tinaFields?.badge}
              >
                {badge}
              </span>
            )}
            <h1
              className={cn("text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6", styles.headline)}
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                className={cn("text-lg md:text-xl mb-8", styles.subheadline)}
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonText && (
                <Button
                  href={primaryButtonLink}
                  variant="solid"
                  color={isDark ? "white" : "primary"}
                  size="lg"
                  data-tina-field={tinaFields?.primaryButtonText}
                >
                  {primaryButtonText}
                </Button>
              )}
              {secondaryButtonText && (
                <Button
                  href={secondaryButtonLink}
                  variant="outline"
                  color={isDark ? "white" : "primary"}
                  size="lg"
                  data-tina-field={tinaFields?.secondaryButtonText}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "split" || variant === "splitReverse") {
    const isReverse = variant === "splitReverse";
    return (
      <section className={cn("py-20 lg:py-32", styles.bg)}>
        <Container>
          <div className={cn("grid lg:grid-cols-2 gap-12 lg:gap-16 items-center", isReverse && "lg:flex-row-reverse")}>
            <div className={cn(isReverse && "lg:order-2")}>
              {badge && (
                <span
                  className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6", styles.badge)}
                  data-tina-field={tinaFields?.badge}
                >
                  {badge}
                </span>
              )}
              <h1
                className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-6", styles.headline)}
                data-tina-field={tinaFields?.headline}
              >
                {headline}
              </h1>
              {subheadline && (
                <p
                  className={cn("text-lg md:text-xl mb-8", styles.subheadline)}
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryButtonText && (
                  <Button
                    href={primaryButtonLink}
                    variant="solid"
                    color={isDark ? "white" : "primary"}
                    size="lg"
                    data-tina-field={tinaFields?.primaryButtonText}
                  >
                    {primaryButtonText}
                  </Button>
                )}
                {secondaryButtonText && (
                  <Button
                    href={secondaryButtonLink}
                    variant="outline"
                    color={isDark ? "white" : "primary"}
                    size="lg"
                    data-tina-field={tinaFields?.secondaryButtonText}
                  >
                    {secondaryButtonText}
                  </Button>
                )}
              </div>
            </div>
            <div className={cn("relative", isReverse && "lg:order-1")}>
              {image && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={image}
                    alt={headline || ""}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "video") {
    return (
      <section className="relative py-20 lg:py-32 bg-gray-900 overflow-hidden">
        {videoUrl && (
          <div className="absolute inset-0 z-0">
            <iframe
              src={`${videoUrl}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoUrl.split("/").pop()}`}
              className="absolute inset-0 w-full h-full object-cover"
              allow="autoplay; fullscreen"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {badge && (
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-white/20 text-white"
                data-tina-field={tinaFields?.badge}
              >
                {badge}
              </span>
            )}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white"
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                className="text-lg md:text-xl mb-8 text-gray-200"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonText && (
                <Button
                  href={primaryButtonLink}
                  variant="solid"
                  color="white"
                  size="lg"
                  data-tina-field={tinaFields?.primaryButtonText}
                >
                  {primaryButtonText}
                </Button>
              )}
              {secondaryButtonText && (
                <Button
                  href={secondaryButtonLink}
                  variant="outline"
                  color="white"
                  size="lg"
                  data-tina-field={tinaFields?.secondaryButtonText}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "gradient") {
    return (
      <section
        className="py-20 lg:py-32"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
      >
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            {badge && (
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-white/20 text-white"
                data-tina-field={tinaFields?.badge}
              >
                {badge}
              </span>
            )}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white"
              data-tina-field={tinaFields?.headline}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                className="text-lg md:text-xl mb-8 text-white/80"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonText && (
                <Button
                  href={primaryButtonLink}
                  variant="solid"
                  color="white"
                  size="lg"
                  data-tina-field={tinaFields?.primaryButtonText}
                >
                  {primaryButtonText}
                </Button>
              )}
              {secondaryButtonText && (
                <Button
                  href={secondaryButtonLink}
                  variant="outline"
                  color="white"
                  size="lg"
                  data-tina-field={tinaFields?.secondaryButtonText}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return null;
}

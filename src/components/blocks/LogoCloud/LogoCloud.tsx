"use client";

import { Container } from "@/components/shared/Container";
import { Section } from "@/components/shared/Section";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Logo {
  image: string;
  name: string;
  url?: string;
}

export interface LogoCloudProps {
  variant?: "simple" | "marquee" | "grid";
  theme?: "light" | "dark";
  headline?: string;
  subheadline?: string;
  grayscale?: boolean;
  size?: "small" | "medium" | "large";
  logos?: Logo[];
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-500",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
  },
};

const sizeClasses = {
  small: "h-8",
  medium: "h-12",
  large: "h-16",
};

export function LogoCloud({
  variant = "simple",
  theme = "light",
  headline,
  subheadline,
  grayscale = true,
  size = "medium",
  logos = [],
}: LogoCloudProps) {
  const styles = themeStyles[theme];
  const logoHeight = sizeClasses[size];

  const LogoImage = ({ logo }: { logo: Logo }) => {
    const img = (
      <div className={cn("relative", logoHeight, "w-auto")}>
        <Image
          src={logo.image}
          alt={logo.name}
          width={150}
          height={50}
          className={cn(
            "h-full w-auto object-contain transition-all duration-300",
            grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
          )}
        />
      </div>
    );

    if (logo.url) {
      return (
        <a
          href={logo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          {img}
        </a>
      );
    }

    return img;
  };

  if (variant === "simple") {
    return (
      <Section className={cn("py-16", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center mb-10">
              {headline && (
                <p className={cn("text-sm font-semibold uppercase tracking-wider mb-2", styles.subheadline)}>
                  {headline}
                </p>
              )}
              {subheadline && (
                <p className={cn("text-sm", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {logos.map((logo, index) => (
              <LogoImage key={index} logo={logo} />
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  if (variant === "marquee") {
    return (
      <Section className={cn("py-16 overflow-hidden", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center mb-10">
              {headline && (
                <p className={cn("text-sm font-semibold uppercase tracking-wider mb-2", styles.subheadline)}>
                  {headline}
                </p>
              )}
              {subheadline && (
                <p className={cn("text-sm", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
        </Container>
        <div className="relative">
          <div className="animate-marquee flex gap-12 whitespace-nowrap">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0">
                <LogoImage logo={logo} />
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
      </Section>
    );
  }

  // Grid variant
  return (
    <Section className={cn("py-16", styles.bg)}>
      <Container>
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            {headline && (
              <p className={cn("text-sm font-semibold uppercase tracking-wider mb-2", styles.subheadline)}>
                {headline}
              </p>
            )}
            {subheadline && (
              <p className={cn("text-sm", styles.subheadline)}>{subheadline}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {logos.map((logo, index) => (
            <LogoImage key={index} logo={logo} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

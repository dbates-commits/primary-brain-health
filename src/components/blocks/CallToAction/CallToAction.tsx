"use client";

import { Container } from "@/components/shared/Container";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/shared/Button";
import { Heading } from "@/components/shared/Heading";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface CallToActionProps {
  variant?: "simple" | "withImage" | "newsletter" | "reference";
  theme?: "light" | "dark" | "primary" | "gradient";
  headline?: string;
  description?: string;
  image?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  emailPlaceholder?: string;
  submitButtonText?: string;
}

const themeStyles = {
  light: {
    bg: "bg-gray-100",
    headline: "text-gray-900",
    description: "text-gray-600",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    inputText: "text-gray-900",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    description: "text-gray-300",
    inputBg: "bg-gray-800",
    inputBorder: "border-gray-700",
    inputText: "text-white",
  },
  primary: {
    bg: "bg-indigo-600",
    headline: "text-white",
    description: "text-indigo-100",
    inputBg: "bg-white",
    inputBorder: "border-transparent",
    inputText: "text-gray-900",
  },
  gradient: {
    bg: "bg-gradient-to-r from-indigo-600 to-purple-600",
    headline: "text-white",
    description: "text-indigo-100",
    inputBg: "bg-white",
    inputBorder: "border-transparent",
    inputText: "text-gray-900",
  },
};

export function CallToAction({
  variant = "simple",
  theme = "primary",
  headline,
  description,
  image,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  emailPlaceholder = "Enter your email",
  submitButtonText = "Subscribe",
}: CallToActionProps) {
  const styles = themeStyles[theme];
  const isDark = theme === "dark" || theme === "primary" || theme === "gradient";

  if (variant === "simple") {
    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
          <div className="text-center">
            {headline && (
              <Heading size="md" className={cn("mb-4", styles.headline)}>
                {headline}
              </Heading>
            )}
            {description && (
              <p className={cn("text-lg mb-8 max-w-2xl mx-auto", styles.description)}>
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonText && (
                <Button
                  href={primaryButtonLink}
                  variant="solid"
                  color={isDark ? "white" : "primary"}
                  size="lg"
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
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (variant === "withImage") {
    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {description && (
                <p className={cn("text-lg mb-8", styles.description)}>{description}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryButtonText && (
                  <Button
                    href={primaryButtonLink}
                    variant="solid"
                    color={isDark ? "white" : "primary"}
                    size="lg"
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
                  >
                    {secondaryButtonText}
                  </Button>
                )}
              </div>
            </div>
            {image && (
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src={image} alt="" fill className="object-cover" />
              </div>
            )}
          </div>
        </Container>
      </Section>
    );
  }

  if (variant === "newsletter") {
    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
          <div className="text-center">
            {headline && (
              <Heading size="md" className={cn("mb-4", styles.headline)}>
                {headline}
              </Heading>
            )}
            {description && (
              <p className={cn("text-lg mb-8", styles.description)}>{description}</p>
            )}
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={emailPlaceholder}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500",
                  styles.inputBg,
                  styles.inputBorder,
                  styles.inputText
                )}
              />
              <Button type="submit" variant="solid" color={isDark ? "white" : "primary"}>
                {submitButtonText}
              </Button>
            </form>
          </div>
        </Container>
      </Section>
    );
  }

  // Reference variant - same as simple but designed to pull from global CTAs
  return (
    <Section className={cn("py-20", styles.bg)}>
      <Container size="narrow">
        <div className="text-center">
          {headline && (
            <Heading size="md" className={cn("mb-4", styles.headline)}>
              {headline}
            </Heading>
          )}
          {description && (
            <p className={cn("text-lg mb-8 max-w-2xl mx-auto", styles.description)}>
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryButtonText && (
              <Button
                href={primaryButtonLink}
                variant="solid"
                color={isDark ? "white" : "primary"}
                size="lg"
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
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

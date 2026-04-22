"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { Section } from "@/components/shared/Section";
import { Icon } from "@/components/shared/Icon";
import { Button } from "@/components/shared/Button";
import { Heading } from "@/components/shared/Heading";
import { cn } from "@/lib/utils";

type RichTextAnswer = {
  type: string;
  children: Array<{ type: string; children?: Array<{ type: string; text: string }> }>;
};

interface FAQItem {
  question: string;
  answer?: string | RichTextAnswer;
  category?: string;
}

export interface FAQProps {
  variant?: "accordion" | "twoColumn" | "cards";
  theme?: "light" | "dark";
  headline?: string;
  subheadline?: string;
  items?: FAQItem[];
  showCategories?: boolean;
  ctaText?: string;
  ctaButtonText?: string;
  ctaLink?: string;
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    question: "text-gray-900",
    answer: "text-gray-600",
    border: "border-gray-200",
    hoverBg: "hover:bg-gray-50",
    cardBg: "bg-gray-50",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    question: "text-white",
    answer: "text-gray-300",
    border: "border-gray-700",
    hoverBg: "hover:bg-gray-800",
    cardBg: "bg-gray-800",
  },
};

function renderRichText(content: FAQItem["answer"]): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!content.children) return "";
  return content.children
    .map((node) => {
      if (node.children) {
        return node.children.map((child) => child.text || "").join("");
      }
      return "";
    })
    .join("\n");
}

export function FAQ({
  variant = "accordion",
  theme = "light",
  headline,
  subheadline,
  items = [],
  ctaText,
  ctaButtonText,
  ctaLink,
}: FAQProps) {
  const styles = themeStyles[theme];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (variant === "accordion") {
    return (
      <Section
        className={cn("py-20 md:py-28 px-6 md:px-10", styles.bg)}
        stagger={90}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
          {(headline || subheadline) && (
            <div data-scroll-item className="text-center max-w-3xl">
              {headline && (
                <h1 className="font-headline font-normal text-4xl md:text-5xl lg:text-6xl leading-[1.15] text-on-surface text-balance">
                  {headline}
                </h1>
              )}
              {subheadline && (
                <p className="text-base md:text-lg text-on-surface-variant mt-4">
                  {subheadline}
                </p>
              )}
            </div>
          )}

          <div className="w-full divide-y divide-outline-variant/30">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} data-scroll-item>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-body text-lg md:text-xl font-medium text-on-surface pr-4">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "relative flex-shrink-0 w-6 h-6 transition-transform duration-300 ease-out",
                        isOpen && "rotate-45"
                      )}
                      aria-hidden="true"
                    >
                      <span className="absolute top-1/2 left-0 right-0 h-px bg-on-surface -translate-y-1/2" />
                      <span className="absolute left-1/2 top-0 bottom-0 w-px bg-on-surface -translate-x-1/2" />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-6 -mt-1 text-on-surface-variant leading-relaxed max-w-3xl">
                        {renderRichText(item.answer)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ctaLink && (ctaButtonText || ctaText) && (
            <div data-scroll-item className="text-center mt-4">
              {ctaText && (
                <p className="mb-4 text-on-surface-variant">{ctaText}</p>
              )}
              {ctaButtonText && (
                <Button href={ctaLink} variant="outline" color="primary">
                  {ctaButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (variant === "twoColumn") {
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {leftItems.map((item, index) => (
                <div key={index}>
                  <h3 className={cn("font-semibold mb-2", styles.question)}>{item.question}</h3>
                  <p className={styles.answer}>{renderRichText(item.answer)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-8">
              {rightItems.map((item, index) => (
                <div key={index}>
                  <h3 className={cn("font-semibold mb-2", styles.question)}>{item.question}</h3>
                  <p className={styles.answer}>{renderRichText(item.answer)}</p>
                </div>
              ))}
            </div>
          </div>
          {ctaText && ctaLink && (
            <div className="text-center mt-12">
              <p className={cn("mb-4", styles.subheadline)}>{ctaText}</p>
              <Button href={ctaLink} variant="outline" color={theme === "dark" ? "white" : "primary"}>
                Contact Us
              </Button>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  if (variant === "cards") {
    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div key={index} className={cn("rounded-xl p-6", styles.cardBg)}>
                <h3 className={cn("font-semibold mb-3", styles.question)}>{item.question}</h3>
                <p className={cn("text-sm", styles.answer)}>{renderRichText(item.answer)}</p>
              </div>
            ))}
          </div>
          {ctaText && ctaLink && (
            <div className="text-center mt-12">
              <p className={cn("mb-4", styles.subheadline)}>{ctaText}</p>
              <Button href={ctaLink} variant="outline" color={theme === "dark" ? "white" : "primary"}>
                Contact Us
              </Button>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  return null;
}

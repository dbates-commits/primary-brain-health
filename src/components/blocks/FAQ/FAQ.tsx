"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { Icon } from "@/components/shared/Icon";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer?: {
    type: string;
    children: Array<{ type: string; children?: Array<{ type: string; text: string }> }>;
  };
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
  if (!content?.children) return "";
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
  ctaLink,
}: FAQProps) {
  const styles = themeStyles[theme];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (variant === "accordion") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
          {(headline || subheadline) && (
            <div className="text-center mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className={cn("border rounded-lg overflow-hidden", styles.border)}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className={cn(
                    "w-full flex items-center justify-between p-5 text-left transition-colors",
                    styles.hoverBg
                  )}
                >
                  <span className={cn("font-medium pr-4", styles.question)}>{item.question}</span>
                  <Icon
                    name="chevronDown"
                    size="sm"
                    className={cn(
                      "flex-shrink-0 transition-transform",
                      styles.answer,
                      openIndex === index && "rotate-180"
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className={cn("px-5 pb-5", styles.answer)}>
                    <p>{renderRichText(item.answer)}</p>
                  </div>
                )}
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
      </section>
    );
  }

  if (variant === "twoColumn") {
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
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
      </section>
    );
  }

  if (variant === "cards") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
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
      </section>
    );
  }

  return null;
}

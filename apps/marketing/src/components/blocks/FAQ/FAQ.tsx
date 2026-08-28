"use client";

import { useState } from "react";
import { Container } from "@pbh/ui";
import { Section } from "@pbh/ui";
import { Icon } from "@pbh/ui";
import { Button } from "@pbh/ui";
import { Heading } from "@pbh/ui";
import { cn } from "@pbh/ui/utils";

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
  tinaFields?: {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    ctaButtonText?: string;
  };
}

/**
 * The two grounds this block can sit on, in design-system tokens.
 *
 * Figma models the FAQ's own colours as `FAQs/question-color`,
 * `FAQs/answer-color` and `FAQs/border-color`, which alias `text/heading`,
 * `text/default` and `border/default` — that is the `light` row. Figma has no
 * dark FAQ, so `dark` is the brand ground the design uses elsewhere for an
 * inverted section, rather than the neutral near-black it inherited from the
 * Tina starter.
 */
const themeStyles = {
  light: {
    bg: "bg-background-default",
    headline: "text-text-heading",
    subheadline: "text-text-default",
    // FAQs/question-color -> text/heading
    question: "text-text-heading",
    // FAQs/answer-color -> text/default
    answer: "text-text-default",
    // FAQs/border-color -> border/default
    border: "border-border-default",
    hoverBg: "hover:bg-background-subtle",
    cardBg: "bg-background-subtle",
  },
  dark: {
    bg: "bg-background-brand",
    headline: "text-text-inverse",
    subheadline: "text-text-inverse-secondary",
    question: "text-text-inverse",
    answer: "text-text-inverse-secondary",
    border: "border-border-inverse/20",
    hoverBg: "hover:bg-brand-active",
    cardBg: "bg-brand-active",
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
  tinaFields,
}: FAQProps) {
  const styles = themeStyles[theme];
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set([0]));
  const toggleIndex = (index: number) =>
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

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
                <h1
                  data-tina-field={tinaFields?.headline}
                  className="font-headline font-thin text-4xl md:text-h2 lg:text-6xl leading-[1.15] text-ink-strong text-balance"
                >
                  {headline}
                </h1>
              )}
              {subheadline && (
                <p
                  data-tina-field={tinaFields?.subheadline}
                  className="text-body md:text-lg text-text-default mt-4 text-balance md:text-wrap"
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}

          <div className="w-full divide-y divide-outline-variant/30">
            {items.map((item, index) => {
              const isOpen = openIndices.has(index);
              return (
                <div key={index} data-scroll-item>
                  <button
                    onClick={() => toggleIndex(index)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-body text-lg md:text-body-lg font-medium text-ink-strong pr-4">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "relative flex-shrink-0 w-6 h-6 transition-transform duration-300 ease-out",
                        isOpen && "rotate-45"
                      )}
                      aria-hidden="true"
                    >
                      <span className="absolute top-1/2 left-0 right-0 h-px bg-ink-strong -translate-y-1/2" />
                      <span className="absolute left-1/2 top-0 bottom-0 w-px bg-ink-strong -translate-x-1/2" />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-6 -mt-1 text-text-default leading-relaxed max-w-3xl">
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
                <p
                  data-tina-field={tinaFields?.ctaText}
                  className="mb-4 text-text-default"
                >
                  {ctaText}
                </p>
              )}
              {ctaButtonText && (
                <span data-tina-field={tinaFields?.ctaButtonText}>
                  <Button href={ctaLink} variant="outline" color="primary">
                    {ctaButtonText}
                  </Button>
                </span>
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
                <p className={cn("text-body-sm", styles.answer)}>{renderRichText(item.answer)}</p>
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

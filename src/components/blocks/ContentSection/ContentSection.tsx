"use client";

import { cn } from "@/lib/utils";
import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";
import { Heading } from "@/components/shared/Heading";
import { Section } from "@/components/shared/Section";

export interface ContentSectionProps {
  variant?: "default" | "twoColumn" | "withSidebar";
  theme?: "light" | "dark";
  label?: string;
  headline?: string;
  bodyText?: string;
  body?: TinaMarkdownContent;
  sidebarContent?: TinaMarkdownContent;
  leftColumn?: TinaMarkdownContent;
  rightColumn?: TinaMarkdownContent;
  tinaFields?: {
    label?: string;
    headline?: string;
    bodyText?: string;
  };
}

export function ContentSection({
  variant = "default",
  label,
  headline,
  bodyText,
  body,
  sidebarContent,
  leftColumn,
  rightColumn,
  tinaFields,
}: ContentSectionProps) {
  if (variant === "default") {
    const paragraphs = bodyText ? bodyText.split("\n\n") : [];

    return (
      <Section id="about" className="bg-surface-container-lowest py-16 lg:py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: subtitle + heading */}
          <div className="flex-1 flex flex-col gap-6">
            {label && (
              <div data-scroll-item>
                <span
                  className="font-body font-medium text-secondary tracking-wide uppercase text-lg md:text-2xl"
                  data-tina-field={tinaFields?.label}
                >
                  {label}
                </span>
              </div>
            )}
            {headline && (
              <Heading
                size="lg"
                data-scroll-item
                className="lg:text-[56px] leading-[1.1] text-balance"
                data-tina-field={tinaFields?.headline}
              >
                {headline}
              </Heading>
            )}
          </div>

          {/* Right: body paragraphs */}
          <div className="flex flex-col gap-10 lg:w-[600px] shrink-0" data-tina-field={tinaFields?.bodyText}>
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                data-scroll-item
                className="text-lg md:text-xl text-on-surface-variant leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            {!bodyText && body && (
              <div data-scroll-item className="prose prose-lg max-w-none text-on-surface-variant">
                <TinaMarkdown content={body} />
              </div>
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (variant === "twoColumn") {
    return (
      <Section className="bg-surface-container-lowest py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          {headline && (
            <Heading size="lg" className="mb-12 text-center text-balance">
              {headline}
            </Heading>
          )}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="prose prose-lg max-w-none text-on-surface-variant">
              {leftColumn && <TinaMarkdown content={leftColumn} />}
            </div>
            <div className="prose prose-lg max-w-none text-on-surface-variant">
              {rightColumn && <TinaMarkdown content={rightColumn} />}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (variant === "withSidebar") {
    return (
      <Section className={cn("py-24 md:py-32 px-8 md:px-16")}>
        <div className="max-w-7xl mx-auto">
          {headline && (
            <Heading size="lg" className="mb-12 text-balance">
              {headline}
            </Heading>
          )}
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 prose prose-lg max-w-none text-on-surface-variant">
              {body && <TinaMarkdown content={body} />}
            </div>
            <aside className="prose prose-lg max-w-none text-on-surface-variant">
              {sidebarContent && <TinaMarkdown content={sidebarContent} />}
            </aside>
          </div>
        </div>
      </Section>
    );
  }

  return null;
}

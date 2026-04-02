"use client";

import { cn } from "@/lib/utils";
import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";

export interface ContentSectionProps {
  variant?: "default" | "twoColumn" | "withSidebar";
  theme?: "light" | "dark";
  headline?: string;
  bodyText?: string;
  body?: TinaMarkdownContent;
  sidebarContent?: TinaMarkdownContent;
  leftColumn?: TinaMarkdownContent;
  rightColumn?: TinaMarkdownContent;
}

export function ContentSection({
  variant = "default",
  headline,
  bodyText,
  body,
  sidebarContent,
  leftColumn,
  rightColumn,
}: ContentSectionProps) {
  if (variant === "default") {
    const paragraphs = bodyText ? bodyText.split("\n\n") : [];

    return (
      <section id="about" data-scroll-reveal className="bg-surface-container-lowest py-16 lg:py-20 px-6 md:px-12 lg:px-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: subtitle + heading */}
          <div className="flex-1 flex flex-col gap-6">
            <div data-scroll-item className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error" />
              <span className="font-body font-medium text-error tracking-wide uppercase text-lg md:text-2xl">
                Our Philosophy
              </span>
            </div>
            {headline && (
              <h2
                data-scroll-item
                className="text-4xl md:text-5xl lg:text-[56px] font-semibold font-headline text-on-surface leading-[1.1] text-balance"
              >
                {headline}
              </h2>
            )}
          </div>

          {/* Right: body paragraphs */}
          <div className="flex flex-col gap-10 lg:w-[600px] shrink-0">
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
      </section>
    );
  }

  if (variant === "twoColumn") {
    return (
      <section className="bg-surface-container-lowest py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          {headline && (
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-12 text-center text-balance">
              {headline}
            </h2>
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
      </section>
    );
  }

  if (variant === "withSidebar") {
    return (
      <section className={cn("py-24 md:py-32 px-8 md:px-16")}>
        <div className="max-w-7xl mx-auto">
          {headline && (
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-12 text-balance">
              {headline}
            </h2>
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
      </section>
    );
  }

  return null;
}

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
    return (
      <section id="about" className="bg-surface-container-lowest py-24 md:py-32 px-8 md:px-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <span className="font-headline font-bold text-secondary tracking-widest uppercase text-sm mb-4 block">
            Our Philosophy
          </span>
          {headline && (
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-12">
              {headline}
            </h2>
          )}
          {bodyText && (
            <div className="grid md:grid-cols-2 gap-12">
              {bodyText.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-lg md:text-xl text-on-surface-variant leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          {!bodyText && body && (
            <div className="prose prose-lg max-w-none text-on-surface-variant">
              <TinaMarkdown content={body} />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "twoColumn") {
    return (
      <section className="bg-surface-container-lowest py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          {headline && (
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-12 text-center">
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
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-12">
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

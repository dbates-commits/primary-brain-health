"use client";

import { Container } from "@/components/shared/Container";
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

const themeStyles = {
  light: {
    bg: "",
    headline: "text-gray-900",
    prose: "prose prose-gray",
    text: "text-gray-600",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    prose: "prose prose-invert",
    text: "text-gray-300",
  },
};

export function ContentSection({
  variant = "default",
  theme = "light",
  headline,
  bodyText,
  body,
  sidebarContent,
  leftColumn,
  rightColumn,
}: ContentSectionProps) {
  const styles = themeStyles[theme];

  if (variant === "default") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
          {headline && (
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-8", styles.headline)}>
              {headline}
            </h2>
          )}
          {bodyText && (
            <div className={cn("max-w-none space-y-4", styles.text)}>
              {bodyText.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          {!bodyText && body && (
            <div className={cn("max-w-none", styles.prose)}>
              <TinaMarkdown content={body} />
            </div>
          )}
        </Container>
      </section>
    );
  }

  if (variant === "twoColumn") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {headline && (
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-12 text-center", styles.headline)}>
              {headline}
            </h2>
          )}
          <div className="grid md:grid-cols-2 gap-12">
            <div className={cn("max-w-none", styles.prose)}>
              {leftColumn && <TinaMarkdown content={leftColumn} />}
            </div>
            <div className={cn("max-w-none", styles.prose)}>
              {rightColumn && <TinaMarkdown content={rightColumn} />}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "withSidebar") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {headline && (
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-12", styles.headline)}>
              {headline}
            </h2>
          )}
          <div className="grid md:grid-cols-3 gap-12">
            <div className={cn("md:col-span-2 max-w-none", styles.prose)}>
              {body && <TinaMarkdown content={body} />}
            </div>
            <aside className={cn("max-w-none", styles.prose)}>
              {sidebarContent && <TinaMarkdown content={sidebarContent} />}
            </aside>
          </div>
        </Container>
      </section>
    );
  }

  return null;
}

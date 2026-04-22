"use client";

import { Fragment } from "react";
import { tinaField } from "tinacms/dist/react";
import { Heading } from "@/components/shared/Heading";
import { Section } from "@/components/shared/Section";

interface FeatureItem {
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

interface TinaFieldsMap {
  headline?: string;
  subheadline?: string;
}

export interface FeaturesProps {
  variant?: "grid" | "alternating" | "iconCards" | "comparison";
  theme?: "light" | "dark" | "primary";
  headline?: string;
  subheadline?: string;
  columns?: "2" | "3" | "4";
  items?: FeatureItem[];
  tinaFields?: TinaFieldsMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}

// Map CMS icon names to Material-style SVG icons
function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    zap: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    clipboard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    file: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    rocket: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    lock: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  };

  return <>{icons[name] || icons["star"]}</>;
}

export function Features({
  variant = "grid",
  headline,
  subheadline,
  columns = "3",
  items = [],
  tinaFields,
  blockData,
}: FeaturesProps) {
  const getItemField = (index: number, field: string) => {
    return blockData?.items?.[index]
      ? tinaField(blockData.items[index], field)
      : undefined;
  };

  // "How It Works" - 4-column timeline layout
  if (columns === "4" && variant === "grid") {
    return (
      <Section className="bg-white py-24 md:py-32 px-8 md:px-16" stagger={110}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              {headline && (
                <Heading
                  size="lg"
                  data-scroll-item
                  className="mb-6 text-balance"
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p
                  data-scroll-item
                  className="text-on-surface-variant text-lg text-pretty"
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-10 left-0 w-full h-px bg-outline-variant/30 z-0" />
            {items.map((item, index) => (
              <div key={index} data-scroll-item className="relative z-10">
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mb-8 border-4 border-surface-container-low shadow-sm">
                  {item.icon && (
                    <FeatureIcon
                      name={item.icon}
                      className="w-8 h-8 text-secondary"
                    />
                  )}
                </div>
                <div className="text-secondary font-semibold font-body text-sm uppercase tracking-[0.14em] mb-3">
                  Step {index + 1}
                </div>
                <h4
                  className="text-xl md:text-2xl font-normal font-headline text-on-surface mb-3 text-balance leading-[1.2]"
                  data-tina-field={getItemField(index, "title")}
                >
                  {item.title}
                </h4>
                {item.description && (
                  <p
                    className="text-on-surface-variant text-pretty"
                    data-tina-field={getItemField(index, "description")}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  // "Credibility & Trust" - inline badge row
  if (
    headline?.toLowerCase().includes("credibility") ||
    headline?.toLowerCase().includes("trust") ||
    headline?.toLowerCase().includes("why us")
  ) {
    return (
      <Section className="py-14 md:py-20 px-8 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="hidden md:block h-4 w-px bg-outline-variant/60 mx-8 lg:mx-10"
                />
              )}
              <div data-scroll-item className="flex items-center gap-2.5">
                {item.icon && (
                  <FeatureIcon
                    name={item.icon}
                    className="w-[18px] h-[18px] text-on-surface-variant shrink-0"
                  />
                )}
                <span
                  className="text-on-surface-variant font-body text-sm md:text-[0.9375rem] tracking-tight"
                  data-tina-field={getItemField(index, "title")}
                >
                  {item.title}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </Section>
    );
  }

  // "Who It's For" - card grid (default grid variant)
  if (variant === "grid") {
    return (
      <Section className="py-24 md:py-32 px-8 md:px-16 neural-texture">
        <div className="max-w-7xl mx-auto">
          {(headline || subheadline) && (
            <div className="text-center mb-16">
              {headline && (
                <Heading
                  size="lg"
                  data-scroll-item
                  className="mb-6 text-balance"
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p
                  data-scroll-item
                  className="text-on-surface-variant text-lg max-w-2xl mx-auto text-pretty"
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}
          <div className={`grid gap-8 ${columns === "2" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {items.map((item, index) => (
              <div
                key={index}
                data-scroll-item
                className="bg-surface-container-low p-10 rounded-[1.25rem]"
              >
                {item.icon && (
                  <div className="w-14 h-14 bg-secondary-container flex items-center justify-center rounded-lg mb-8">
                    <FeatureIcon
                      name={item.icon}
                      className="w-6 h-6 text-on-secondary-container"
                    />
                  </div>
                )}
                <Heading
                  as="h3"
                  size="sm"
                  className="mb-4 text-balance"
                  data-tina-field={getItemField(index, "title")}
                >
                  {item.title}
                </Heading>
                {item.description && (
                  <p
                    className="text-on-surface-variant leading-relaxed text-pretty"
                    data-tina-field={getItemField(index, "description")}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return null;
}

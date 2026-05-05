"use client";

import { tinaField } from "tinacms/dist/react";
import { PhosphorIcon } from "@/components/shared/PhosphorIcon";

interface BenefitItem {
  title?: string;
  body?: string;
  icon?: string;
}

interface BenefitsListProps {
  headline?: string;
  subheadline?: string;
  items?: BenefitItem[];
  tinaFields?: {
    headline?: string;
    subheadline?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}

export function BenefitsList({
  headline,
  subheadline,
  items = [],
  tinaFields,
  blockData,
}: BenefitsListProps) {
  const getItemField = (index: number, field: string) =>
    blockData?.items?.[index]
      ? tinaField(blockData.items[index], field)
      : undefined;
  return (
    <section className="px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-16">
        {(headline || subheadline) && (
          <div
            data-scroll-reveal
            data-scroll-stagger="90"
            className="max-w-4xl mx-auto text-center"
          >
            {headline && (
              <h2
                data-scroll-item
                data-tina-field={tinaFields?.headline}
                className="font-headline font-normal text-on-surface text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-balance"
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p
                data-scroll-item
                data-tina-field={tinaFields?.subheadline}
                className="mt-5 text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto text-pretty"
              >
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
          {items.map((item, i) => (
            <div
              key={i}
              data-scroll-reveal-self
              className="flex flex-col items-center text-center gap-4 bg-[#EFF6F9] rounded-[1.25rem] p-8 md:p-10 shadow-[0_10px_20px_-16px_rgba(4,22,50,0.25)]"
            >
              {item.icon && (
                <PhosphorIcon
                  name={item.icon}
                  aria-hidden="true"
                  weight="regular"
                  className="shrink-0 w-9 h-9 md:w-10 md:h-10 text-on-surface"
                />
              )}
              <div className="flex flex-col items-center">
                {item.title && (
                  <h3
                    data-tina-field={getItemField(i, "title")}
                    className="font-headline font-normal text-on-surface text-2xl md:text-3xl leading-[1.2] text-balance"
                  >
                    {item.title}
                  </h3>
                )}
                {item.body && (
                  <p
                    data-tina-field={getItemField(i, "body")}
                    className="mt-2 text-on-surface-variant text-base md:text-lg leading-relaxed text-pretty"
                  >
                    {item.body}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

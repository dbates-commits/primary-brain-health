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
    <section className="bg-[#E2EFEF] px-6 md:px-10 pt-20 md:pt-28 pb-20 md:pb-28">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 md:gap-14">
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

        <div
          data-scroll-reveal
          data-scroll-stagger="120"
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8"
        >
          {items.map((item, i) => (
            <div
              key={i}
              data-scroll-item
              className="flex flex-col items-center text-center gap-5 md:gap-6"
            >
              {item.icon && (
                <div className="flex items-center justify-center shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-[0_8px_18px_-12px_rgba(4,22,50,0.18)]">
                  <PhosphorIcon
                    name={item.icon}
                    aria-hidden="true"
                    weight="regular"
                    className="w-8 h-8 md:w-10 md:h-10 text-secondary"
                  />
                </div>
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

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
  image?: string;
  video?: string;
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
  image,
  video,
  items = [],
  tinaFields,
  blockData,
}: BenefitsListProps) {
  const getItemField = (index: number, field: string) =>
    blockData?.items?.[index]
      ? tinaField(blockData.items[index], field)
      : undefined;
  return (
    <section
      data-scroll-reveal
      data-scroll-stagger="110"
      className="px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-16">
        {/* Top: full-width hero card with video/image and overlaid copy */}
        <div
          data-scroll-item
          className="relative overflow-hidden rounded-[1.25rem] bg-on-surface min-h-[420px] md:min-h-[480px] lg:min-h-[560px] flex flex-col justify-end p-8 md:p-10 lg:p-14"
        >
          {video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={image || undefined}
              className="absolute inset-0 w-full h-full object-cover object-top"
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          )}
          {/* Subtle bottom-up gradient so text stays readable on busy images */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            {headline && (
              <h2
                data-tina-field={tinaFields?.headline}
                className="font-headline font-normal text-white text-3xl md:text-4xl lg:text-5xl leading-[1.05] text-balance"
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p
                data-tina-field={tinaFields?.subheadline}
                className="mt-4 text-base md:text-lg text-white/85 text-pretty"
              >
                {subheadline}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: benefit items in three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
          {items.map((item, i) => (
            <div key={i} data-scroll-item className="flex flex-col gap-4">
              {item.icon && (
                <PhosphorIcon
                  name={item.icon}
                  aria-hidden="true"
                  weight="regular"
                  className="shrink-0 w-9 h-9 md:w-10 md:h-10 text-on-surface"
                />
              )}
              <div className="flex flex-col">
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

"use client";

import React from "react";
import { tinaField } from "tinacms/dist/react";
import { Hero } from "@/components/blocks/Hero";
import { Stats } from "@/components/blocks/Stats";
import { FAQ } from "@/components/blocks/FAQ";
import { Gallery } from "@/components/blocks/Gallery";
import { Testimonials } from "@/components/blocks/Testimonials";
import { IntakeForm } from "@/components/blocks/IntakeForm";
import { ScrollFillLogo } from "@/components/blocks/ScrollFillLogo";
import { StackSections } from "@/components/blocks/StackSections";
import { BenefitsList } from "@/components/blocks/BenefitsList";
import { ContactForm } from "@/components/blocks/ContactForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageData = any;

function slugify(text?: string): string | undefined {
  if (!text) return undefined;
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlockRenderer({
  blocks,
  data,
}: {
  blocks: Block[] | null | undefined;
  data?: PageData;
}) {
  if (!blocks) return null;

  const getFieldPath = (index: number, field: string) => {
    return data?.blocks?.[index]
      ? tinaField(data.blocks[index], field)
      : undefined;
  };

  return (
    <>
      {blocks.map((block: Block, index: number) => {
        const sectionId = slugify(block.headline);

        let content: React.ReactNode = null;

        switch (block.__typename) {
          case "PageBlocksHero":
            content = (
              <Hero
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                subheadlineRich={block.subheadlineRich}
                trustText={block.trustText}
                image={block.image}
                primaryButtonText={block.primaryButtonText}
                primaryButtonTextMobile={block.primaryButtonTextMobile}
                primaryButtonLink={block.primaryButtonLink}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadlineRich"),
                  trustText: getFieldPath(index, "trustText"),
                  primaryButtonText: getFieldPath(index, "primaryButtonText"),
                }}
              />
            );
            break;

          case "PageBlocksStats":
            content = (
              <Stats
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.stats || []}
              />
            );
            break;

          case "PageBlocksFaq": {
            // Resolve referenced FAQ documents → { question, answer, category }.
            // Order by each FAQ's sortOrder when set, otherwise preserve the
            // editor's ordering on the block. Apply `limit` after sorting so
            // the homepage block can show e.g. the first 4.
            type FaqDoc = {
              question?: string | null;
              answer?: string | null;
              category?: string | null;
              sortOrder?: number | null;
            };
            type FaqRefItem = { faq?: FaqDoc | null };
            const rawRefs = (block.items ?? []) as FaqRefItem[];
            const resolved = rawRefs
              .map((r) => r.faq)
              .filter(
                (f): f is FaqDoc =>
                  Boolean(f && typeof f.question === "string" && f.question)
              );
            const sorted = resolved.slice().sort((a, b) => {
              const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
              const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
              return ao - bo;
            });
            const limit =
              typeof block.limit === "number" && block.limit > 0
                ? block.limit
                : undefined;
            const faqItems = (limit ? sorted.slice(0, limit) : sorted).map(
              (f) => ({
                question: f.question ?? "",
                answer: f.answer ?? undefined,
                category: f.category ?? undefined,
              })
            );

            content = (
              <FAQ
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={faqItems}
                ctaText={block.ctaText}
                ctaButtonText={block.ctaButtonText}
                ctaLink={block.ctaLink}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                  ctaText: getFieldPath(index, "ctaText"),
                  ctaButtonText: getFieldPath(index, "ctaButtonText"),
                }}
              />
            );
            break;
          }

          case "PageBlocksGallery":
            content = (
              <Gallery
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                columns={block.columns}
                gap={block.gap}
                items={block.items || []}
              />
            );
            break;

          case "PageBlocksTestimonials":
            content = (
              <Testimonials
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.testimonials || []}
              />
            );
            break;

          case "PageBlocksStackSections":
            content = (
              <StackSections
                label={block.label}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.items || []}
                tinaFields={{
                  label: getFieldPath(index, "label"),
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                }}
                blockData={data?.blocks?.[index]}
              />
            );
            break;

          case "PageBlocksBenefitsList":
            content = (
              <BenefitsList
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.items || []}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                }}
                blockData={data?.blocks?.[index]}
              />
            );
            break;

          case "PageBlocksScrollFillLogo":
            content = (
              <ScrollFillLogo
                slides={block.slides || []}
                blockData={data?.blocks?.[index]}
              />
            );
            break;

          case "PageBlocksIntakeForm":
            content = (
              <IntakeForm
                headline={block.headline}
                subheadline={block.subheadline}
                buttonText={block.buttonText}
                buttonTextMobile={block.buttonTextMobile}
                showIncludes={block.showIncludes ?? true}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                }}
              />
            );
            break;

          case "PageBlocksContactForm":
            content = (
              <ContactForm
                headline={block.headline}
                subheadline={block.subheadline}
                buttonText={block.buttonText}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                }}
              />
            );
            break;

          default:
            return null;
        }

        if (sectionId) {
          return (
            <div key={index} id={sectionId} className="scroll-mt-20">
              {content}
            </div>
          );
        }
        return <div key={index}>{content}</div>;
      })}
    </>
  );
}

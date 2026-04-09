"use client";

import React from "react";
import { tinaField } from "tinacms/dist/react";
import { Hero } from "@/components/blocks/Hero";
import { Features } from "@/components/blocks/Features";
import { Team } from "@/components/blocks/Team";
import { Stats } from "@/components/blocks/Stats";
import { FAQ } from "@/components/blocks/FAQ";
import { CallToAction } from "@/components/blocks/CallToAction";
import { PricingTable } from "@/components/blocks/PricingTable";
import { Gallery } from "@/components/blocks/Gallery";
import { ContentSection } from "@/components/blocks/ContentSection";
import { Testimonials } from "@/components/blocks/Testimonials";
import { LogoCloud } from "@/components/blocks/LogoCloud";
import { IntakeForm } from "@/components/blocks/IntakeForm";

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
                image={block.image}
                primaryButtonText={block.primaryButtonText}
                primaryButtonLink={block.primaryButtonLink}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                  primaryButtonText: getFieldPath(index, "primaryButtonText"),
                }}
              />
            );
            break;

          case "PageBlocksFeatures":
            content = (
              <Features
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                columns={block.columns}
                items={block.items || []}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                }}
                blockData={data?.blocks?.[index]}
              />
            );
            break;

          case "PageBlocksTeam":
            content = (
              <Team
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                columns={block.columns}
                members={block.members || []}
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

          case "PageBlocksFaq":
            content = (
              <FAQ
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.items || []}
              />
            );
            break;

          case "PageBlocksCta":
            content = (
              <CallToAction
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                description={block.subheadline}
                primaryButtonText={block.primaryButtonText}
                primaryButtonLink={block.primaryButtonLink}
                secondaryButtonText={block.secondaryButtonText}
                secondaryButtonLink={block.secondaryButtonLink}
                image={block.image}
              />
            );
            break;

          case "PageBlocksPricingTable":
            content = (
              <PricingTable
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                tiers={block.tiers || []}
              />
            );
            break;

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

          case "PageBlocksContent":
            content = (
              <ContentSection
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                bodyText={block.bodyText}
                sidebarContent={block.sidebarContent}
                leftColumn={block.leftColumn}
                rightColumn={block.rightColumn}
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

          case "PageBlocksLogoCloud":
            content = (
              <LogoCloud
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                grayscale={block.grayscale}
                logos={block.logos || []}
              />
            );
            break;

          case "PageBlocksIntakeForm":
            content = (
              <IntakeForm
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

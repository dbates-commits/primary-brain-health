"use client";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageData = any;

export function BlockRenderer({ blocks, data }: { blocks: Block[] | null | undefined; data?: PageData }) {
  if (!blocks) return null;

  const getFieldPath = (index: number, field: string) => {
    return data?.blocks?.[index] ? tinaField(data.blocks[index], field) : undefined;
  };

  return (
    <>
      {blocks.map((block: Block, index: number) => {
        switch (block.__typename) {
          case "PageBlocksHero":
            return (
              <Hero
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                image={block.image}
                videoUrl={block.videoUrl}
                backgroundImage={block.backgroundImage}
                primaryButtonText={block.primaryButtonText}
                primaryButtonLink={block.primaryButtonLink}
                secondaryButtonText={block.secondaryButtonText}
                secondaryButtonLink={block.secondaryButtonLink}
                badge={block.badge}
                gradientFrom={block.gradientFrom}
                gradientTo={block.gradientTo}
                tinaFields={{
                  headline: getFieldPath(index, "headline"),
                  subheadline: getFieldPath(index, "subheadline"),
                  badge: getFieldPath(index, "badge"),
                  primaryButtonText: getFieldPath(index, "primaryButtonText"),
                  secondaryButtonText: getFieldPath(index, "secondaryButtonText"),
                }}
              />
            );

          case "PageBlocksFeatures":
            return (
              <Features
                key={index}
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

          case "PageBlocksTeam":
            return (
              <Team
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                columns={block.columns}
                members={block.members || []}
              />
            );

          case "PageBlocksStats":
            return (
              <Stats
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.stats || []}
              />
            );

          case "PageBlocksFaq":
            return (
              <FAQ
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.items || []}
              />
            );

          case "PageBlocksCta":
            return (
              <CallToAction
                key={index}
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

          case "PageBlocksPricingTable":
            return (
              <PricingTable
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                tiers={block.tiers || []}
              />
            );

          case "PageBlocksGallery":
            return (
              <Gallery
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                columns={block.columns}
                gap={block.gap}
                items={block.items || []}
              />
            );

          case "PageBlocksContent":
            return (
              <ContentSection
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                body={block.body}
                sidebarContent={block.sidebarContent}
                leftColumn={block.leftColumn}
                rightColumn={block.rightColumn}
              />
            );

          case "PageBlocksTestimonials":
            return (
              <Testimonials
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                subheadline={block.subheadline}
                items={block.testimonials || []}
              />
            );

          case "PageBlocksLogoCloud":
            return (
              <LogoCloud
                key={index}
                variant={block.variant}
                theme={block.theme}
                headline={block.headline}
                grayscale={block.grayscale}
                logos={block.logos || []}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

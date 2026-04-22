import type { Collection } from "tinacms";
import { heroBlock } from "../blocks/hero";
import { featuresBlock } from "../blocks/features";
import { testimonialsBlock } from "../blocks/testimonials";
import { ctaBlock } from "../blocks/cta";
import { contentBlock } from "../blocks/content";
import { galleryBlock } from "../blocks/gallery";
import { pricingBlock } from "../blocks/pricing";
import { faqBlock } from "../blocks/faq";
import { teamBlock } from "../blocks/team";
import { statsBlock } from "../blocks/stats";
import { logoCloudBlock } from "../blocks/logoCloud";
import { intakeFormBlock } from "../blocks/intakeForm";
import { scrollRevealBlock } from "../blocks/scrollReveal";
import { scrollFillLogoBlock } from "../blocks/scrollFillLogo";
import { stackSectionsBlock } from "../blocks/stackSections";
import { benefitsListBlock } from "../blocks/benefitsList";

export const pageCollection: Collection = {
  name: "page",
  label: "Pages",
  path: "content/pages",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      if (document._sys.filename === "home") {
        return "/";
      }
      return `/${document._sys.filename}`;
    },
  },
  fields: [
    {
      name: "title",
      label: "Page Title",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "description",
      label: "Meta Description",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "socialImage",
      label: "Social Image",
      type: "image",
      description: "Override default social image for this page",
    },
    {
      name: "blocks",
      label: "Page Blocks",
      type: "object",
      list: true,
      ui: {
        visualSelector: true,
      },
      templates: [
        heroBlock,
        featuresBlock,
        testimonialsBlock,
        ctaBlock,
        contentBlock,
        galleryBlock,
        pricingBlock,
        faqBlock,
        teamBlock,
        statsBlock,
        logoCloudBlock,
        intakeFormBlock,
        scrollRevealBlock,
        scrollFillLogoBlock,
        stackSectionsBlock,
        benefitsListBlock,
      ],
    },
  ],
};

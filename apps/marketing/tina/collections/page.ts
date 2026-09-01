import type { Collection } from "tinacms";
import { heroBlock } from "../blocks/hero";
import { faqBlock } from "../blocks/faq";
import { intakeFormBlock } from "../blocks/intakeForm";
import { scrollFillLogoBlock } from "../blocks/scrollFillLogo";
import { stackSectionsBlock } from "../blocks/stackSections";
import { benefitsListBlock } from "../blocks/benefitsList";
import { contactFormBlock } from "../blocks/contactForm";

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
        faqBlock,
        intakeFormBlock,
        scrollFillLogoBlock,
        stackSectionsBlock,
        benefitsListBlock,
        contactFormBlock,
      ],
    },
  ],
};

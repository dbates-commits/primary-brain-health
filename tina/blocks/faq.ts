import type { Template } from "tinacms";

export const faqBlock: Template = {
  name: "faq",
  label: "FAQ Section",
  ui: {
    defaultItem: {
      variant: "accordion",
      theme: "light",
      headline: "Frequently Asked Questions",
      items: [
        {
          question: "What is your refund policy?",
          answer: "We offer a 30-day money-back guarantee on all plans.",
        },
        {
          question: "Can I upgrade my plan later?",
          answer: "Yes, you can upgrade or downgrade your plan at any time.",
        },
        {
          question: "Do you offer customer support?",
          answer: "Yes, we offer 24/7 customer support via email and chat.",
        },
      ],
    },
    itemProps: (item) => ({
      label: `FAQ - ${item?.variant || "accordion"} (${item?.items?.length || 0} items)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "accordion", label: "Accordion" },
        { value: "twoColumn", label: "Two Column" },
        { value: "cards", label: "Cards" },
      ],
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
    },
    {
      name: "headline",
      label: "Headline",
      type: "string",
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string",
    },
    {
      name: "items",
      label: "FAQ Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.question || "FAQ Item",
        }),
      },
      fields: [
        {
          name: "question",
          label: "Question",
          type: "string",
          required: true,
        },
        {
          name: "answer",
          label: "Answer",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "category",
          label: "Category",
          type: "string",
          description: "Optional category for grouping",
        },
      ],
    },
    {
      name: "showCategories",
      label: "Show Category Filters",
      type: "boolean",
    },
    {
      name: "ctaText",
      label: "CTA Description",
      type: "string",
      description: "Optional text above the CTA button, e.g. 'Still have questions?'",
    },
    {
      name: "ctaButtonText",
      label: "CTA Button Text",
      type: "string",
      description: "e.g. 'View All FAQs' or 'Contact Us'",
    },
    {
      name: "ctaLink",
      label: "CTA Link",
      type: "string",
    },
  ],
};

import type { Template } from "tinacms";

export const faqBlock: Template = {
  name: "faq",
  label: "FAQ Section",
  ui: {
    defaultItem: {
      variant: "accordion",
      theme: "light",
      headline: "Frequently Asked Questions",
      items: [],
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
      description:
        "Pick FAQs from the FAQ collection. Order here is overridden by each FAQ's Sort Order if set.",
      fields: [
        {
          name: "faq",
          label: "FAQ",
          type: "reference",
          collections: ["faq"],
        },
      ],
    },
    {
      name: "limit",
      label: "Limit",
      type: "number",
      description:
        "Show only the first N FAQs (after sorting). Leave empty to show all.",
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

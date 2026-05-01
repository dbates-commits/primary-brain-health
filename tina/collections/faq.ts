import type { Collection } from "tinacms";

export const faqCollection: Collection = {
  name: "faq",
  label: "FAQs",
  path: "content/faqs",
  format: "json",
  fields: [
    {
      name: "question",
      label: "Question",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "answer",
      label: "Answer",
      type: "string",
      required: true,
      ui: {
        component: "textarea",
      },
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      description: "Optional category for grouping/filters",
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
      description:
        "Lower numbers appear first. FAQs without a sort order fall back to alphabetical by filename.",
    },
  ],
};

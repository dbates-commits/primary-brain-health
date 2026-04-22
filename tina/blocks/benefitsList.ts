import type { Template } from "tinacms";

export const benefitsListBlock: Template = {
  name: "benefitsList",
  label: "Benefits List (split layout)",
  ui: {
    defaultItem: {
      headline: "What You Gain",
      subheadline: "Clarity. Control. Confidence. Now and over time.",
      items: [],
    },
    itemProps: (item) => ({
      label: `Benefits - ${item?.headline || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "headline",
      label: "Headline",
      type: "string",
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "items",
      label: "Benefits",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Benefit",
        }),
      },
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true,
        },
        {
          name: "body",
          label: "Body",
          type: "string",
          ui: { component: "textarea" },
        },
        {
          name: "icon",
          label: "Icon (SVG path)",
          type: "string",
          description:
            "Path to an SVG icon in /public (e.g. /images/Brain.svg). Uses CSS mask, so must be served same-origin.",
        },
      ],
    },
  ],
};

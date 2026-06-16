import type { Template } from "tinacms";
import { IconPicker } from "../fields/IconPicker";

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
          label: "Icon",
          type: "string",
          description: "Pick a Phosphor icon.",
          ui: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: IconPicker as any,
          },
        },
      ],
    },
  ],
};

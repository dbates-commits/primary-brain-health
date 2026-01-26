import type { Template } from "tinacms";

export const statsBlock: Template = {
  name: "stats",
  label: "Stats Section",
  ui: {
    defaultItem: {
      variant: "counters",
      theme: "light",
      items: [
        { value: "10K+", label: "Active Users" },
        { value: "99.9%", label: "Uptime" },
        { value: "50+", label: "Countries" },
        { value: "24/7", label: "Support" },
      ],
    },
    itemProps: (item) => ({
      label: `Stats - ${item?.variant || "counters"} (${item?.items?.length || 0} items)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "counters", label: "Counters" },
        { value: "progress", label: "Progress Bars" },
        { value: "icons", label: "With Icons" },
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
        { value: "primary", label: "Primary" },
        { value: "gradient", label: "Gradient" },
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
      name: "animate",
      label: "Animate Numbers",
      type: "boolean",
      description: "Count up animation on scroll",
    },
    {
      name: "items",
      label: "Stat Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item?.value || ""} - ${item?.label || "Stat"}`,
        }),
      },
      fields: [
        {
          name: "value",
          label: "Value",
          type: "string",
          required: true,
          description: "e.g., '10K+', '99.9%', '24/7'",
        },
        {
          name: "label",
          label: "Label",
          type: "string",
          required: true,
        },
        {
          name: "icon",
          label: "Icon",
          type: "string",
          options: [
            { value: "users", label: "Users" },
            { value: "globe", label: "Globe" },
            { value: "chart", label: "Chart" },
            { value: "clock", label: "Clock" },
            { value: "heart", label: "Heart" },
            { value: "star", label: "Star" },
            { value: "zap", label: "Zap" },
            { value: "shield", label: "Shield" },
          ],
        },
        {
          name: "description",
          label: "Description",
          type: "string",
        },
        {
          name: "progress",
          label: "Progress Value (0-100)",
          type: "number",
          description: "For progress bar variant",
        },
      ],
    },
  ],
};

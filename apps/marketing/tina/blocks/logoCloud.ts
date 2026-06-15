import type { Template } from "tinacms";

export const logoCloudBlock: Template = {
  name: "logoCloud",
  label: "Logo Cloud Section",
  ui: {
    defaultItem: {
      variant: "simple",
      theme: "light",
      headline: "Trusted by Industry Leaders",
      grayscale: true,
    },
    itemProps: (item) => ({
      label: `Logo Cloud - ${item?.variant || "simple"} (${item?.logos?.length || 0} logos)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "simple", label: "Simple Row" },
        { value: "marquee", label: "Marquee (Scrolling)" },
        { value: "grid", label: "Grid" },
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
      name: "grayscale",
      label: "Grayscale Logos",
      type: "boolean",
      description: "Display logos in grayscale (color on hover)",
    },
    {
      name: "size",
      label: "Logo Size",
      type: "string",
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    {
      name: "logos",
      label: "Logos",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Logo",
        }),
      },
      fields: [
        {
          name: "image",
          label: "Logo Image",
          type: "image",
          required: true,
        },
        {
          name: "name",
          label: "Company Name",
          type: "string",
          required: true,
        },
        {
          name: "url",
          label: "Website URL",
          type: "string",
        },
      ],
    },
  ],
};

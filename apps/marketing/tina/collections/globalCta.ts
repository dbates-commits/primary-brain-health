import type { Collection } from "tinacms";

export const globalCtaCollection: Collection = {
  name: "globalCta",
  label: "Global CTAs",
  path: "content/global/ctas",
  format: "json",
  fields: [
    {
      name: "name",
      label: "Internal Name",
      type: "string",
      required: true,
      isTitle: true,
      description: "For identification in the admin",
    },
    {
      name: "headline",
      label: "Headline",
      type: "string",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "primaryButton",
      label: "Primary Button",
      type: "object",
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string",
        },
        {
          name: "link",
          label: "Link",
          type: "string",
        },
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
          ],
        },
      ],
    },
    {
      name: "secondaryButton",
      label: "Secondary Button",
      type: "object",
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string",
        },
        {
          name: "link",
          label: "Link",
          type: "string",
        },
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
          ],
        },
      ],
    },
    {
      name: "theme",
      label: "Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "gradient", label: "Gradient" },
      ],
    },
  ],
};

import type { Template } from "tinacms";

export const heroBlock: Template = {
  name: "hero",
  label: "Hero Section",
  ui: {
    defaultItem: {
      theme: "light",
      headline: "Build Something Amazing",
      subheadline: "A powerful platform to bring your ideas to life",
      primaryButtonText: "Get Started",
      primaryButtonLink: "#",
    },
    itemProps: (item) => ({
      label: `Hero - ${item?.headline || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
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
      ui: {
        component: "textarea",
      },
    },
    {
      name: "image",
      label: "Image",
      type: "image",
      description: "Poster/fallback image for the hero video",
    },
    {
      name: "primaryButtonText",
      label: "Primary Button Text",
      type: "string",
    },
    {
      name: "primaryButtonLink",
      label: "Primary Button Link",
      type: "string",
    },
  ],
};

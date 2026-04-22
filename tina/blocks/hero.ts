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
      name: "subheadlineRich",
      label: "Subheadline",
      type: "rich-text",
    },
    {
      name: "image",
      label: "Image path",
      type: "string",
      description:
        "Path to the hero poster/fallback image in /public (e.g. /images/hero-brain-consultation.png).",
    },
    {
      name: "trustText",
      label: "Trust Badge Text",
      type: "string",
      description: "Text shown next to the trust avatars (e.g. 'Trusted by 3,200+ patients and families')",
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

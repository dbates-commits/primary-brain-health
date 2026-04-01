import type { Template } from "tinacms";

export const heroBlock: Template = {
  name: "hero",
  label: "Hero Section",
  ui: {
    defaultItem: {
      variant: "centered",
      theme: "light",
      headline: "Build Something Amazing",
      subheadline: "A powerful platform to bring your ideas to life",
      primaryButtonText: "Get Started",
      primaryButtonLink: "#",
    },
    itemProps: (item) => ({
      label: `Hero - ${item?.variant || "centered"}`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "centered", label: "Centered" },
        { value: "split", label: "Split (Image Right)" },
        { value: "splitReverse", label: "Split (Image Left)" },
        { value: "fullImage", label: "Full Image Overlay" },
        { value: "brainMask", label: "Brain Shape Mask" },
        { value: "video", label: "Video Background" },
        { value: "gradient", label: "Gradient Background" },
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
      description: "Used for split layouts",
    },
    {
      name: "videoUrl",
      label: "Video URL",
      type: "string",
      description: "YouTube or Vimeo URL for video background",
    },
    {
      name: "backgroundImage",
      label: "Background Image",
      type: "image",
      description: "Optional background image",
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
    {
      name: "secondaryButtonText",
      label: "Secondary Button Text",
      type: "string",
    },
    {
      name: "secondaryButtonLink",
      label: "Secondary Button Link",
      type: "string",
    },
    {
      name: "badge",
      label: "Badge Text",
      type: "string",
      description: "Optional badge above headline",
    },
    {
      name: "gradientFrom",
      label: "Gradient From Color",
      type: "string",
      description: "CSS color for gradient start (e.g., #6366f1)",
    },
    {
      name: "gradientTo",
      label: "Gradient To Color",
      type: "string",
      description: "CSS color for gradient end (e.g., #8b5cf6)",
    },
  ],
};

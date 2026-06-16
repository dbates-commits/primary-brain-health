import type { Template } from "tinacms";

export const ctaBlock: Template = {
  name: "cta",
  label: "Call to Action",
  ui: {
    defaultItem: {
      variant: "simple",
      theme: "primary",
      headline: "Ready to Get Started?",
      description: "Join thousands of satisfied customers today.",
      primaryButtonText: "Start Free Trial",
      primaryButtonLink: "#",
    },
    itemProps: (item) => ({
      label: `CTA - ${item?.variant || "simple"}`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "simple", label: "Simple" },
        { value: "withImage", label: "With Image" },
        { value: "newsletter", label: "Newsletter" },
        { value: "reference", label: "Global CTA Reference" },
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
      name: "globalCtaRef",
      label: "Global CTA Reference",
      type: "reference",
      collections: ["globalCta"],
      description: "Use a shared CTA (only for reference variant)",
    },
    {
      name: "headline",
      label: "Headline",
      type: "string",
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
      name: "image",
      label: "Image",
      type: "image",
      description: "For withImage variant",
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
      name: "emailPlaceholder",
      label: "Email Placeholder",
      type: "string",
      description: "For newsletter variant",
    },
    {
      name: "submitButtonText",
      label: "Submit Button Text",
      type: "string",
      description: "For newsletter variant",
    },
  ],
};

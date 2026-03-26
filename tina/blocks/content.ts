import type { Template } from "tinacms";

export const contentBlock: Template = {
  name: "content",
  label: "Content Section",
  ui: {
    defaultItem: {
      variant: "default",
      theme: "light",
    },
    itemProps: (item) => ({
      label: `Content - ${item?.variant || "default"}`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "default", label: "Default (Full Width)" },
        { value: "twoColumn", label: "Two Column" },
        { value: "withSidebar", label: "With Sidebar" },
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
      name: "bodyText",
      label: "Body Content",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "sidebarContent",
      label: "Sidebar Content",
      type: "rich-text",
      description: "For withSidebar variant",
    },
    {
      name: "leftColumn",
      label: "Left Column",
      type: "rich-text",
      description: "For twoColumn variant",
    },
    {
      name: "rightColumn",
      label: "Right Column",
      type: "rich-text",
      description: "For twoColumn variant",
    },
  ],
};

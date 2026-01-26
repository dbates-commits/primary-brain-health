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
      name: "body",
      label: "Body Content",
      type: "rich-text",
      isBody: true,
      templates: [
        {
          name: "callout",
          label: "Callout Box",
          fields: [
            {
              name: "type",
              label: "Type",
              type: "string",
              options: [
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "success", label: "Success" },
                { value: "error", label: "Error" },
              ],
            },
            {
              name: "title",
              label: "Title",
              type: "string",
            },
            {
              name: "text",
              label: "Text",
              type: "string",
              ui: {
                component: "textarea",
              },
            },
          ],
        },
        {
          name: "codeBlock",
          label: "Code Block",
          fields: [
            {
              name: "language",
              label: "Language",
              type: "string",
              options: ["javascript", "typescript", "python", "bash", "json", "html", "css"],
            },
            {
              name: "code",
              label: "Code",
              type: "string",
              ui: {
                component: "textarea",
              },
            },
          ],
        },
        {
          name: "videoEmbed",
          label: "Video Embed",
          fields: [
            {
              name: "url",
              label: "Video URL",
              type: "string",
              description: "YouTube or Vimeo URL",
            },
            {
              name: "caption",
              label: "Caption",
              type: "string",
            },
          ],
        },
      ],
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

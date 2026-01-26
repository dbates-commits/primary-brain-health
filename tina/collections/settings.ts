import type { Collection } from "tinacms";

export const settingsCollection: Collection = {
  name: "settings",
  label: "Site Settings",
  path: "content/global",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
    global: true,
  },
  fields: [
    {
      name: "siteName",
      label: "Site Name",
      type: "string",
      required: true,
    },
    {
      name: "siteDescription",
      label: "Site Description",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "logo",
      label: "Logo",
      type: "image",
    },
    {
      name: "logoDark",
      label: "Logo (Dark Mode)",
      type: "image",
    },
    {
      name: "favicon",
      label: "Favicon",
      type: "image",
    },
    {
      name: "socialImage",
      label: "Default Social Image",
      type: "image",
      description: "Used for Open Graph / Twitter cards",
    },
    {
      name: "header",
      label: "Header",
      type: "object",
      fields: [
        {
          name: "navigation",
          label: "Navigation Items",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.label || "Nav Item",
            }),
          },
          fields: [
            {
              name: "label",
              label: "Label",
              type: "string",
              required: true,
            },
            {
              name: "link",
              label: "Link",
              type: "string",
              required: true,
            },
            {
              name: "children",
              label: "Dropdown Items",
              type: "object",
              list: true,
              fields: [
                { name: "label", label: "Label", type: "string" },
                { name: "link", label: "Link", type: "string" },
                { name: "description", label: "Description", type: "string" },
              ],
            },
          ],
        },
        {
          name: "ctaButton",
          label: "CTA Button",
          type: "object",
          fields: [
            { name: "text", label: "Text", type: "string" },
            { name: "link", label: "Link", type: "string" },
          ],
        },
      ],
    },
    {
      name: "footer",
      label: "Footer",
      type: "object",
      fields: [
        {
          name: "copyright",
          label: "Copyright Text",
          type: "string",
        },
        {
          name: "columns",
          label: "Footer Columns",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.title || "Column",
            }),
          },
          fields: [
            {
              name: "title",
              label: "Column Title",
              type: "string",
            },
            {
              name: "links",
              label: "Links",
              type: "object",
              list: true,
              fields: [
                { name: "label", label: "Label", type: "string" },
                { name: "link", label: "Link", type: "string" },
              ],
            },
          ],
        },
        {
          name: "social",
          label: "Social Links",
          type: "object",
          fields: [
            { name: "twitter", label: "Twitter URL", type: "string" },
            { name: "facebook", label: "Facebook URL", type: "string" },
            { name: "instagram", label: "Instagram URL", type: "string" },
            { name: "linkedin", label: "LinkedIn URL", type: "string" },
            { name: "github", label: "GitHub URL", type: "string" },
            { name: "youtube", label: "YouTube URL", type: "string" },
          ],
        },
      ],
    },
  ],
};

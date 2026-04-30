import type { Template } from "tinacms";

export const stackSectionsBlock: Template = {
  name: "stackSections",
  label: "Stack Sections",
  ui: {
    defaultItem: {
      headline: "How It Works",
      subheadline: "Move at your own pace, with expert guidance when you want it.",
      items: [
        {
          title: "Brain Health Assessment",
          body: "Evaluate your cognitive function, risk factors, and overall brain health using advanced digital tools and clinical expertise.",
          icon: "clipboard",
          image: "/images/woman.png",
        },
      ],
    },
    itemProps: (item) => ({
      label: `Stack - ${item?.headline || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "label",
      label: "Eyebrow Label",
      type: "string",
      description: "Small uppercase label above the headline",
    },
    {
      name: "headline",
      label: "Section Headline",
      type: "string",
    },
    {
      name: "subheadline",
      label: "Section Subheadline",
      type: "string",
      ui: { component: "textarea" },
    },
    {
      name: "items",
      label: "Stack Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Stack Item",
        }),
      },
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true,
        },
        {
          name: "body",
          label: "Body",
          type: "string",
          ui: { component: "textarea" },
        },
        {
          name: "icon",
          label: "Phosphor icon name",
          type: "string",
          description:
            "Name of a Phosphor icon (e.g. Brain, ClipboardText, MapTrifold). See https://phosphoricons.com for the full set.",
        },
        {
          name: "image",
          label: "Image path",
          type: "string",
          description:
            "Path to an image in /public (e.g. /images/woman.png).",
        },
      ],
    },
  ],
};

import type { Template } from "tinacms";

export const stackSectionsBlock: Template = {
  name: "stackSections",
  label: "Stack Sections",
  ui: {
    defaultItem: {
      headline: "How It Works",
      subheadline:
        "Measure how your brain is working today and connect with a team that will offer personalized guidance.",
      items: [
        {
          eyebrow: "It's easy to start",
          title: "Book & Complete Your Assessments at Home",
          body: "Schedule online in under two minutes.",
          bullets: [{ text: "Cognitive function tests" }],
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
      label: "Steps",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Step",
        }),
      },
      fields: [
        {
          name: "eyebrow",
          label: "Eyebrow",
          type: "string",
          description:
            "Small uppercase label above the step title (e.g. 'It's easy to start').",
        },
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
          // An object list rather than a list of plain strings: `tinaField()`
          // needs a node to point at, so this is what keeps each bullet
          // individually click-to-edit in the visual editor.
          name: "bullets",
          label: "Bullets",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.text || "Bullet",
            }),
          },
          fields: [
            {
              name: "text",
              label: "Text",
              type: "string",
            },
          ],
        },
        {
          name: "image",
          label: "Image",
          type: "image",
        },
      ],
    },
  ],
};

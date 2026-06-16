import type { Template } from "tinacms";

export const teamBlock: Template = {
  name: "team",
  label: "Team Section",
  ui: {
    defaultItem: {
      variant: "grid",
      theme: "light",
      headline: "Meet Our Team",
      subheadline: "The people behind the magic",
      useReferences: false,
    },
    itemProps: (item) => ({
      label: `Team - ${item?.variant || "grid"}`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "grid", label: "Grid" },
        { value: "carousel", label: "Carousel" },
        { value: "list", label: "List" },
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
      name: "subheadline",
      label: "Subheadline",
      type: "string",
    },
    {
      name: "columns",
      label: "Columns",
      type: "string",
      options: ["2", "3", "4"],
    },
    {
      name: "useReferences",
      label: "Use Author References",
      type: "boolean",
      description: "Pull from the Authors collection",
    },
    {
      name: "authorRefs",
      label: "Referenced Authors",
      type: "object",
      list: true,
      fields: [
        {
          name: "author",
          label: "Author",
          type: "reference",
          collections: ["author"],
        },
      ],
    },
    {
      name: "members",
      label: "Team Members (Inline)",
      type: "object",
      list: true,
      description: "Add team members directly",
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Team Member",
        }),
      },
      fields: [
        {
          name: "name",
          label: "Name",
          type: "string",
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "string",
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "image",
        },
        {
          name: "bio",
          label: "Bio",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "social",
          label: "Social Links",
          type: "object",
          fields: [
            { name: "twitter", label: "Twitter URL", type: "string" },
            { name: "linkedin", label: "LinkedIn URL", type: "string" },
            { name: "github", label: "GitHub URL", type: "string" },
          ],
        },
      ],
    },
  ],
};

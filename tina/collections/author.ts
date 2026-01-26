import type { Collection } from "tinacms";

export const authorCollection: Collection = {
  name: "author",
  label: "Authors",
  path: "content/authors",
  format: "mdx",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "role",
      label: "Role / Title",
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
      type: "rich-text",
    },
    {
      name: "email",
      label: "Email",
      type: "string",
    },
    {
      name: "social",
      label: "Social Links",
      type: "object",
      fields: [
        {
          name: "twitter",
          label: "Twitter URL",
          type: "string",
        },
        {
          name: "linkedin",
          label: "LinkedIn URL",
          type: "string",
        },
        {
          name: "github",
          label: "GitHub URL",
          type: "string",
        },
        {
          name: "website",
          label: "Personal Website",
          type: "string",
        },
      ],
    },
  ],
};

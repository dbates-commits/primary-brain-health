import type { Collection } from "tinacms";

export const postCollection: Collection = {
  name: "post",
  label: "Blog Posts",
  path: "content/posts",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      return `/blog/${document._sys.filename}`;
    },
  },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "author",
      label: "Author",
      type: "reference",
      collections: ["author"],
    },
    {
      name: "date",
      label: "Publish Date",
      type: "datetime",
      required: true,
    },
    {
      name: "featuredImage",
      label: "Featured Image",
      type: "image",
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      options: [
        { value: "technology", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "business", label: "Business" },
        { value: "tutorial", label: "Tutorial" },
        { value: "news", label: "News" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "string",
      list: true,
    },
    {
      name: "featured",
      label: "Featured Post",
      type: "boolean",
      description: "Show on homepage or featured section",
    },
    {
      name: "body",
      label: "Body",
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
              options: [
                "javascript",
                "typescript",
                "python",
                "bash",
                "json",
                "html",
                "css",
                "jsx",
                "tsx",
              ],
            },
            {
              name: "code",
              label: "Code",
              type: "string",
              ui: {
                component: "textarea",
              },
            },
            {
              name: "filename",
              label: "Filename",
              type: "string",
            },
          ],
        },
        {
          name: "imageGallery",
          label: "Image Gallery",
          fields: [
            {
              name: "images",
              label: "Images",
              type: "object",
              list: true,
              fields: [
                { name: "src", label: "Image", type: "image" },
                { name: "alt", label: "Alt Text", type: "string" },
                { name: "caption", label: "Caption", type: "string" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "relatedPosts",
      label: "Related Posts",
      type: "object",
      list: true,
      fields: [
        {
          name: "post",
          label: "Post",
          type: "reference",
          collections: ["post"],
        },
      ],
    },
  ],
};

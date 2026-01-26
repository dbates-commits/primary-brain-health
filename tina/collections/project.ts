import type { Collection } from "tinacms";

export const projectCollection: Collection = {
  name: "project",
  label: "Projects",
  path: "content/projects",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      return `/projects/${document._sys.filename}`;
    },
  },
  fields: [
    {
      name: "title",
      label: "Project Title",
      type: "string",
      required: true,
      isTitle: true,
    },
    {
      name: "description",
      label: "Short Description",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "client",
      label: "Client Name",
      type: "string",
    },
    {
      name: "date",
      label: "Project Date",
      type: "datetime",
    },
    {
      name: "featuredImage",
      label: "Featured Image",
      type: "image",
    },
    {
      name: "gallery",
      label: "Project Gallery",
      type: "object",
      list: true,
      fields: [
        {
          name: "image",
          label: "Image",
          type: "image",
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string",
        },
        {
          name: "caption",
          label: "Caption",
          type: "string",
        },
      ],
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      options: [
        { value: "web", label: "Web Development" },
        { value: "mobile", label: "Mobile App" },
        { value: "branding", label: "Branding" },
        { value: "design", label: "UI/UX Design" },
        { value: "ecommerce", label: "E-commerce" },
      ],
    },
    {
      name: "techStack",
      label: "Tech Stack",
      type: "string",
      list: true,
      options: [
        { value: "react", label: "React" },
        { value: "nextjs", label: "Next.js" },
        { value: "typescript", label: "TypeScript" },
        { value: "tailwind", label: "Tailwind CSS" },
        { value: "node", label: "Node.js" },
        { value: "python", label: "Python" },
        { value: "figma", label: "Figma" },
        { value: "aws", label: "AWS" },
        { value: "vercel", label: "Vercel" },
      ],
    },
    {
      name: "liveUrl",
      label: "Live URL",
      type: "string",
    },
    {
      name: "githubUrl",
      label: "GitHub URL",
      type: "string",
    },
    {
      name: "featured",
      label: "Featured Project",
      type: "boolean",
    },
    {
      name: "testimonial",
      label: "Client Testimonial",
      type: "reference",
      collections: ["testimonial"],
    },
    {
      name: "body",
      label: "Case Study Content",
      type: "rich-text",
      isBody: true,
      templates: [
        {
          name: "challenge",
          label: "Challenge Section",
          fields: [
            {
              name: "title",
              label: "Title",
              type: "string",
            },
            {
              name: "content",
              label: "Content",
              type: "rich-text",
            },
          ],
        },
        {
          name: "solution",
          label: "Solution Section",
          fields: [
            {
              name: "title",
              label: "Title",
              type: "string",
            },
            {
              name: "content",
              label: "Content",
              type: "rich-text",
            },
          ],
        },
        {
          name: "results",
          label: "Results Section",
          fields: [
            {
              name: "stats",
              label: "Stats",
              type: "object",
              list: true,
              fields: [
                { name: "value", label: "Value", type: "string" },
                { name: "label", label: "Label", type: "string" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

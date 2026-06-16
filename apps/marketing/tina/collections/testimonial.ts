import type { Collection } from "tinacms";

export const testimonialCollection: Collection = {
  name: "testimonial",
  label: "Testimonials",
  path: "content/testimonials",
  format: "mdx",
  fields: [
    {
      name: "quote",
      label: "Quote",
      type: "string",
      required: true,
      isTitle: true,
      ui: {
        component: "textarea",
      },
    },
    {
      name: "author",
      label: "Author",
      type: "reference",
      collections: ["author"],
      description: "Reference an existing author",
    },
    {
      name: "authorName",
      label: "Author Name (Inline)",
      type: "string",
      description: "Use if not referencing an author",
    },
    {
      name: "authorRole",
      label: "Author Role (Inline)",
      type: "string",
    },
    {
      name: "authorAvatar",
      label: "Author Avatar (Inline)",
      type: "image",
    },
    {
      name: "company",
      label: "Company",
      type: "string",
    },
    {
      name: "companyLogo",
      label: "Company Logo",
      type: "image",
    },
    {
      name: "rating",
      label: "Rating (1-5)",
      type: "number",
      ui: {
        validate: (value) => {
          if (value && (value < 1 || value > 5)) {
            return "Rating must be between 1 and 5";
          }
        },
      },
    },
    {
      name: "featured",
      label: "Featured",
      type: "boolean",
      description: "Highlight this testimonial",
    },
  ],
};

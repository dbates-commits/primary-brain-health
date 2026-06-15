import type { Template } from "tinacms";

export const testimonialsBlock: Template = {
  name: "testimonials",
  label: "Testimonials Section",
  ui: {
    defaultItem: {
      variant: "carousel",
      theme: "light",
      headline: "What Our Customers Say",
      useReferences: false,
      items: [
        {
          quote: "This product has completely transformed how we work. Highly recommended!",
          authorName: "Jane Doe",
          authorRole: "CEO",
          company: "Acme Inc",
          rating: 5,
        },
      ],
    },
    itemProps: (item) => ({
      label: `Testimonials - ${item?.variant || "carousel"}`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "carousel", label: "Carousel" },
        { value: "grid", label: "Grid" },
        { value: "single", label: "Single Featured" },
        { value: "quotes", label: "Quotes Wall" },
      ],
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
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
      name: "useReferences",
      label: "Use Referenced Testimonials",
      type: "boolean",
      description: "Pull from the Testimonials collection instead of inline",
    },
    {
      name: "testimonialRefs",
      label: "Referenced Testimonials",
      type: "object",
      list: true,
      fields: [
        {
          name: "testimonial",
          label: "Testimonial",
          type: "reference",
          collections: ["testimonial"],
        },
      ],
    },
    {
      name: "items",
      label: "Inline Testimonials",
      type: "object",
      list: true,
      description: "Add testimonials directly (when not using references)",
      ui: {
        itemProps: (item) => ({
          label: item?.authorName || "Testimonial",
        }),
      },
      fields: [
        {
          name: "quote",
          label: "Quote",
          type: "string",
          required: true,
          ui: {
            component: "textarea",
          },
        },
        {
          name: "authorName",
          label: "Author Name",
          type: "string",
          required: true,
        },
        {
          name: "authorRole",
          label: "Author Role",
          type: "string",
        },
        {
          name: "company",
          label: "Company",
          type: "string",
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "image",
        },
        {
          name: "rating",
          label: "Rating (1-5)",
          type: "number",
        },
      ],
    },
  ],
};

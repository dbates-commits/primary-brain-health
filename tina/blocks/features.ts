import type { Template } from "tinacms";

export const featuresBlock: Template = {
  name: "features",
  label: "Features Section",
  ui: {
    defaultItem: {
      variant: "grid",
      theme: "light",
      headline: "Why Choose Us",
      subheadline: "Everything you need to succeed",
      columns: "3",
      items: [
        {
          title: "Feature One",
          description: "Description of your first amazing feature",
          icon: "rocket",
        },
        {
          title: "Feature Two",
          description: "Description of your second amazing feature",
          icon: "shield",
        },
        {
          title: "Feature Three",
          description: "Description of your third amazing feature",
          icon: "zap",
        },
      ],
    },
    itemProps: (item) => ({
      label: `Features - ${item?.variant || "grid"} (${item?.items?.length || 0} items)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "grid", label: "Grid" },
        { value: "alternating", label: "Alternating" },
        { value: "iconCards", label: "Icon Cards" },
        { value: "comparison", label: "Comparison" },
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
      name: "columns",
      label: "Columns",
      type: "string",
      options: ["2", "3", "4"],
      description: "Number of columns (grid variant only)",
    },
    {
      name: "items",
      label: "Feature Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Feature Item",
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
          name: "description",
          label: "Description",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "icon",
          label: "Icon",
          type: "string",
          options: [
            { value: "rocket", label: "Rocket" },
            { value: "shield", label: "Shield" },
            { value: "zap", label: "Zap" },
            { value: "heart", label: "Heart" },
            { value: "star", label: "Star" },
            { value: "check", label: "Check" },
            { value: "clock", label: "Clock" },
            { value: "globe", label: "Globe" },
            { value: "lock", label: "Lock" },
            { value: "chart", label: "Chart" },
            { value: "users", label: "Users" },
            { value: "code", label: "Code" },
          ],
        },
        {
          name: "image",
          label: "Image",
          type: "image",
          description: "Used for alternating layout",
        },
        {
          name: "link",
          label: "Link",
          type: "string",
        },
      ],
    },
  ],
};

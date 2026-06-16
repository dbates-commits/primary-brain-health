import type { Template } from "tinacms";

export const galleryBlock: Template = {
  name: "gallery",
  label: "Gallery Section",
  ui: {
    defaultItem: {
      variant: "grid",
      theme: "light",
      columns: "3",
      items: [],
    },
    itemProps: (item) => ({
      label: `Gallery - ${item?.variant || "grid"} (${item?.items?.length || 0} items)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "grid", label: "Grid" },
        { value: "masonry", label: "Masonry" },
        { value: "carousel", label: "Carousel" },
        { value: "lightbox", label: "Lightbox Gallery" },
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
      options: ["2", "3", "4", "5"],
    },
    {
      name: "gap",
      label: "Gap Size",
      type: "string",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    {
      name: "items",
      label: "Gallery Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.caption || item?.alt || "Gallery Item",
        }),
      },
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
        {
          name: "video",
          label: "Video URL",
          type: "string",
          description: "YouTube/Vimeo URL (overrides image in lightbox)",
        },
        {
          name: "aspectRatio",
          label: "Aspect Ratio",
          type: "string",
          options: [
            { value: "square", label: "Square (1:1)" },
            { value: "video", label: "Video (16:9)" },
            { value: "portrait", label: "Portrait (3:4)" },
            { value: "landscape", label: "Landscape (4:3)" },
          ],
        },
      ],
    },
  ],
};

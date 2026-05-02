import type { Template } from "tinacms";

export const scrollFillLogoBlock: Template = {
  name: "scrollFillLogo",
  label: "Scroll Fill Logo",
  ui: {
    defaultItem: {
      slides: [
        {
          label: "You are doing the right thing at the right place",
          headline:
            "We help you understand your brain, reduce your risk, and take action early through advanced assessment, clinical insight, and ongoing personalized care.",
        },
        {
          label: "Why Primary Brain Health?",
          headline:
            "Brain health today is reactive, fragmented, and often imprecise. PBH is built for what comes next.",
        },
      ],
    },
    itemProps: (item) => ({
      label: `Scroll Fill Logo - ${
        item?.slides?.[0]?.headline?.slice(0, 40) || "Untitled"
      }`,
    }),
  },
  fields: [
    {
      name: "slides",
      label: "Slides",
      type: "object",
      list: true,
      description:
        "Each slide fades in and out as the section is scrolled. Add as many as you want — they're divided evenly across the scroll.",
      ui: {
        itemProps: (item) => ({
          label:
            item?.label ||
            item?.headline?.slice(0, 50) ||
            "Slide",
        }),
        defaultItem: {
          label: "",
          headline: "",
        },
      },
      fields: [
        {
          name: "label",
          label: "Eyebrow Label",
          type: "string",
          description: "Rendered uppercase in the design.",
        },
        {
          name: "headline",
          label: "Headline",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
  ],
};

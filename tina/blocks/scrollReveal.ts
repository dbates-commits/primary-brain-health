import type { Template } from "tinacms";

export const scrollRevealBlock: Template = {
  name: "scrollReveal",
  label: "Scroll Reveal Text",
  ui: {
    defaultItem: {
      label: "YOU ARE DOING THE RIGHT THING AT THE RIGHT PLACE",
      headline:
        "We help you understand your brain, reduce your risk, and take action early through advanced assessment, clinical insight, and ongoing personalized care.",
    },
    itemProps: (item) => ({
      label: `Scroll Reveal - ${item?.headline?.slice(0, 40) || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "label",
      label: "Eyebrow Label",
      type: "string",
      description: "Small uppercase text shown above the headline (optional)",
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
};

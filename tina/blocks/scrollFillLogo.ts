import type { Template } from "tinacms";

export const scrollFillLogoBlock: Template = {
  name: "scrollFillLogo",
  label: "Scroll Fill Logo",
  ui: {
    defaultItem: {
      label: "YOU ARE DOING THE RIGHT THING AT THE RIGHT PLACE",
      headline:
        "We help you understand your brain, reduce your risk, and take action early through advanced assessment, clinical insight, and ongoing personalized care.",
      secondLabel: "WHY PRIMARY BRAIN HEALTH?",
      secondHeadline:
        "Brain health today is reactive, fragmented, and often imprecise. PBH is built for what comes next.",
      thirdLabel: "HOW IT WORKS",
      thirdHeadline:
        "Move at your own pace, with expert guidance available when you want it.",
    },
    itemProps: (item) => ({
      label: `Scroll Fill Logo - ${item?.headline?.slice(0, 40) || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "label",
      label: "Eyebrow Label (first)",
      type: "string",
      description: "Shown as the animation begins (progress 0 → ~0.33)",
    },
    {
      name: "headline",
      label: "Headline (first)",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "secondLabel",
      label: "Eyebrow Label (second)",
      type: "string",
      description: "Shown during the middle third (progress ~0.33 → ~0.66)",
    },
    {
      name: "secondHeadline",
      label: "Headline (second)",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "thirdLabel",
      label: "Eyebrow Label (third)",
      type: "string",
      description: "Shown in the final third (progress ~0.66 → 1)",
    },
    {
      name: "thirdHeadline",
      label: "Headline (third)",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
  ],
};

import type { Template } from "tinacms";

export const bookingStepFlowBlock: Template = {
  name: "bookingStepFlow",
  label: "Booking Step Flow",
  ui: {
    defaultItem: {
      headline: "Start With a Brain Health assessment & Consultation",
      subheadline:
        "A clinically grounded starting point to understand your cognitive health, review risk factors, and get a personalized plan for what to do next.",
    },
    itemProps: (item) => ({
      label: `Booking Step Flow - ${item?.headline || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "headline",
      label: "Headline",
      type: "string",
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
  ],
};

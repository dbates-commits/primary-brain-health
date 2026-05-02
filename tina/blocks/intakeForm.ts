import type { Template } from "tinacms";

export const intakeFormBlock: Template = {
  name: "intakeForm",
  label: "Intake Form",
  ui: {
    defaultItem: {
      headline: "Ready to Take the First Step?",
      subheadline: "Book your initial brain health consultation.",
      buttonText: "Book a Consultation",
    },
    itemProps: (item) => ({
      label: `Intake Form - ${item?.headline || "Untitled"}`,
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
    {
      name: "buttonText",
      label: "Button Text",
      type: "string",
    },
    {
      name: "buttonTextMobile",
      label: "Button Text (Mobile)",
      type: "string",
      description:
        "Shorter button label shown on small screens (<640px). Falls back to Button Text if empty.",
    },
    {
      name: "showIncludes",
      label: "Show 'Includes:' panel",
      type: "boolean",
      description:
        "Toggle the consultation 'Includes:' list. Turn off on general contact pages where the form is for any inquiry.",
    },
  ],
};

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
      description:
        "Submit label on the booking form, e.g. 'Book Your Assessment and Consultation'.",
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
        "Toggle the right-hand panel listing what the assessment includes, and its price. Turn off on general contact pages where the form is for any inquiry — the form then goes full width. The list and price themselves are code-owned (ASSESSMENT_PACKAGES in @pbh/booking), because they are the promise the charge is made against.",
    },
  ],
};

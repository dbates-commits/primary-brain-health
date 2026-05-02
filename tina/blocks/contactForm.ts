import type { Template } from "tinacms";

export const contactFormBlock: Template = {
  name: "contactForm",
  label: "Contact Form",
  ui: {
    defaultItem: {
      headline: "Let's get in touch",
      subheadline:
        "Have a question for our team? Fill out the form and we'll get back to you within one business day.",
      buttonText: "Send Message",
    },
    itemProps: (item) => ({
      label: `Contact Form - ${item?.headline?.slice(0, 40) || "Untitled"}`,
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
      ui: { component: "textarea" },
    },
    {
      name: "buttonText",
      label: "Submit Button Text",
      type: "string",
    },
  ],
};

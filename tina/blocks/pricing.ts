import type { Template } from "tinacms";

export const pricingBlock: Template = {
  name: "pricing",
  label: "Pricing Section",
  ui: {
    defaultItem: {
      variant: "cards",
      theme: "light",
      headline: "Simple, Transparent Pricing",
      subheadline: "Choose the plan that works for you",
      tiers: [
        {
          name: "Starter",
          price: "9",
          period: "month",
          description: "Perfect for individuals",
          features: ["5 Projects", "Basic Support", "1GB Storage"],
          buttonText: "Get Started",
          buttonLink: "#",
        },
        {
          name: "Pro",
          price: "29",
          period: "month",
          description: "Best for growing teams",
          features: ["Unlimited Projects", "Priority Support", "10GB Storage", "Analytics"],
          buttonText: "Start Free Trial",
          buttonLink: "#",
          highlighted: true,
        },
        {
          name: "Enterprise",
          price: "99",
          period: "month",
          description: "For large organizations",
          features: ["Everything in Pro", "Dedicated Support", "Unlimited Storage", "Custom Integrations", "SLA"],
          buttonText: "Contact Sales",
          buttonLink: "#",
        },
      ],
    },
    itemProps: (item) => ({
      label: `Pricing - ${item?.variant || "cards"} (${item?.tiers?.length || 0} tiers)`,
    }),
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "cards", label: "Cards" },
        { value: "table", label: "Table" },
        { value: "comparison", label: "Feature Comparison" },
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
      name: "showToggle",
      label: "Show Monthly/Annual Toggle",
      type: "boolean",
    },
    {
      name: "annualDiscount",
      label: "Annual Discount %",
      type: "number",
      description: "Discount percentage for annual billing",
    },
    {
      name: "tiers",
      label: "Pricing Tiers",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Tier",
        }),
      },
      fields: [
        {
          name: "name",
          label: "Tier Name",
          type: "string",
          required: true,
        },
        {
          name: "price",
          label: "Price",
          type: "string",
          required: true,
        },
        {
          name: "period",
          label: "Billing Period",
          type: "string",
          options: [
            { value: "month", label: "Per Month" },
            { value: "year", label: "Per Year" },
            { value: "once", label: "One Time" },
          ],
        },
        {
          name: "description",
          label: "Description",
          type: "string",
        },
        {
          name: "features",
          label: "Features",
          type: "string",
          list: true,
        },
        {
          name: "buttonText",
          label: "Button Text",
          type: "string",
        },
        {
          name: "buttonLink",
          label: "Button Link",
          type: "string",
        },
        {
          name: "highlighted",
          label: "Highlighted (Featured)",
          type: "boolean",
        },
        {
          name: "badge",
          label: "Badge Text",
          type: "string",
          description: "e.g., 'Most Popular'",
        },
      ],
    },
  ],
};

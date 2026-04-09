// tina/config.ts
import { defineConfig } from "tinacms";

// tina/blocks/hero.ts
var heroBlock = {
  name: "hero",
  label: "Hero Section",
  ui: {
    defaultItem: {
      theme: "light",
      headline: "Build Something Amazing",
      subheadline: "A powerful platform to bring your ideas to life",
      primaryButtonText: "Get Started",
      primaryButtonLink: "#"
    },
    itemProps: (item) => ({
      label: `Hero - ${item?.headline || "Untitled"}`
    })
  },
  fields: [
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadlineRich",
      label: "Subheadline",
      type: "rich-text"
    },
    {
      name: "image",
      label: "Image",
      type: "image",
      description: "Poster/fallback image for the hero video"
    },
    {
      name: "trustText",
      label: "Trust Badge Text",
      type: "string",
      description: "Text shown next to the trust avatars (e.g. 'Trusted by 3,200+ patients and families')"
    },
    {
      name: "primaryButtonText",
      label: "Primary Button Text",
      type: "string"
    },
    {
      name: "primaryButtonLink",
      label: "Primary Button Link",
      type: "string"
    }
  ]
};

// tina/blocks/features.ts
var featuresBlock = {
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
          icon: "rocket"
        },
        {
          title: "Feature Two",
          description: "Description of your second amazing feature",
          icon: "shield"
        },
        {
          title: "Feature Three",
          description: "Description of your third amazing feature",
          icon: "zap"
        }
      ]
    },
    itemProps: (item) => ({
      label: `Features - ${item?.variant || "grid"} (${item?.items?.length || 0} items)`
    })
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
        { value: "comparison", label: "Comparison" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "columns",
      label: "Columns",
      type: "string",
      options: ["2", "3", "4"],
      description: "Number of columns (grid variant only)"
    },
    {
      name: "items",
      label: "Feature Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Feature Item"
        })
      },
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: {
            component: "textarea"
          }
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
            { value: "code", label: "Code" }
          ]
        },
        {
          name: "image",
          label: "Image",
          type: "image",
          description: "Used for alternating layout"
        },
        {
          name: "link",
          label: "Link",
          type: "string"
        }
      ]
    }
  ]
};

// tina/blocks/testimonials.ts
var testimonialsBlock = {
  name: "testimonials",
  label: "Testimonials Section",
  ui: {
    defaultItem: {
      variant: "carousel",
      theme: "light",
      headline: "What Our Customers Say",
      useReferences: false,
      items: [
        {
          quote: "This product has completely transformed how we work. Highly recommended!",
          authorName: "Jane Doe",
          authorRole: "CEO",
          company: "Acme Inc",
          rating: 5
        }
      ]
    },
    itemProps: (item) => ({
      label: `Testimonials - ${item?.variant || "carousel"}`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "carousel", label: "Carousel" },
        { value: "grid", label: "Grid" },
        { value: "single", label: "Single Featured" },
        { value: "quotes", label: "Quotes Wall" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "useReferences",
      label: "Use Referenced Testimonials",
      type: "boolean",
      description: "Pull from the Testimonials collection instead of inline"
    },
    {
      name: "testimonialRefs",
      label: "Referenced Testimonials",
      type: "object",
      list: true,
      fields: [
        {
          name: "testimonial",
          label: "Testimonial",
          type: "reference",
          collections: ["testimonial"]
        }
      ]
    },
    {
      name: "items",
      label: "Inline Testimonials",
      type: "object",
      list: true,
      description: "Add testimonials directly (when not using references)",
      ui: {
        itemProps: (item) => ({
          label: item?.authorName || "Testimonial"
        })
      },
      fields: [
        {
          name: "quote",
          label: "Quote",
          type: "string",
          required: true,
          ui: {
            component: "textarea"
          }
        },
        {
          name: "authorName",
          label: "Author Name",
          type: "string",
          required: true
        },
        {
          name: "authorRole",
          label: "Author Role",
          type: "string"
        },
        {
          name: "company",
          label: "Company",
          type: "string"
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "image"
        },
        {
          name: "rating",
          label: "Rating (1-5)",
          type: "number"
        }
      ]
    }
  ]
};

// tina/blocks/cta.ts
var ctaBlock = {
  name: "cta",
  label: "Call to Action",
  ui: {
    defaultItem: {
      variant: "simple",
      theme: "primary",
      headline: "Ready to Get Started?",
      description: "Join thousands of satisfied customers today.",
      primaryButtonText: "Start Free Trial",
      primaryButtonLink: "#"
    },
    itemProps: (item) => ({
      label: `CTA - ${item?.variant || "simple"}`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "simple", label: "Simple" },
        { value: "withImage", label: "With Image" },
        { value: "newsletter", label: "Newsletter" },
        { value: "reference", label: "Global CTA Reference" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "gradient", label: "Gradient" }
      ]
    },
    {
      name: "globalCtaRef",
      label: "Global CTA Reference",
      type: "reference",
      collections: ["globalCta"],
      description: "Use a shared CTA (only for reference variant)"
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "image",
      label: "Image",
      type: "image",
      description: "For withImage variant"
    },
    {
      name: "primaryButtonText",
      label: "Primary Button Text",
      type: "string"
    },
    {
      name: "primaryButtonLink",
      label: "Primary Button Link",
      type: "string"
    },
    {
      name: "secondaryButtonText",
      label: "Secondary Button Text",
      type: "string"
    },
    {
      name: "secondaryButtonLink",
      label: "Secondary Button Link",
      type: "string"
    },
    {
      name: "emailPlaceholder",
      label: "Email Placeholder",
      type: "string",
      description: "For newsletter variant"
    },
    {
      name: "submitButtonText",
      label: "Submit Button Text",
      type: "string",
      description: "For newsletter variant"
    }
  ]
};

// tina/blocks/content.ts
var contentBlock = {
  name: "content",
  label: "Content Section",
  ui: {
    defaultItem: {
      variant: "default",
      theme: "light"
    },
    itemProps: (item) => ({
      label: `Content - ${item?.variant || "default"}`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "default", label: "Default (Full Width)" },
        { value: "twoColumn", label: "Two Column" },
        { value: "withSidebar", label: "With Sidebar" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "label",
      label: "Section Label",
      type: "string",
      description: "Small uppercase text above the headline (e.g. 'Our Approach')"
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "bodyText",
      label: "Body Content",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "sidebarContent",
      label: "Sidebar Content",
      type: "rich-text",
      description: "For withSidebar variant"
    },
    {
      name: "leftColumn",
      label: "Left Column",
      type: "rich-text",
      description: "For twoColumn variant"
    },
    {
      name: "rightColumn",
      label: "Right Column",
      type: "rich-text",
      description: "For twoColumn variant"
    }
  ]
};

// tina/blocks/gallery.ts
var galleryBlock = {
  name: "gallery",
  label: "Gallery Section",
  ui: {
    defaultItem: {
      variant: "grid",
      theme: "light",
      columns: "3",
      items: []
    },
    itemProps: (item) => ({
      label: `Gallery - ${item?.variant || "grid"} (${item?.items?.length || 0} items)`
    })
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
        { value: "lightbox", label: "Lightbox Gallery" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "columns",
      label: "Columns",
      type: "string",
      options: ["2", "3", "4", "5"]
    },
    {
      name: "gap",
      label: "Gap Size",
      type: "string",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" }
      ]
    },
    {
      name: "items",
      label: "Gallery Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.caption || item?.alt || "Gallery Item"
        })
      },
      fields: [
        {
          name: "image",
          label: "Image",
          type: "image"
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string"
        },
        {
          name: "caption",
          label: "Caption",
          type: "string"
        },
        {
          name: "video",
          label: "Video URL",
          type: "string",
          description: "YouTube/Vimeo URL (overrides image in lightbox)"
        },
        {
          name: "aspectRatio",
          label: "Aspect Ratio",
          type: "string",
          options: [
            { value: "square", label: "Square (1:1)" },
            { value: "video", label: "Video (16:9)" },
            { value: "portrait", label: "Portrait (3:4)" },
            { value: "landscape", label: "Landscape (4:3)" }
          ]
        }
      ]
    }
  ]
};

// tina/blocks/pricing.ts
var pricingBlock = {
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
          buttonLink: "#"
        },
        {
          name: "Pro",
          price: "29",
          period: "month",
          description: "Best for growing teams",
          features: ["Unlimited Projects", "Priority Support", "10GB Storage", "Analytics"],
          buttonText: "Start Free Trial",
          buttonLink: "#",
          highlighted: true
        },
        {
          name: "Enterprise",
          price: "99",
          period: "month",
          description: "For large organizations",
          features: ["Everything in Pro", "Dedicated Support", "Unlimited Storage", "Custom Integrations", "SLA"],
          buttonText: "Contact Sales",
          buttonLink: "#"
        }
      ]
    },
    itemProps: (item) => ({
      label: `Pricing - ${item?.variant || "cards"} (${item?.tiers?.length || 0} tiers)`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "cards", label: "Cards" },
        { value: "table", label: "Table" },
        { value: "comparison", label: "Feature Comparison" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "showToggle",
      label: "Show Monthly/Annual Toggle",
      type: "boolean"
    },
    {
      name: "annualDiscount",
      label: "Annual Discount %",
      type: "number",
      description: "Discount percentage for annual billing"
    },
    {
      name: "tiers",
      label: "Pricing Tiers",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Tier"
        })
      },
      fields: [
        {
          name: "name",
          label: "Tier Name",
          type: "string",
          required: true
        },
        {
          name: "price",
          label: "Price",
          type: "string",
          required: true
        },
        {
          name: "period",
          label: "Billing Period",
          type: "string",
          options: [
            { value: "month", label: "Per Month" },
            { value: "year", label: "Per Year" },
            { value: "once", label: "One Time" }
          ]
        },
        {
          name: "description",
          label: "Description",
          type: "string"
        },
        {
          name: "features",
          label: "Features",
          type: "string",
          list: true
        },
        {
          name: "buttonText",
          label: "Button Text",
          type: "string"
        },
        {
          name: "buttonLink",
          label: "Button Link",
          type: "string"
        },
        {
          name: "highlighted",
          label: "Highlighted (Featured)",
          type: "boolean"
        },
        {
          name: "badge",
          label: "Badge Text",
          type: "string",
          description: "e.g., 'Most Popular'"
        }
      ]
    }
  ]
};

// tina/blocks/faq.ts
var faqBlock = {
  name: "faq",
  label: "FAQ Section",
  ui: {
    defaultItem: {
      variant: "accordion",
      theme: "light",
      headline: "Frequently Asked Questions",
      items: [
        {
          question: "What is your refund policy?",
          answer: "We offer a 30-day money-back guarantee on all plans."
        },
        {
          question: "Can I upgrade my plan later?",
          answer: "Yes, you can upgrade or downgrade your plan at any time."
        },
        {
          question: "Do you offer customer support?",
          answer: "Yes, we offer 24/7 customer support via email and chat."
        }
      ]
    },
    itemProps: (item) => ({
      label: `FAQ - ${item?.variant || "accordion"} (${item?.items?.length || 0} items)`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "accordion", label: "Accordion" },
        { value: "twoColumn", label: "Two Column" },
        { value: "cards", label: "Cards" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "items",
      label: "FAQ Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.question || "FAQ Item"
        })
      },
      fields: [
        {
          name: "question",
          label: "Question",
          type: "string",
          required: true
        },
        {
          name: "answer",
          label: "Answer",
          type: "rich-text"
        },
        {
          name: "category",
          label: "Category",
          type: "string",
          description: "Optional category for grouping"
        }
      ]
    },
    {
      name: "showCategories",
      label: "Show Category Filters",
      type: "boolean"
    },
    {
      name: "ctaText",
      label: "CTA Text",
      type: "string",
      description: "e.g., 'Still have questions? Contact us'"
    },
    {
      name: "ctaLink",
      label: "CTA Link",
      type: "string"
    }
  ]
};

// tina/blocks/team.ts
var teamBlock = {
  name: "team",
  label: "Team Section",
  ui: {
    defaultItem: {
      variant: "grid",
      theme: "light",
      headline: "Meet Our Team",
      subheadline: "The people behind the magic",
      useReferences: false
    },
    itemProps: (item) => ({
      label: `Team - ${item?.variant || "grid"}`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "grid", label: "Grid" },
        { value: "carousel", label: "Carousel" },
        { value: "list", label: "List" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "columns",
      label: "Columns",
      type: "string",
      options: ["2", "3", "4"]
    },
    {
      name: "useReferences",
      label: "Use Author References",
      type: "boolean",
      description: "Pull from the Authors collection"
    },
    {
      name: "authorRefs",
      label: "Referenced Authors",
      type: "object",
      list: true,
      fields: [
        {
          name: "author",
          label: "Author",
          type: "reference",
          collections: ["author"]
        }
      ]
    },
    {
      name: "members",
      label: "Team Members (Inline)",
      type: "object",
      list: true,
      description: "Add team members directly",
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Team Member"
        })
      },
      fields: [
        {
          name: "name",
          label: "Name",
          type: "string",
          required: true
        },
        {
          name: "role",
          label: "Role",
          type: "string"
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "image"
        },
        {
          name: "bio",
          label: "Bio",
          type: "string",
          ui: {
            component: "textarea"
          }
        },
        {
          name: "social",
          label: "Social Links",
          type: "object",
          fields: [
            { name: "twitter", label: "Twitter URL", type: "string" },
            { name: "linkedin", label: "LinkedIn URL", type: "string" },
            { name: "github", label: "GitHub URL", type: "string" }
          ]
        }
      ]
    }
  ]
};

// tina/blocks/stats.ts
var statsBlock = {
  name: "stats",
  label: "Stats Section",
  ui: {
    defaultItem: {
      variant: "counters",
      theme: "light",
      items: [
        { value: "10K+", label: "Active Users" },
        { value: "99.9%", label: "Uptime" },
        { value: "50+", label: "Countries" },
        { value: "24/7", label: "Support" }
      ]
    },
    itemProps: (item) => ({
      label: `Stats - ${item?.variant || "counters"} (${item?.items?.length || 0} items)`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "counters", label: "Counters" },
        { value: "progress", label: "Progress Bars" },
        { value: "icons", label: "With Icons" },
        { value: "cards", label: "Cards" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "gradient", label: "Gradient" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "animate",
      label: "Animate Numbers",
      type: "boolean",
      description: "Count up animation on scroll"
    },
    {
      name: "items",
      label: "Stat Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item?.value || ""} - ${item?.label || "Stat"}`
        })
      },
      fields: [
        {
          name: "value",
          label: "Value",
          type: "string",
          required: true,
          description: "e.g., '10K+', '99.9%', '24/7'"
        },
        {
          name: "label",
          label: "Label",
          type: "string",
          required: true
        },
        {
          name: "icon",
          label: "Icon",
          type: "string",
          options: [
            { value: "users", label: "Users" },
            { value: "globe", label: "Globe" },
            { value: "chart", label: "Chart" },
            { value: "clock", label: "Clock" },
            { value: "heart", label: "Heart" },
            { value: "star", label: "Star" },
            { value: "zap", label: "Zap" },
            { value: "shield", label: "Shield" }
          ]
        },
        {
          name: "description",
          label: "Description",
          type: "string"
        },
        {
          name: "progress",
          label: "Progress Value (0-100)",
          type: "number",
          description: "For progress bar variant"
        }
      ]
    }
  ]
};

// tina/blocks/logoCloud.ts
var logoCloudBlock = {
  name: "logoCloud",
  label: "Logo Cloud Section",
  ui: {
    defaultItem: {
      variant: "simple",
      theme: "light",
      headline: "Trusted by Industry Leaders",
      grayscale: true
    },
    itemProps: (item) => ({
      label: `Logo Cloud - ${item?.variant || "simple"} (${item?.logos?.length || 0} logos)`
    })
  },
  fields: [
    {
      name: "variant",
      label: "Layout Style",
      type: "string",
      options: [
        { value: "simple", label: "Simple Row" },
        { value: "marquee", label: "Marquee (Scrolling)" },
        { value: "grid", label: "Grid" }
      ]
    },
    {
      name: "theme",
      label: "Color Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" }
      ]
    },
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string"
    },
    {
      name: "grayscale",
      label: "Grayscale Logos",
      type: "boolean",
      description: "Display logos in grayscale (color on hover)"
    },
    {
      name: "size",
      label: "Logo Size",
      type: "string",
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" }
      ]
    },
    {
      name: "logos",
      label: "Logos",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.name || "Logo"
        })
      },
      fields: [
        {
          name: "image",
          label: "Logo Image",
          type: "image",
          required: true
        },
        {
          name: "name",
          label: "Company Name",
          type: "string",
          required: true
        },
        {
          name: "url",
          label: "Website URL",
          type: "string"
        }
      ]
    }
  ]
};

// tina/blocks/intakeForm.ts
var intakeFormBlock = {
  name: "intakeForm",
  label: "Intake Form",
  ui: {
    defaultItem: {
      headline: "Ready to Take the First Step?",
      subheadline: "Book your initial brain health consultation.",
      buttonText: "Book a Consultation"
    },
    itemProps: (item) => ({
      label: `Intake Form - ${item?.headline || "Untitled"}`
    })
  },
  fields: [
    {
      name: "headline",
      label: "Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Subheadline",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "buttonText",
      label: "Button Text",
      type: "string"
    }
  ]
};

// tina/collections/page.ts
var pageCollection = {
  name: "page",
  label: "Pages",
  path: "content/pages",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      if (document._sys.filename === "home") {
        return "/";
      }
      return `/${document._sys.filename}`;
    }
  },
  fields: [
    {
      name: "title",
      label: "Page Title",
      type: "string",
      required: true,
      isTitle: true
    },
    {
      name: "description",
      label: "Meta Description",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "socialImage",
      label: "Social Image",
      type: "image",
      description: "Override default social image for this page"
    },
    {
      name: "blocks",
      label: "Page Blocks",
      type: "object",
      list: true,
      ui: {
        visualSelector: true
      },
      templates: [
        heroBlock,
        featuresBlock,
        testimonialsBlock,
        ctaBlock,
        contentBlock,
        galleryBlock,
        pricingBlock,
        faqBlock,
        teamBlock,
        statsBlock,
        logoCloudBlock,
        intakeFormBlock
      ]
    }
  ]
};

// tina/collections/post.ts
var postCollection = {
  name: "post",
  label: "Blog Posts",
  path: "content/posts",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      return `/blog/${document._sys.filename}`;
    }
  },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
      required: true,
      isTitle: true
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "author",
      label: "Author",
      type: "reference",
      collections: ["author"]
    },
    {
      name: "date",
      label: "Publish Date",
      type: "datetime",
      required: true
    },
    {
      name: "featuredImage",
      label: "Featured Image",
      type: "image"
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      options: [
        { value: "technology", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "business", label: "Business" },
        { value: "tutorial", label: "Tutorial" },
        { value: "news", label: "News" }
      ]
    },
    {
      name: "tags",
      label: "Tags",
      type: "string",
      list: true
    },
    {
      name: "featured",
      label: "Featured Post",
      type: "boolean",
      description: "Show on homepage or featured section"
    },
    {
      name: "body",
      label: "Body",
      type: "rich-text",
      isBody: true,
      templates: [
        {
          name: "callout",
          label: "Callout Box",
          fields: [
            {
              name: "type",
              label: "Type",
              type: "string",
              options: [
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "success", label: "Success" },
                { value: "error", label: "Error" }
              ]
            },
            {
              name: "title",
              label: "Title",
              type: "string"
            },
            {
              name: "text",
              label: "Text",
              type: "string",
              ui: {
                component: "textarea"
              }
            }
          ]
        },
        {
          name: "codeBlock",
          label: "Code Block",
          fields: [
            {
              name: "language",
              label: "Language",
              type: "string",
              options: [
                "javascript",
                "typescript",
                "python",
                "bash",
                "json",
                "html",
                "css",
                "jsx",
                "tsx"
              ]
            },
            {
              name: "code",
              label: "Code",
              type: "string",
              ui: {
                component: "textarea"
              }
            },
            {
              name: "filename",
              label: "Filename",
              type: "string"
            }
          ]
        },
        {
          name: "imageGallery",
          label: "Image Gallery",
          fields: [
            {
              name: "images",
              label: "Images",
              type: "object",
              list: true,
              fields: [
                { name: "src", label: "Image", type: "image" },
                { name: "alt", label: "Alt Text", type: "string" },
                { name: "caption", label: "Caption", type: "string" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "relatedPosts",
      label: "Related Posts",
      type: "object",
      list: true,
      fields: [
        {
          name: "post",
          label: "Post",
          type: "reference",
          collections: ["post"]
        }
      ]
    }
  ]
};

// tina/collections/project.ts
var projectCollection = {
  name: "project",
  label: "Projects",
  path: "content/projects",
  format: "mdx",
  ui: {
    router: ({ document }) => {
      return `/projects/${document._sys.filename}`;
    }
  },
  fields: [
    {
      name: "title",
      label: "Project Title",
      type: "string",
      required: true,
      isTitle: true
    },
    {
      name: "description",
      label: "Short Description",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "client",
      label: "Client Name",
      type: "string"
    },
    {
      name: "date",
      label: "Project Date",
      type: "datetime"
    },
    {
      name: "featuredImage",
      label: "Featured Image",
      type: "image"
    },
    {
      name: "gallery",
      label: "Project Gallery",
      type: "object",
      list: true,
      fields: [
        {
          name: "image",
          label: "Image",
          type: "image"
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string"
        },
        {
          name: "caption",
          label: "Caption",
          type: "string"
        }
      ]
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      options: [
        { value: "web", label: "Web Development" },
        { value: "mobile", label: "Mobile App" },
        { value: "branding", label: "Branding" },
        { value: "design", label: "UI/UX Design" },
        { value: "ecommerce", label: "E-commerce" }
      ]
    },
    {
      name: "techStack",
      label: "Tech Stack",
      type: "string",
      list: true,
      options: [
        { value: "react", label: "React" },
        { value: "nextjs", label: "Next.js" },
        { value: "typescript", label: "TypeScript" },
        { value: "tailwind", label: "Tailwind CSS" },
        { value: "node", label: "Node.js" },
        { value: "python", label: "Python" },
        { value: "figma", label: "Figma" },
        { value: "aws", label: "AWS" },
        { value: "vercel", label: "Vercel" }
      ]
    },
    {
      name: "liveUrl",
      label: "Live URL",
      type: "string"
    },
    {
      name: "githubUrl",
      label: "GitHub URL",
      type: "string"
    },
    {
      name: "featured",
      label: "Featured Project",
      type: "boolean"
    },
    {
      name: "testimonial",
      label: "Client Testimonial",
      type: "reference",
      collections: ["testimonial"]
    },
    {
      name: "body",
      label: "Case Study Content",
      type: "rich-text",
      isBody: true,
      templates: [
        {
          name: "challenge",
          label: "Challenge Section",
          fields: [
            {
              name: "title",
              label: "Title",
              type: "string"
            },
            {
              name: "content",
              label: "Content",
              type: "rich-text"
            }
          ]
        },
        {
          name: "solution",
          label: "Solution Section",
          fields: [
            {
              name: "title",
              label: "Title",
              type: "string"
            },
            {
              name: "content",
              label: "Content",
              type: "rich-text"
            }
          ]
        },
        {
          name: "results",
          label: "Results Section",
          fields: [
            {
              name: "stats",
              label: "Stats",
              type: "object",
              list: true,
              fields: [
                { name: "value", label: "Value", type: "string" },
                { name: "label", label: "Label", type: "string" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// tina/collections/author.ts
var authorCollection = {
  name: "author",
  label: "Authors",
  path: "content/authors",
  format: "mdx",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "string",
      required: true,
      isTitle: true
    },
    {
      name: "role",
      label: "Role / Title",
      type: "string"
    },
    {
      name: "avatar",
      label: "Avatar",
      type: "image"
    },
    {
      name: "bio",
      label: "Bio",
      type: "rich-text"
    },
    {
      name: "email",
      label: "Email",
      type: "string"
    },
    {
      name: "social",
      label: "Social Links",
      type: "object",
      fields: [
        {
          name: "twitter",
          label: "Twitter URL",
          type: "string"
        },
        {
          name: "linkedin",
          label: "LinkedIn URL",
          type: "string"
        },
        {
          name: "github",
          label: "GitHub URL",
          type: "string"
        },
        {
          name: "website",
          label: "Personal Website",
          type: "string"
        }
      ]
    }
  ]
};

// tina/collections/testimonial.ts
var testimonialCollection = {
  name: "testimonial",
  label: "Testimonials",
  path: "content/testimonials",
  format: "mdx",
  fields: [
    {
      name: "quote",
      label: "Quote",
      type: "string",
      required: true,
      isTitle: true,
      ui: {
        component: "textarea"
      }
    },
    {
      name: "author",
      label: "Author",
      type: "reference",
      collections: ["author"],
      description: "Reference an existing author"
    },
    {
      name: "authorName",
      label: "Author Name (Inline)",
      type: "string",
      description: "Use if not referencing an author"
    },
    {
      name: "authorRole",
      label: "Author Role (Inline)",
      type: "string"
    },
    {
      name: "authorAvatar",
      label: "Author Avatar (Inline)",
      type: "image"
    },
    {
      name: "company",
      label: "Company",
      type: "string"
    },
    {
      name: "companyLogo",
      label: "Company Logo",
      type: "image"
    },
    {
      name: "rating",
      label: "Rating (1-5)",
      type: "number",
      ui: {
        validate: (value) => {
          if (value && (value < 1 || value > 5)) {
            return "Rating must be between 1 and 5";
          }
        }
      }
    },
    {
      name: "featured",
      label: "Featured",
      type: "boolean",
      description: "Highlight this testimonial"
    }
  ]
};

// tina/collections/globalCta.ts
var globalCtaCollection = {
  name: "globalCta",
  label: "Global CTAs",
  path: "content/global/ctas",
  format: "json",
  fields: [
    {
      name: "name",
      label: "Internal Name",
      type: "string",
      required: true,
      isTitle: true,
      description: "For identification in the admin"
    },
    {
      name: "headline",
      label: "Headline",
      type: "string",
      required: true
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "primaryButton",
      label: "Primary Button",
      type: "object",
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string"
        },
        {
          name: "link",
          label: "Link",
          type: "string"
        },
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" }
          ]
        }
      ]
    },
    {
      name: "secondaryButton",
      label: "Secondary Button",
      type: "object",
      fields: [
        {
          name: "text",
          label: "Text",
          type: "string"
        },
        {
          name: "link",
          label: "Link",
          type: "string"
        },
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" }
          ]
        }
      ]
    },
    {
      name: "theme",
      label: "Theme",
      type: "string",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "primary", label: "Primary" },
        { value: "gradient", label: "Gradient" }
      ]
    }
  ]
};

// tina/collections/settings.ts
var settingsCollection = {
  name: "settings",
  label: "Site Settings",
  path: "content/global",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    },
    global: true
  },
  fields: [
    {
      name: "siteName",
      label: "Site Name",
      type: "string",
      required: true
    },
    {
      name: "siteDescription",
      label: "Site Description",
      type: "string",
      ui: {
        component: "textarea"
      }
    },
    {
      name: "logo",
      label: "Logo",
      type: "image"
    },
    {
      name: "logoDark",
      label: "Logo (Dark Mode)",
      type: "image"
    },
    {
      name: "favicon",
      label: "Favicon",
      type: "image"
    },
    {
      name: "socialImage",
      label: "Default Social Image",
      type: "image",
      description: "Used for Open Graph / Twitter cards"
    },
    {
      name: "header",
      label: "Header",
      type: "object",
      fields: [
        {
          name: "navigation",
          label: "Navigation Items",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.label || "Nav Item"
            })
          },
          fields: [
            {
              name: "label",
              label: "Label",
              type: "string",
              required: true
            },
            {
              name: "link",
              label: "Link",
              type: "string",
              required: true
            },
            {
              name: "children",
              label: "Dropdown Items",
              type: "object",
              list: true,
              fields: [
                { name: "label", label: "Label", type: "string" },
                { name: "link", label: "Link", type: "string" },
                { name: "description", label: "Description", type: "string" }
              ]
            }
          ]
        },
        {
          name: "ctaButton",
          label: "CTA Button",
          type: "object",
          fields: [
            { name: "text", label: "Text", type: "string" },
            { name: "link", label: "Link", type: "string" }
          ]
        }
      ]
    },
    {
      name: "footer",
      label: "Footer",
      type: "object",
      fields: [
        {
          name: "copyright",
          label: "Copyright Text",
          type: "string"
        },
        {
          name: "columns",
          label: "Footer Columns",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.title || "Column"
            })
          },
          fields: [
            {
              name: "title",
              label: "Column Title",
              type: "string"
            },
            {
              name: "links",
              label: "Links",
              type: "object",
              list: true,
              fields: [
                { name: "label", label: "Label", type: "string" },
                { name: "link", label: "Link", type: "string" }
              ]
            }
          ]
        },
        {
          name: "social",
          label: "Social Links",
          type: "object",
          fields: [
            { name: "twitter", label: "Twitter URL", type: "string" },
            { name: "facebook", label: "Facebook URL", type: "string" },
            { name: "instagram", label: "Instagram URL", type: "string" },
            { name: "linkedin", label: "LinkedIn URL", type: "string" },
            { name: "github", label: "GitHub URL", type: "string" },
            { name: "youtube", label: "YouTube URL", type: "string" }
          ]
        }
      ]
    }
  ]
};

// tina/config.ts
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";
var config_default = defineConfig({
  branch,
  // Get this from tina.io (optional for local development)
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      pageCollection,
      postCollection,
      projectCollection,
      authorCollection,
      testimonialCollection,
      globalCtaCollection,
      settingsCollection
    ]
  }
});
export {
  config_default as default
};

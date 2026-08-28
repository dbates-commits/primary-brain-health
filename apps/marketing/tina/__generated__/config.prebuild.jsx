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
      label: "Image path",
      type: "string",
      description: "Path to the hero poster/fallback image in /public (e.g. /images/hero-brain-consultation.png)."
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
      name: "primaryButtonTextMobile",
      label: "Primary Button Text (Mobile)",
      type: "string",
      description: "Shorter button label shown on small screens (<640px). Falls back to Primary Button Text if empty."
    },
    {
      name: "primaryButtonLink",
      label: "Primary Button Link",
      type: "string"
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
      items: []
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
      description: "Pick FAQs from the FAQ collection. Order here is overridden by each FAQ's Sort Order if set.",
      fields: [
        {
          name: "faq",
          label: "FAQ",
          type: "reference",
          collections: ["faq"]
        }
      ]
    },
    {
      name: "limit",
      label: "Limit",
      type: "number",
      description: "Show only the first N FAQs (after sorting). Leave empty to show all."
    },
    {
      name: "showCategories",
      label: "Show Category Filters",
      type: "boolean"
    },
    {
      name: "ctaText",
      label: "CTA Description",
      type: "string",
      description: "Optional text above the CTA button, e.g. 'Still have questions?'"
    },
    {
      name: "ctaButtonText",
      label: "CTA Button Text",
      type: "string",
      description: "e.g. 'View All FAQs' or 'Contact Us'"
    },
    {
      name: "ctaLink",
      label: "CTA Link",
      type: "string"
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
      type: "string",
      description: "Submit label on the booking form, e.g. 'Book Your Assessment and Consultation'."
    },
    {
      name: "buttonTextMobile",
      label: "Button Text (Mobile)",
      type: "string",
      description: "Shorter button label shown on small screens (<640px). Falls back to Button Text if empty."
    },
    {
      name: "showIncludes",
      label: "Show 'Includes:' panel",
      type: "boolean",
      description: "Toggle the right-hand panel listing what the assessment includes, and its price. Turn off on general contact pages where the form is for any inquiry \u2014 the form then goes full width. The list and price themselves are code-owned (ASSESSMENT_PACKAGES in @pbh/booking), because they are the promise the charge is made against."
    }
  ]
};

// tina/blocks/scrollFillLogo.ts
var scrollFillLogoBlock = {
  name: "scrollFillLogo",
  label: "Scroll Fill Logo",
  ui: {
    defaultItem: {
      slides: [
        {
          label: "Trust the instinct that brought you here",
          headline: "We help you understand how your brain is performing, reduce your risk of cognitive decline, and take action early through advanced assessment, clinical insight, and ongoing personalized care."
        },
        {
          label: "Why Primary Brain Health?",
          headline: "Brain health today is reactive, fragmented, and often imprecise. PBH is built for what comes next."
        }
      ]
    },
    itemProps: (item) => ({
      label: `Scroll Fill Logo - ${item?.slides?.[0]?.headline?.slice(0, 40) || "Untitled"}`
    })
  },
  fields: [
    {
      name: "slides",
      label: "Slides",
      type: "object",
      list: true,
      description: "Each slide fades in and out as the section is scrolled. Add as many as you want \u2014 they're divided evenly across the scroll.",
      ui: {
        itemProps: (item) => ({
          label: item?.label || item?.headline?.slice(0, 50) || "Slide"
        }),
        defaultItem: {
          label: "",
          headline: ""
        }
      },
      fields: [
        {
          name: "label",
          label: "Eyebrow Label",
          type: "string",
          description: "Rendered uppercase in the design."
        },
        {
          name: "headline",
          label: "Headline",
          type: "string",
          ui: {
            component: "textarea"
          }
        }
      ]
    }
  ]
};

// tina/fields/IconPicker.tsx
import { useMemo, useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { wrapFieldsWithMeta } from "tinacms";
import { jsx, jsxs } from "react/jsx-runtime";
var Icons = PhosphorIcons;
var ALL_ICON_NAMES = Object.keys(Icons).filter(
  (name) => /^[A-Z]/.test(name) && !name.endsWith("Icon") && name !== "IconContext"
).sort();
var MAX_RESULTS = 240;
function IconPickerInner({ input }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const value = input.value || "";
  const Selected = value ? Icons[value] : null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICON_NAMES.slice(0, MAX_RESULTS);
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(
      0,
      MAX_RESULTS
    );
  }, [query]);
  return jsxs("div", { style: { width: "100%" }, children: [
    jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "8px 10px",
          border: "1px solid var(--tina-color-grey-3, #d4d4d8)",
          borderRadius: 6,
          background: "white",
          cursor: "pointer",
          fontSize: 14
        },
        children: [
          jsx(
            "span",
            {
              style: {
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f4f4f5",
                borderRadius: 4,
                color: "#1f2937"
              },
              children: Selected ? jsx(Selected, { size: 20, weight: "regular" }) : null
            }
          ),
          jsx(
            "span",
            {
              style: {
                flex: 1,
                textAlign: "left",
                color: value ? "#111827" : "#9ca3af",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 13
              },
              children: value || "Select an icon"
            }
          ),
          jsx("span", { style: { color: "#9ca3af", fontSize: 12 }, children: open ? "\u25B2" : "\u25BC" })
        ]
      }
    ),
    open && jsxs(
      "div",
      {
        style: {
          marginTop: 8,
          padding: 10,
          border: "1px solid var(--tina-color-grey-3, #d4d4d8)",
          borderRadius: 6,
          background: "white"
        },
        children: [
          jsxs(
            "div",
            {
              style: {
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 10
              },
              children: [
                jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: "Search Phosphor icons\u2026",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    autoFocus: true,
                    style: {
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #d4d4d8",
                      borderRadius: 4,
                      fontSize: 13,
                      outline: "none"
                    }
                  }
                ),
                value && jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      input.onChange("");
                    },
                    style: {
                      padding: "6px 10px",
                      border: "1px solid #d4d4d8",
                      borderRadius: 4,
                      background: "white",
                      fontSize: 12,
                      color: "#6b7280",
                      cursor: "pointer"
                    },
                    children: "Clear"
                  }
                )
              ]
            }
          ),
          jsx(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
                gap: 4,
                maxHeight: 320,
                overflowY: "auto",
                padding: 2
              },
              children: filtered.map((name) => {
                const Icon = Icons[name];
                if (!Icon) return null;
                const isSelected = value === name;
                return jsx(
                  "button",
                  {
                    type: "button",
                    title: name,
                    onClick: () => {
                      input.onChange(name);
                      setOpen(false);
                      setQuery("");
                    },
                    style: {
                      aspectRatio: "1 / 1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${isSelected ? "#2563eb" : "transparent"}`,
                      background: isSelected ? "#eff6ff" : "transparent",
                      borderRadius: 4,
                      cursor: "pointer",
                      color: "#1f2937",
                      transition: "background 80ms"
                    },
                    onMouseEnter: (e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f4f4f5";
                    },
                    onMouseLeave: (e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    },
                    children: jsx(Icon, { size: 20, weight: "regular" })
                  },
                  name
                );
              })
            }
          ),
          filtered.length === MAX_RESULTS && !query && jsxs(
            "p",
            {
              style: {
                marginTop: 8,
                fontSize: 11,
                color: "#9ca3af",
                textAlign: "center"
              },
              children: [
                "Showing first ",
                MAX_RESULTS,
                " of ",
                ALL_ICON_NAMES.length,
                " icons \u2014 search to find more."
              ]
            }
          ),
          filtered.length === 0 && jsxs(
            "p",
            {
              style: {
                marginTop: 8,
                fontSize: 12,
                color: "#9ca3af",
                textAlign: "center"
              },
              children: [
                'No icons match "',
                query,
                '".'
              ]
            }
          )
        ]
      }
    )
  ] });
}
var IconPicker = wrapFieldsWithMeta(IconPickerInner);

// tina/blocks/stackSections.ts
var stackSectionsBlock = {
  name: "stackSections",
  label: "Stack Sections",
  ui: {
    defaultItem: {
      headline: "How It Works",
      subheadline: "Move at your own pace, with expert guidance when you want it.",
      items: [
        {
          title: "Brain Health Assessment",
          body: "Evaluate your cognitive function, risk factors, and overall brain health using advanced digital tools and clinical expertise.",
          icon: "clipboard",
          image: "/images/woman.png"
        }
      ]
    },
    itemProps: (item) => ({
      label: `Stack - ${item?.headline || "Untitled"}`
    })
  },
  fields: [
    {
      name: "label",
      label: "Eyebrow Label",
      type: "string",
      description: "Small uppercase label above the headline"
    },
    {
      name: "headline",
      label: "Section Headline",
      type: "string"
    },
    {
      name: "subheadline",
      label: "Section Subheadline",
      type: "string",
      ui: { component: "textarea" }
    },
    {
      name: "items",
      label: "Stack Items",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Stack Item"
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
          name: "body",
          label: "Body",
          type: "string",
          ui: { component: "textarea" }
        },
        {
          name: "icon",
          label: "Icon",
          type: "string",
          description: "Pick a Phosphor icon.",
          ui: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: IconPicker
          }
        },
        {
          name: "image",
          label: "Image",
          type: "image"
        }
      ]
    }
  ]
};

// tina/blocks/benefitsList.ts
var benefitsListBlock = {
  name: "benefitsList",
  label: "Benefits List (split layout)",
  ui: {
    defaultItem: {
      headline: "What You Gain",
      subheadline: "Clarity. Control. Confidence. Now and over time.",
      items: []
    },
    itemProps: (item) => ({
      label: `Benefits - ${item?.headline || "Untitled"}`
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
      ui: { component: "textarea" }
    },
    {
      name: "items",
      label: "Benefits",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || "Benefit"
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
          name: "body",
          label: "Body",
          type: "string",
          ui: { component: "textarea" }
        },
        {
          name: "icon",
          label: "Icon",
          type: "string",
          description: "Pick a Phosphor icon.",
          ui: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: IconPicker
          }
        }
      ]
    }
  ]
};

// tina/blocks/contactForm.ts
var contactFormBlock = {
  name: "contactForm",
  label: "Contact Form",
  ui: {
    defaultItem: {
      headline: "Let's get in touch",
      subheadline: "Have a question for our team? Fill out the form and we'll get back to you within one business day.",
      buttonText: "Send Message"
    },
    itemProps: (item) => ({
      label: `Contact Form - ${item?.headline?.slice(0, 40) || "Untitled"}`
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
      ui: { component: "textarea" }
    },
    {
      name: "buttonText",
      label: "Submit Button Text",
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
        faqBlock,
        intakeFormBlock,
        scrollFillLogoBlock,
        stackSectionsBlock,
        benefitsListBlock,
        contactFormBlock
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
  match: {
    exclude: "ctas/**"
  },
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

// tina/collections/faq.ts
var faqCollection = {
  name: "faq",
  label: "FAQs",
  path: "content/faqs",
  format: "json",
  fields: [
    {
      name: "question",
      label: "Question",
      type: "string",
      required: true,
      isTitle: true
    },
    {
      name: "answer",
      label: "Answer",
      type: "string",
      required: true,
      ui: {
        component: "textarea"
      }
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      description: "Optional category for grouping/filters"
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
      description: "Lower numbers appear first. FAQs without a sort order fall back to alphabetical by filename."
    }
  ]
};

// tina/fields/no-clinical-vocabulary.ts
import { findBannedTerms } from "@pbh/copy";
function noClinicalVocabulary(value) {
  return check(typeof value === "string" ? value : "");
}
function check(text) {
  if (text.trim() === "") {
    return void 0;
  }
  const hits = findBannedTerms(text, "modal");
  if (hits.length === 0) {
    return void 0;
  }
  const words = [...new Set(hits.map((hit) => hit.match))].join(", ");
  return `Clinical wording isn\u2019t allowed on this screen \u2014 such as: ${words}. The booking modal sells a wellness assessment and a results review, not a consultation, diagnosis or treatment, and not care from a specialist, physician, clinician or neurologist. Reword the line and save again.`;
}

// src/lib/rich-text.ts
function richTextToPlainText(value) {
  const collected = [];
  const walk = (node) => {
    if (typeof node === "string") {
      collected.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") {
      return;
    }
    const record = node;
    for (const key of ["text", "value", "alt", "title"]) {
      if (typeof record[key] === "string") {
        collected.push(record[key]);
      }
    }
    walk(record.children);
  };
  walk(value);
  return collected.join(" ");
}
function hasRichTextContent(value) {
  return richTextToPlainText(value).trim() !== "";
}

// tina/fields/consent-terms-version.ts
function consentTermsVersion(value, allValues) {
  const version = typeof value === "string" ? value.trim() : "";
  if (version === "") {
    return hasRichTextContent(allValues?.terms) ? "Set a version whenever the consent terms are written here, e.g. 2026-08-13. It is recorded against every customer who accepts these terms, and those records can't be corrected later." : void 0;
  }
  if (/\s/.test(version)) {
    return "Use a single token with no spaces, e.g. 2026-08-13 \u2014 this is an identifier stored on consent records, not a description.";
  }
  if (version.length > 40) {
    return "Keep the version under 40 characters.";
  }
  return void 0;
}

// tina/collections/modals.ts
var HEADER_FIELDS = [
  {
    name: "step",
    label: "Step",
    type: "string",
    required: true,
    // Both the label and the sort order in the collection list — Tina sorts
    // by the `isTitle` field, so numbering these gives flow order instead of
    // alphabetical (confirm, consent, details, payment).
    isTitle: true,
    description: "How this step is listed here, e.g. \u201C3 \xB7 Consent\u201D. Never shown to a customer."
  },
  {
    name: "title",
    label: "Title",
    type: "string",
    description: "The big heading at the top of this step. Leave empty to keep the wording that ships in code \u2014 the preview beside this form shows you what that is. It may not use clinical words (consultation, diagnosis, treatment, specialist, physician, clinician, neurologist, prescription): this is a wellness assessment, and saving is blocked if it does.",
    ui: { validate: noClinicalVocabulary }
  },
  {
    name: "subtitle",
    label: "Subtitle",
    type: "string",
    description: "The line under the heading. Leave empty for the code wording, or for no subtitle at all where the step ships without one.",
    ui: { component: "textarea", validate: noClinicalVocabulary }
  }
];
var modalsCollection = {
  name: "modal",
  label: "Modals",
  path: "content/modals",
  format: "json",
  ui: {
    // `_sys.filename` IS the step id, so this needs no lookup table. Tina's
    // admin renders the route in an iframe beside the form.
    router: ({ document }) => `/internal/modals/${document._sys.filename}`,
    // Four steps, fixed. A fifth document would have no step to title and no
    // route to open; a missing one would break the flow it names.
    allowedActions: {
      create: false,
      delete: false,
      createFolder: false,
      createNestedFolder: false
    },
    // A rename would silently break both the router and the runtime lookup,
    // which key off the filename.
    filename: { readonly: true }
    // Deliberately not `global: true`: a global form is skipped when Tina picks
    // the active form, and this document's form being the active one is the
    // entire point.
  },
  templates: [
    {
      name: "step",
      label: "Step",
      fields: HEADER_FIELDS
    },
    {
      name: "consentStep",
      label: "Consent step",
      fields: [
        ...HEADER_FIELDS,
        {
          name: "terms",
          label: "Consent terms",
          type: "rich-text",
          description: "The agreement shown in the scrolling box on this step, which a customer must accept before paying. Markdown: headings, bold, lists and links. Leave it empty and the terms that ship in code are shown instead."
          // No banned-terms guard here, unlike the headings above. Legal text
          // needs the clinical words precisely to disclaim them — "this is not
          // medical treatment", "we do not provide a diagnosis" — which is the
          // same reason banned-terms.ts carves out the bare word "medical".
        },
        {
          name: "termsVersion",
          label: "Consent terms version",
          type: "string",
          description: "Stamped on every consent record as proof of WHICH terms that customer agreed to, so change it whenever you change the terms above \u2014 a date like 2026-08-13 is ideal. Leave it empty and consents are recorded against the version that ships in code. Existing records are never rewritten.",
          ui: { validate: consentTermsVersion }
        }
      ]
    }
  ]
};

// tina/config.ts
var branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
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
      modalsCollection,
      postCollection,
      authorCollection,
      globalCtaCollection,
      settingsCollection,
      faqCollection
    ]
  }
});
export {
  config_default as default
};

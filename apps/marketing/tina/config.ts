import { defineConfig } from "tinacms";
import { pageCollection } from "./collections/page";
import { postCollection } from "./collections/post";
import { projectCollection } from "./collections/project";
import { authorCollection } from "./collections/author";
import { testimonialCollection } from "./collections/testimonial";
import { globalCtaCollection } from "./collections/globalCta";
import { settingsCollection } from "./collections/settings";
import { faqCollection } from "./collections/faq";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

export default defineConfig({
  branch,

  // Get this from tina.io (optional for local development)
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
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
      settingsCollection,
      faqCollection,
    ],
  },
});

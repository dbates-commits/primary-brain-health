import { defineConfig } from "tinacms";
import { pageCollection } from "./collections/page";
import { postCollection } from "./collections/post";
import { projectCollection } from "./collections/project";
import { authorCollection } from "./collections/author";
import { testimonialCollection } from "./collections/testimonial";
import { globalCtaCollection } from "./collections/globalCta";
import { settingsCollection } from "./collections/settings";
import { faqCollection } from "./collections/faq";

// Which branch TinaCloud reads/indexes content from. Feature branches are not
// indexed on TinaCloud, so deploys (incl. Vercel previews) default to the
// indexed "main" branch. Override per-environment with NEXT_PUBLIC_TINA_BRANCH
// once a branch has been indexed on TinaCloud.
const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";

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

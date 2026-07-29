import type { MetadataRoute } from "next";

// Funnel is in development — keep the whole app out of search indexes.
// Complements the meta `robots: { index: false }` in layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}

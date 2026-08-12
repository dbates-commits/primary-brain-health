import type { MetadataRoute } from "next";

const BASE_URL = "https://primarybrainhealth.com";

/**
 * The site is public, but the post-booking surface isn't: `/login`, `/welcome`
 * and the internal email previews are per-customer or staff-only pages with no
 * business in an index. Each of those routes also sets `robots: { index: false }`
 * in its own metadata — this is the crawl-level half of the same statement.
 *
 * `/booking/confirm` carries a single-use token in the URL; keeping crawlers off
 * it means a shared or leaked link can't be burned by a bot.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/welcome", "/internal/", "/booking/confirm", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

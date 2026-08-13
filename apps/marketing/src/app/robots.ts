import type { MetadataRoute } from "next";

const BASE_URL = "https://primarybrainhealth.com";

/**
 * Only the production deployment invites crawlers.
 *
 * Staging (`staging.primarybrainhealth.com`) and every PR preview build in the
 * Preview scope, so they serve a blanket disallow: they are the same site with
 * the same copy, and letting Google index them costs the real domain ranking to
 * a duplicate — quite apart from the pre-launch content being visible in search.
 * `next.config.ts` adds an `X-Robots-Tag: noindex` header on those deployments
 * too, which is what covers a crawler that reaches a URL without reading
 * robots.txt first.
 */
const isProduction = process.env.VERCEL_ENV === "production";

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
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/welcome", "/internal/", "/booking/confirm", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

/**
 * Production is the only deployment search engines may index. Staging and every
 * PR preview serve the same copy from a different host, so an indexed one is a
 * duplicate competing with the real domain — and shows pre-launch content in
 * search results.
 *
 * `robots.ts` disallows crawling on those deployments; this header is the part
 * that still works when a crawler reaches a URL without reading robots.txt, and
 * it is what actually removes a page that has already been indexed.
 */
const isProduction = process.env.VERCEL_ENV === "production";

const nextConfig: NextConfig = {
  /**
   * `/booking/confirm` was the magic link's landing route, deleted with the
   * rest of the magic link. Links to it were mailed for as long as 24 hours
   * before the deploy that removed it, and they keep arriving after — so the
   * route answers with the resume marker instead of a 404, which puts the
   * customer back in the modal at whatever step they had reached.
   *
   * Temporary, not permanent: the URL is gone rather than moved, and a 308
   * would be cached in the browsers of the people it is here to rescue.
   */
  async redirects() {
    return [
      {
        source: "/booking/confirm",
        destination: "/?booking=resume#booking",
        permanent: false,
      },
    ];
  },

  async headers() {
    if (isProduction) {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Workspace packages ship raw TS/TSX; Next transpiles them on demand.
  transpilePackages: [
    "@pbh/booking",
    "@pbh/ui",
    "@pbh/tokens",
    "@pbh/emails",
    "@pbh/db",
    "@pbh/payments",
    "@pbh/linus",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

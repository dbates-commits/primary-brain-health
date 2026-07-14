import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS/TSX; Next transpiles them on demand.
  transpilePackages: [
    "@pbh/booking",
    "@pbh/ui",
    "@pbh/tokens",
    "@pbh/types",
    "@pbh/db",
    "@pbh/payments",
    "@pbh/linus",
  ],
  // Funnel is in development — keep every response (incl. non-HTML) out of
  // search indexes, alongside the meta tag and robots.ts.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

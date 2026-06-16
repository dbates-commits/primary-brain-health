import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS/TSX; Next transpiles them on demand.
  transpilePackages: ["@pbh/ui", "@pbh/tokens", "@pbh/types"],
};

export default nextConfig;

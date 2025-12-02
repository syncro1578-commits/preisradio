import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of Turbopack to avoid dependency tracking issues
  experimental: {
    turbo: false,
  },
};

export default nextConfig;

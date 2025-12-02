import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled reactCompiler due to Turbopack dependency tracking issues
  // reactCompiler: true,
};

export default nextConfig;

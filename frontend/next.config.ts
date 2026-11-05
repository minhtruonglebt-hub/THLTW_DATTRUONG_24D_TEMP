import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the preview build isolated from any existing Next.js process.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;

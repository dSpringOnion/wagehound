import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // PWA configuration will be added later when next-pwa import is fixed
};

export default nextConfig;

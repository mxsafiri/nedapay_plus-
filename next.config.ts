import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Node.js 22
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
  },
  // Optimize server components (moved from experimental)
  serverExternalPackages: ['@supabase/supabase-js'],
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

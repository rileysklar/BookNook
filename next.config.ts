import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Middleware handles redirects more effectively
  
  // Fix the workspace root warning by explicitly setting the output file tracing root
  outputFileTracingRoot: __dirname,
  
  // Configure image domains for external image sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

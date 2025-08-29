import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Middleware handles redirects more effectively
  
  // Fix the workspace root warning by explicitly setting the output file tracing root
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

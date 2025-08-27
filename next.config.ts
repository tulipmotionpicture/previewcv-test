import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle canvas dependency for react-pdf
    config.resolve.alias.canvas = false;
    
    // Handle pdfjs-dist worker
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent bundling of 'fs' module on client side
      fs: false,
    };
    
    return config;
  },
  
  // Set proper turbopack root to avoid multiple lockfiles warning
  turbopack: {
    root: '.',
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "letsmakecv.b-cdn.net",
        port: "",
        pathname: "/**",
      },
    ],
  },

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
    root: ".",
  },
};

export default nextConfig;

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
      {
        protocol: "https",
        hostname: "img.icons8.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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

  async headers() {
    return [
      {
        source: "/sso/(.*)",
        headers: [
          // ALLOW previewcv origins to embed (assuming this is previewcv, we allow letsmakecv to embed)
          // Actually, the guide says: Replace previewcv.com with letsmakecv.com on the previewcv app.
          { key: "Content-Security-Policy",
            value: "frame-ancestors https://letsmakecv.com https://www.letsmakecv.com http://localhost:3000 http://localhost:3001;" },
          // Remove any default X-Frame-Options on this route
          { key: "X-Frame-Options", value: "" },
        ],
      },
    ];
  },
};

export default nextConfig;

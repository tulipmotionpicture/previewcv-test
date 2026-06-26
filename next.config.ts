import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure external image domains
  images: {
    // On Cloudflare Workers the /_next/image optimizer runs per-request and its
    // responses are NOT edge-cached (verified: no cf-cache-status, ~0.5-3s each),
    // so the homepage's many images load slowly. Serve images unoptimized instead:
    // local /public files go through the edge-cached ASSETS binding and remote images
    // load straight from BunnyCDN — both fast + cached, no Worker hop.
    unoptimized: true,
    minimumCacheTTL: 2678400, // (moot while unoptimized; harmless)
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
          // This is previewcv: allow letsmakecv (the peer) to embed our /sso/* pages.
          { key: "Content-Security-Policy",
            value: "frame-ancestors https://letsmakecv.com https://www.letsmakecv.com http://localhost:3000;" },
          // Remove any default X-Frame-Options on this route
          { key: "X-Frame-Options", value: "" },
        ],
      },
    ];
  },
};

export default nextConfig;

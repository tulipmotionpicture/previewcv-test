import type { MetadataRoute } from "next";
import config from "@/config";

// Points crawlers at the dynamic jobs sitemap so Google can discover job pages.
export default function robots(): MetadataRoute.Robots {
  const base = config.app.siteUrl;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}

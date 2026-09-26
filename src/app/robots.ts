import type { MetadataRoute } from "next";
import config from "@/config";

// Allow all public pages; keep auth-gated and private areas out of the index. Note the
// public recruiter profile (/recruiter/{username}) stays crawlable — only the private
// /recruiter/* sub-areas (dashboard, login, signup, auth flows, billing) are disallowed.
export default function robots(): MetadataRoute.Robots {
  const base = config.app.siteUrl;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/candidate/",
        "/recruiter/dashboard",
        "/recruiter/login",
        "/recruiter/signup",
        "/recruiter/auth/",
        "/recruiter/confirm-password",
        "/recruiter/password-reset",
        "/recruiter/billing/",
        "/auth/",
        // /sso/ is deliberately NOT disallowed: its pages carry noindex, and Google can
        // only see that if it may crawl them. While blocked, /sso/receive?sso=anon stayed
        // in the index ("Indexed, though blocked by robots.txt") and drew search clicks.
        "/resume/",
        "/api/",
      ],
    },
    // The master index references the static, job-shard, and blog-shard sitemaps.
    sitemap: base ? `${base}/sitemap-index.xml` : undefined,
  };
}

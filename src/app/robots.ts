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
        "/sso/",
        "/resume/",
        "/api/",
      ],
    },
    sitemap: base
      ? [
          `${base}/sitemap.xml`,
          `${base}/jobs/sitemap.xml`,
          `${base}/blog/sitemap.xml`,
        ]
      : undefined,
  };
}

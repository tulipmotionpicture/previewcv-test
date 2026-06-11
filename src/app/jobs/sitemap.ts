import type { MetadataRoute } from "next";
import config from "@/config";
import { sweepJobs } from "@/lib/sitemapSources";

// Dedicated job-postings sitemap → /jobs/sitemap.xml
//
// Kept separate from the rest of the site so Google can discover and recrawl short-lived
// job pages quickly, and so job-URL indexing can be monitored independently in Search
// Console. This is a plain sitemap of /job/{slug} URLs — the JobPosting structured data
// lives on each page (see jobPostingSchema.ts), not here. Closed/expired jobs are skipped.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  try {
    const { jobs } = await sweepJobs(base);
    return jobs;
  } catch (error) {
    console.error("Failed to build jobs sitemap", error);
    return [];
  }
}

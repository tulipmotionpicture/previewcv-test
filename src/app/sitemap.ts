import type { MetadataRoute } from "next";
import config from "@/config";
import {
  staticEntries,
  sweepJobs,
  recruiterEntries,
} from "@/lib/sitemapSources";

// Root sitemap → /sitemap.xml — static public pages + recruiter/company profiles.
//
// Jobs and blog content have their own dedicated sitemaps (/jobs/sitemap.xml,
// /blog/sitemap.xml) so each content type can be discovered and monitored independently.
// All three are listed in robots.ts. Recruiter usernames are derived from the jobs sweep.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const entries: MetadataRoute.Sitemap = [...staticEntries(base)];

  try {
    const { recruiters } = await sweepJobs(base);
    entries.push(...recruiterEntries(base, recruiters));
  } catch (error) {
    console.error("Failed to build recruiter sitemap entries", error);
  }

  return entries;
}

import type { MetadataRoute } from "next";
import config from "@/config";
import { staticEntries, getRecruiterEntries } from "@/lib/sitemapSources";

// Root sitemap → /sitemap.xml — static public pages + recruiter/company profiles.
// Jobs and blog content live in their own sharded sitemaps; the master index
// (/sitemap-index.xml) ties everything together. Small and never near the 50k limit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const entries: MetadataRoute.Sitemap = [...staticEntries(base)];

  try {
    entries.push(...(await getRecruiterEntries(base)));
  } catch (error) {
    console.error("Failed to build recruiter sitemap entries", error);
  }

  return entries;
}

import type { MetadataRoute } from "next";
import config from "@/config";
import { staticEntries, getRecruiterEntries } from "@/lib/sitemapSources";

// Root sitemap → /sitemap.xml — static public pages + recruiter/company profiles.
// Jobs and blog content live in their own sharded sitemaps; the master index
// (/sitemap-index.xml) ties everything together. Small and never near the 50k limit.
// Regenerated on every request. These previously used `export const revalidate = 3600`,
// whose output is stored in KV on Cloudflare and survives deploys; that entry stopped
// revalidating and pinned the sitemap to an old snapshot — it advertised 7 URLs while the
// API had ~20, so three live job pages and both recruiter profiles were never declared to
// Google. A sitemap is only fetched by crawlers, so regenerating it per request costs a
// couple of API calls and is worth the guaranteed accuracy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

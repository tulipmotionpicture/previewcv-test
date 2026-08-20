import type { MetadataRoute } from "next";
import config from "@/config";
import {
  getJobTotal,
  shardCount,
  getJobShardEntries,
} from "@/lib/sitemapSources";

// Dedicated, sharded job-postings sitemap → /jobs/sitemap/[id].xml
//
// Each shard holds up to SHARD_SIZE job URLs, staying under Google's 50k-per-file limit.
// The shard count grows automatically with the number of jobs; the master index
// (/sitemap-index.xml) lists the shards. JobPosting structured data lives on each job page,
// not here. Closed/expired jobs are skipped.
// Regenerated on every request. These previously used `export const revalidate = 3600`,
// whose output is stored in KV on Cloudflare and survives deploys; that entry stopped
// revalidating and pinned the sitemap to an old snapshot — it advertised 7 URLs while the
// API had ~20, so three live job pages and both recruiter profiles were never declared to
// Google. A sitemap is only fetched by crawlers, so regenerating it per request costs a
// couple of API calls and is worth the guaranteed accuracy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  if (!config.app.siteUrl) return [{ id: 0 }];
  try {
    const total = await getJobTotal();
    return Array.from({ length: shardCount(total) }, (_, id) => ({ id }));
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];
  // Next passes `id` as a string; coerce so the shard offset math is numeric.
  const shardId = Number(id);
  try {
    return await getJobShardEntries(base, shardId);
  } catch (error) {
    console.error(`Failed to build jobs sitemap shard ${shardId}`, error);
    return [];
  }
}

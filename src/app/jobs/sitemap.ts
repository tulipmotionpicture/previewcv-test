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
export const revalidate = 3600;

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
  try {
    return await getJobShardEntries(base, id);
  } catch (error) {
    console.error(`Failed to build jobs sitemap shard ${id}`, error);
    return [];
  }
}

import type { MetadataRoute } from "next";
import config from "@/config";
import {
  getBlogTotal,
  shardCount,
  getBlogShardEntries,
} from "@/lib/sitemapSources";

// Dedicated, sharded blog sitemap → /blog/sitemap/[id].xml (articles + category pages).
// Sharded the same way as jobs so it scales past the 50k-per-file limit.
export const revalidate = 3600;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  if (!config.app.siteUrl) return [{ id: 0 }];
  try {
    const total = await getBlogTotal();
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
    return await getBlogShardEntries(base, id);
  } catch (error) {
    console.error(`Failed to build blog sitemap shard ${id}`, error);
    return [];
  }
}

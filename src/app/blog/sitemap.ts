import type { MetadataRoute } from "next";
import config from "@/config";
import { blogEntries, blogCategoryEntries } from "@/lib/sitemapSources";

// Dedicated blog sitemap → /blog/sitemap.xml (articles + category landing pages).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const [posts, categories] = await Promise.allSettled([
    blogEntries(base),
    blogCategoryEntries(base),
  ]);

  const entries: MetadataRoute.Sitemap = [];
  if (posts.status === "fulfilled") entries.push(...posts.value);
  else console.error("Failed to build blog sitemap", posts.reason);
  if (categories.status === "fulfilled") entries.push(...categories.value);
  else console.error("Failed to build blog category sitemap", categories.reason);

  return entries;
}

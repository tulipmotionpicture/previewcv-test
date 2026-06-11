import type { MetadataRoute } from "next";
import config from "@/config";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { BlogPost } from "@/types";
import { isJobClosed } from "@/lib/jobPostingSchema";

// Refresh the sitemap hourly so newly posted jobs/articles are discoverable quickly.
export const revalidate = 3600;

const JOB_PAGE_SIZE = 100;
const MAX_JOB_PAGES = 50; // hard cap → at most 5,000 jobs
const BLOG_PAGE_SIZE = 50;
const MAX_BLOG_PAGES = 40; // hard cap → at most 2,000 posts

/** Public job detail pages (`/job/{slug}`), skipping closed/expired jobs. */
async function jobEntries(base: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 0; page < MAX_JOB_PAGES; page++) {
    const params = new URLSearchParams({
      limit: String(JOB_PAGE_SIZE),
      offset: String(page * JOB_PAGE_SIZE),
    });
    const response = await api.getJobs(params);
    const jobs: Job[] = response.items || response.jobs || response.data || [];
    if (jobs.length === 0) break;

    for (const job of jobs) {
      if (!job.slug || isJobClosed(job)) continue;
      entries.push({
        url: `${base}/job/${job.slug}`,
        lastModified: job.updated_at ? new Date(job.updated_at) : undefined,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const loaded = (page + 1) * JOB_PAGE_SIZE;
    if (loaded >= (response.total || 0) || jobs.length < JOB_PAGE_SIZE) break;
  }
  return entries;
}

/** Published blog articles (`/blog/{slug}`) — picked up automatically as new posts ship. */
async function blogEntries(base: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_BLOG_PAGES; page++) {
    const response = await api.getBlogPosts({
      page,
      limit: BLOG_PAGE_SIZE,
      sort_by: "published_at",
      sort_order: "desc",
    });
    const posts: BlogPost[] = response.posts || [];
    if (posts.length === 0) break;

    for (const post of posts) {
      if (!post.slug) continue;
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.published_at
          ? new Date(post.published_at)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    if (!response.has_next || page >= (response.total_pages || 1)) break;
  }
  return entries;
}

/** Blog category landing pages (`/blog/category/{slug}`). */
async function blogCategoryEntries(base: string): Promise<MetadataRoute.Sitemap> {
  const res = await api.getBlogCategories();
  return (res.categories || [])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${base}/blog/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
}

/**
 * Dynamic sitemap. Google restricts the Indexing API for general aggregators, so a fast,
 * fresh sitemap is the recommended way to get new job postings and articles crawled.
 * Each source is fetched independently so one failing API never blanks the whole sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.7 },
  ];

  const sources = await Promise.allSettled([
    jobEntries(base),
    blogEntries(base),
    blogCategoryEntries(base),
  ]);

  const dynamicEntries = sources.flatMap((result, i) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`Failed to build sitemap source #${i}`, result.reason);
    return [];
  });

  return [...staticEntries, ...dynamicEntries];
}

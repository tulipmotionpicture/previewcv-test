import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { BlogPost, BlogCategory } from "@/types";
import { isJobClosed } from "@/lib/jobPostingSchema";

// Sitemap source builders, sharded so the site scales past Google's hard 50,000-URL / 50MB
// per-file limit. Jobs and blog posts are split into child sitemaps of SHARD_SIZE URLs each
// (kept under 50k with headroom); a master index (/sitemap-index.xml) references them.
//
// We emit accurate `lastModified` only — Google ignores `changefreq`/`priority`.

// URLs per child sitemap. 45k leaves headroom under the 50k hard cap for safety.
export const SHARD_SIZE = 45000;
// Page sizes requested from the paginated list APIs. The jobs API accepts up to 100; the
// blog API caps `limit` at 50 (returns HTTP 422 above that), so they must differ.
const JOB_API_PAGE = 100;
const BLOG_API_PAGE = 50;
// Pages that make up one blog shard (45000 / 50 = 900; integer by construction).
const BLOG_PAGES_PER_SHARD = SHARD_SIZE / BLOG_API_PAGE;

export const STATIC_PUBLIC_PATHS = [
  "/",
  "/jobs",
  "/blog",
  "/about",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
];

/** Number of shards needed for `total` items (always ≥ 1 so the first shard always exists). */
export function shardCount(total: number): number {
  return Math.max(1, Math.ceil(total / SHARD_SIZE));
}

// ---------------------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------------------

/** Total number of public jobs — one cheap request used to compute the shard count. */
export async function getJobTotal(): Promise<number> {
  const res = await api.getJobs(new URLSearchParams({ limit: "1", offset: "0" }));
  return res.total || 0;
}

/** Open-job entries for one shard: jobs in [shardId·SHARD_SIZE, +SHARD_SIZE). */
export async function getJobShardEntries(
  base: string,
  shardId: number,
): Promise<MetadataRoute.Sitemap> {
  const start = shardId * SHARD_SIZE;
  const end = start + SHARD_SIZE;
  const entries: MetadataRoute.Sitemap = [];

  let offset = start;
  while (offset < end) {
    const res = await api.getJobs(
      new URLSearchParams({ limit: String(JOB_API_PAGE), offset: String(offset) }),
    );
    const items: Job[] = res.items || res.jobs || res.data || [];
    if (items.length === 0) break;

    for (const job of items) {
      if (!job.slug || isJobClosed(job)) continue;
      entries.push({
        url: `${base}/job/${job.slug}`,
        lastModified: job.updated_at ? new Date(job.updated_at) : undefined,
      });
    }

    // Advance by the actual count returned (robust if the API caps the page size).
    offset += items.length;
    if (offset >= (res.total || 0)) break;
  }

  return entries;
}

/** Public recruiter/company profile pages, derived from a full jobs sweep. */
export async function getRecruiterEntries(
  base: string,
): Promise<MetadataRoute.Sitemap> {
  const recruiters = new Set<string>();
  const total = await getJobTotal();

  let offset = 0;
  while (offset < total || offset === 0) {
    const res = await api.getJobs(
      new URLSearchParams({ limit: String(JOB_API_PAGE), offset: String(offset) }),
    );
    const items: Job[] = res.items || res.jobs || res.data || [];
    if (items.length === 0) break;
    for (const job of items) {
      if (job.recruiter_username) recruiters.add(job.recruiter_username);
    }
    offset += items.length;
    if (offset >= (res.total || 0)) break;
  }

  return Array.from(recruiters).map((username) => ({
    url: `${base}/recruiter/${username}`,
  }));
}

// ---------------------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------------------

/** Total number of published blog posts — used to compute the blog shard count. */
export async function getBlogTotal(): Promise<number> {
  const res = await api.getBlogPosts({ page: 1, limit: 1 });
  return res.total || 0;
}

/** Blog category landing pages (`/blog/category/{slug}`). */
export async function blogCategoryEntries(
  base: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    // The categories endpoint returns a bare array; tolerate a { categories } wrapper too.
    const res = (await api.getBlogCategories()) as unknown;
    const list: BlogCategory[] = Array.isArray(res)
      ? (res as BlogCategory[])
      : ((res as { categories?: BlogCategory[] })?.categories ?? []);
    return list
      .filter((c) => c.slug && (c.post_count ?? 0) > 0) // skip empty (thin) category pages
      .map((c) => ({ url: `${base}/blog/category/${c.slug}` }));
  } catch {
    return [];
  }
}

/**
 * Blog entries for one shard: posts on pages [shardId·PAGES_PER_SHARD + 1, …]. Shard 0 also
 * includes the (few) category landing pages.
 */
export async function getBlogShardEntries(
  base: string,
  shardId: number,
): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  if (shardId === 0) {
    entries.push(...(await blogCategoryEntries(base)));
  }

  const firstPage = shardId * BLOG_PAGES_PER_SHARD + 1;
  const lastPage = (shardId + 1) * BLOG_PAGES_PER_SHARD;

  for (let page = firstPage; page <= lastPage; page++) {
    const res = await api.getBlogPosts({
      page,
      limit: BLOG_API_PAGE,
      sort_by: "published_at",
      sort_order: "desc",
    });
    const posts: BlogPost[] = res.posts || [];
    if (posts.length === 0) break;

    for (const post of posts) {
      if (!post.slug) continue;
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.published_at
          ? new Date(post.published_at)
          : undefined,
      });
    }

    if (!res.has_next || page >= (res.total_pages || 1)) break;
  }

  return entries;
}

// ---------------------------------------------------------------------------------------
// Static
// ---------------------------------------------------------------------------------------

/** Static public marketing/legal pages. */
export function staticEntries(base: string): MetadataRoute.Sitemap {
  return STATIC_PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
  }));
}

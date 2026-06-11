import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { BlogPost } from "@/types";
import { isJobClosed } from "@/lib/jobPostingSchema";

// Shared builders for the site's sitemaps. Split across dedicated routes
// (/jobs/sitemap.xml, /blog/sitemap.xml, /sitemap.xml) so Google can discover and monitor
// each content type independently. We emit accurate `lastModified` only — Google ignores
// `changefreq` and `priority`, so we don't bother with them.

const JOB_PAGE_SIZE = 100;
const MAX_JOB_PAGES = 50; // hard cap → at most 5,000 jobs
const BLOG_PAGE_SIZE = 50;
const MAX_BLOG_PAGES = 40; // hard cap → at most 2,000 posts

// Static, fully public marketing/legal pages (everything NOT behind auth).
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

/**
 * Sweep the public jobs list once, returning open-job sitemap entries plus the unique
 * recruiter usernames seen (so the recruiter profile pages can be emitted without a second
 * sweep within the same route).
 */
export async function sweepJobs(
  base: string,
): Promise<{ jobs: MetadataRoute.Sitemap; recruiters: Set<string> }> {
  const jobs: MetadataRoute.Sitemap = [];
  const recruiters = new Set<string>();

  for (let page = 0; page < MAX_JOB_PAGES; page++) {
    const params = new URLSearchParams({
      limit: String(JOB_PAGE_SIZE),
      offset: String(page * JOB_PAGE_SIZE),
    });
    const response = await api.getJobs(params);
    const items: Job[] = response.items || response.jobs || response.data || [];
    if (items.length === 0) break;

    for (const job of items) {
      if (!job.slug || isJobClosed(job)) continue;
      jobs.push({
        url: `${base}/job/${job.slug}`,
        lastModified: job.updated_at ? new Date(job.updated_at) : undefined,
      });
      if (job.recruiter_username) recruiters.add(job.recruiter_username);
    }

    const loaded = (page + 1) * JOB_PAGE_SIZE;
    if (loaded >= (response.total || 0) || items.length < JOB_PAGE_SIZE) break;
  }

  return { jobs, recruiters };
}

/** Public recruiter/company profile pages (`/recruiter/{username}`). */
export function recruiterEntries(
  base: string,
  recruiters: Set<string>,
): MetadataRoute.Sitemap {
  return Array.from(recruiters).map((username) => ({
    url: `${base}/recruiter/${username}`,
  }));
}

/** Published blog articles (`/blog/{slug}`) — picked up automatically as new posts ship. */
export async function blogEntries(base: string): Promise<MetadataRoute.Sitemap> {
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
      });
    }

    if (!response.has_next || page >= (response.total_pages || 1)) break;
  }
  return entries;
}

/** Blog category landing pages (`/blog/category/{slug}`). */
export async function blogCategoryEntries(
  base: string,
): Promise<MetadataRoute.Sitemap> {
  const res = await api.getBlogCategories();
  return (res.categories || [])
    .filter((c) => c.slug)
    .map((c) => ({ url: `${base}/blog/category/${c.slug}` }));
}

/** Static public marketing/legal pages. */
export function staticEntries(base: string): MetadataRoute.Sitemap {
  return STATIC_PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
  }));
}

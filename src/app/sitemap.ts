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

// Static, fully public marketing/legal pages (everything NOT behind auth). Auth-gated areas
// — /candidate/*, /recruiter/{dashboard,login,signup,auth,...}, /auth/*, /sso/*, the private
// /resume/view/* token pages — are intentionally excluded (and disallowed in robots.ts).
const STATIC_PUBLIC_PATHS: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/jobs", priority: 0.9 },
  { path: "/blog", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/pricing", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

/**
 * Public job detail pages (`/job/{slug}`), skipping closed/expired jobs. Also collects the
 * unique recruiter usernames seen, so we can emit their public profile pages for free
 * without a second API sweep.
 */
async function jobEntries(
  base: string,
): Promise<{ entries: MetadataRoute.Sitemap; recruiters: Set<string> }> {
  const entries: MetadataRoute.Sitemap = [];
  const recruiters = new Set<string>();

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
      if (job.recruiter_username) recruiters.add(job.recruiter_username);
    }

    const loaded = (page + 1) * JOB_PAGE_SIZE;
    if (loaded >= (response.total || 0) || jobs.length < JOB_PAGE_SIZE) break;
  }

  return { entries, recruiters };
}

/** Public recruiter/company profile pages (`/recruiter/{username}`). */
function recruiterEntries(
  base: string,
  recruiters: Set<string>,
): MetadataRoute.Sitemap {
  return Array.from(recruiters).map((username) => ({
    url: `${base}/recruiter/${username}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
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
 * Dynamic sitemap covering every public page. Google restricts the Indexing API for general
 * aggregators, so a fast, fresh sitemap is the recommended way to get new job postings and
 * articles crawled. Each source is fetched independently (Promise.allSettled) so one failing
 * API never blanks the whole sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC_PATHS.map(
    ({ path, priority }) => ({
      url: path === "/" ? base : `${base}${path}`,
      changeFrequency: "daily",
      priority,
    }),
  );

  const [jobsResult, blogResult, categoryResult] = await Promise.allSettled([
    jobEntries(base),
    blogEntries(base),
    blogCategoryEntries(base),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  if (jobsResult.status === "fulfilled") {
    dynamicEntries.push(...jobsResult.value.entries);
    dynamicEntries.push(...recruiterEntries(base, jobsResult.value.recruiters));
  } else {
    console.error("Failed to build jobs sitemap", jobsResult.reason);
  }

  if (blogResult.status === "fulfilled") {
    dynamicEntries.push(...blogResult.value);
  } else {
    console.error("Failed to build blog sitemap", blogResult.reason);
  }

  if (categoryResult.status === "fulfilled") {
    dynamicEntries.push(...categoryResult.value);
  } else {
    console.error("Failed to build blog category sitemap", categoryResult.reason);
  }

  return [...staticEntries, ...dynamicEntries];
}

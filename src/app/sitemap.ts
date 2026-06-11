import type { MetadataRoute } from "next";
import config from "@/config";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { isJobClosed } from "@/lib/jobPostingSchema";

// Refresh the sitemap hourly so newly posted jobs are discoverable quickly.
export const revalidate = 3600;

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // hard cap → at most 5,000 jobs in the sitemap

/**
 * Dynamic sitemap listing public job detail pages (`/job/{slug}`).
 *
 * Google now restricts the Indexing API for general aggregators, so a fast, fresh sitemap
 * is the recommended way to get new postings crawled. We page through the public jobs
 * list and skip closed/expired jobs (those should drop out of the index anyway).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.app.siteUrl;
  if (!base) return [];

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
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

      const loaded = (page + 1) * PAGE_SIZE;
      if (loaded >= (response.total || 0) || jobs.length < PAGE_SIZE) break;
    }
  } catch (error) {
    console.error("Failed to build jobs sitemap", error);
  }

  return entries;
}

import config from "@/config";
import { getJobTotal, getBlogTotal, shardCount } from "@/lib/sitemapSources";

// Master sitemap index → /sitemap-index.xml
//
// This is the single URL to submit in Google Search Console / advertise in robots.txt.
// It references the static+recruiters sitemap plus every job and blog shard. The shard
// counts are recomputed on each (hourly) regeneration, so new shards are listed
// automatically as the job/blog volume grows past 50k-URL boundaries.
// Regenerated on every request. These previously used `export const revalidate = 3600`,
// whose output is stored in KV on Cloudflare and survives deploys; that entry stopped
// revalidating and pinned the sitemap to an old snapshot — it advertised 7 URLs while the
// API had ~20, so three live job pages and both recruiter profiles were never declared to
// Google. A sitemap is only fetched by crawlers, so regenerating it per request costs a
// couple of API calls and is worth the guaranteed accuracy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET(): Promise<Response> {
  const base = config.app.siteUrl;

  const locs: string[] = [];
  if (base) {
    locs.push(`${base}/sitemap.xml`);

    let jobShards = 1;
    let blogShards = 1;
    try {
      jobShards = shardCount(await getJobTotal());
    } catch {
      /* fall back to a single shard */
    }
    try {
      blogShards = shardCount(await getBlogTotal());
    } catch {
      /* fall back to a single shard */
    }

    for (let i = 0; i < jobShards; i++) locs.push(`${base}/jobs/sitemap/${i}.xml`);
    for (let i = 0; i < blogShards; i++) locs.push(`${base}/blog/sitemap/${i}.xml`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

import config from "@/config";
import { getJobTotal, getBlogTotal, shardCount } from "@/lib/sitemapSources";

// Master sitemap index → /sitemap-index.xml
//
// This is the single URL to submit in Google Search Console / advertise in robots.txt.
// It references the static+recruiters sitemap plus every job and blog shard. The shard
// counts are recomputed on each (hourly) regeneration, so new shards are listed
// automatically as the job/blog volume grows past 50k-URL boundaries.
export const revalidate = 3600;

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
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

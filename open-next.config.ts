import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// KV-backed incremental (ISR) cache for previewcv. Uses its OWN KV namespace —
// never shared with letsmakecv (cache keys collide on shared paths).
//
// withRegionalCache adds a per-data-center Cache API layer in front of KV, so
// repeat requests in a region serve the ISR entry locally instead of doing a
// cross-region KV read — meaningfully faster for global traffic. "long-lived"
// keeps ISR/SSG entries regionally for up to 30 min and refreshes lazily from KV.
//
// queue: without one OpenNext falls back to its "dummy" queue, whose send() throws, so
// a stale ISR entry was never regenerated — pages kept serving whatever they first
// rendered (renamed jobs, old counts, a not-found render from a backend blip) until the
// next deploy. memoryQueue revalidates by fetching the page from this same worker via
// the WORKER_SELF_REFERENCE service binding declared in wrangler.jsonc.
//
// tagCache: makes revalidatePath() work, so /api/revalidate (called by the backend after a
// job or company profile changes) refreshes those pages at once instead of after the ISR
// window. D1 rather than KV: it is consistent immediately, KV can lag up to 60s. Every
// cache read (regional hits included) checks it, so a revalidation applies in all regions.
// Without the NEXT_TAG_CACHE_D1 binding it switches itself off and pages fall back to
// time-based revalidation only.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
  tagCache: d1NextTagCache,
});

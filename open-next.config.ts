import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

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
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
});

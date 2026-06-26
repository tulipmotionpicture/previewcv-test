import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

// KV-backed incremental (ISR) cache for previewcv. Uses its OWN KV namespace —
// never shared with letsmakecv (cache keys collide on shared paths).
//
// withRegionalCache adds a per-data-center Cache API layer in front of KV, so
// repeat requests in a region serve the ISR entry locally instead of doing a
// cross-region KV read — meaningfully faster for global traffic. "long-lived"
// keeps ISR/SSG entries regionally for up to 30 min and refreshes lazily from KV.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
});

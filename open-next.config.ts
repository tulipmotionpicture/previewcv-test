import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// KV-backed incremental (ISR) cache for previewcv. Uses its OWN KV namespace —
// never shared with letsmakecv (cache keys collide on shared paths).
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});

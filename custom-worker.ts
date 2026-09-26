// Worker entrypoint (wrangler.jsonc "main"). Wraps the OpenNext-generated worker so the
// site's request handling is untouched, and adds the cron-triggered Google Indexing API
// notifier for job pages (see src/indexing/jobIndexing.ts).

// `.open-next/worker.js` only exists after `opennextjs-cloudflare build`, so the import is
// an error before a build and fine after one — @ts-expect-error would fail in one of them.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from "./.open-next/worker.js";
import { runJobIndexing, type KVLike } from "./src/indexing/jobIndexing";

interface Env {
  INDEXING_STATE?: KVLike;
  GOOGLE_INDEXING_SA_KEY?: string;
  API_BASE_URL?: string;
  INDEXING_DRY_RUN?: string;
  [key: string]: unknown;
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

const SITE_URL = "https://previewcv.com";
const DEFAULT_API_BASE_URL = "https://letsmakecv.tulip-software.com";

const worker = {
  fetch: handler.fetch,

  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContextLike) {
    if (!env.INDEXING_STATE) {
      console.error("[job-indexing] INDEXING_STATE KV binding is missing; skipping run");
      return;
    }
    ctx.waitUntil(
      runJobIndexing({
        kv: env.INDEXING_STATE,
        serviceAccountKey: env.GOOGLE_INDEXING_SA_KEY ?? "",
        // Ignore a missing or placeholder value (e.g. "replace-me" in .dev.vars).
        apiBaseUrl: /^https?:\/\//.test(env.API_BASE_URL ?? "")
          ? (env.API_BASE_URL as string)
          : DEFAULT_API_BASE_URL,
        siteUrl: SITE_URL,
        dryRun: env.INDEXING_DRY_RUN === "true",
      }).catch((error) => {
        console.error("[job-indexing] run failed:", error);
      }),
    );
  },
};

export default worker;

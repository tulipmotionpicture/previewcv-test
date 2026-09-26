/**
 * Google Indexing API notifier for job pages.
 *
 * Runs from the worker's cron trigger (see custom-worker.ts). Each run:
 *   1. lists every open job from the jobs API,
 *   2. compares it with the state saved in KV (slug + a fingerprint of the fields
 *      that make up the page's JobPosting data),
 *   3. sends URL_UPDATED for new or changed jobs,
 *   4. for jobs that left the open list: URL_UPDATED if the page still exists
 *      (expired — the page drops its JobPosting data and Google must recrawl to
 *      remove it from Google for Jobs), URL_DELETED if it now 404s.
 *
 * The Indexing API is only permitted for pages with JobPosting (or livestream)
 * structured data, so this only ever notifies /job/{slug} URLs. A job's state is
 * only saved after Google accepted its notification, so any failure is retried on
 * the next run instead of being lost. Sends are capped per UTC day below Google's
 * default quota of 200.
 */

// --- Minimal runtime interfaces (no dependency on @cloudflare/workers-types) ---

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface IndexingDeps {
  kv: KVLike;
  /** Service-account JSON key (the GOOGLE_INDEXING_SA_KEY secret). */
  serviceAccountKey: string;
  /** Jobs API base, e.g. https://letsmakecv.tulip-software.com */
  apiBaseUrl: string;
  /** Public site origin whose job pages are notified. */
  siteUrl: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  /** Log instead of calling Google (state is not saved). */
  dryRun?: boolean;
  log?: (message: string) => void;
}

export interface RunSummary {
  openJobs: number;
  updated: string[];
  deleted: string[];
  failed: string[];
  deferredForQuota: number;
  skipped?: string;
}

type NotificationType = "URL_UPDATED" | "URL_DELETED";

interface SavedJob {
  slug: string;
  fp: string;
}

type SavedState = Record<string, SavedJob>;

interface ListedJob {
  id: number;
  slug: string;
  [key: string]: unknown;
}

const STATE_KEY = "job-indexing:state:v1";
const quotaKey = (day: string) => `job-indexing:quota:${day}`;
/** Google's default Indexing API quota is 200 publish requests/day; keep headroom. */
export const DAILY_SEND_CAP = 150;
const JOBS_PAGE_SIZE = 100;
const INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";

// Fields rendered into the job page / its JobPosting JSON-LD. A change to any of
// them means Google's copy is stale.
const FINGERPRINT_FIELDS = [
  "slug",
  "title",
  "description",
  "company_name",
  "location",
  "city",
  "state",
  "country",
  "is_remote",
  "job_type",
  "experience_level",
  "salary_min",
  "salary_max",
  "salary_currency",
  "salary_type",
  "required_skills",
  "preferred_skills",
  "posted_date",
] as const;

class AuthError extends Error {}

// --- Helpers ---

const textEncoder = new TextEncoder();

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function jobFingerprint(job: ListedJob): Promise<string> {
  const picked = FINGERPRINT_FIELDS.map((f) => [f, job[f] ?? null]);
  return sha256Hex(JSON.stringify(picked));
}

function jobUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/job/${encodeURIComponent(slug)}`;
}

/** Only job detail pages carry JobPosting data; never notify anything else. */
function assertJobUrl(siteUrl: string, url: string): void {
  const prefix = `${siteUrl.replace(/\/+$/, "")}/job/`;
  if (!url.startsWith(prefix) || url.length === prefix.length) {
    throw new Error(`Refusing to notify a non-job URL: ${url}`);
  }
}

// --- Google auth (service-account JWT -> access token) ---

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function parseServiceAccountKey(raw: string): ServiceAccountKey {
  let parsed: Partial<ServiceAccountKey>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_INDEXING_SA_KEY is not valid JSON");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_INDEXING_SA_KEY is missing client_email or private_key");
  }
  return parsed as ServiceAccountKey;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function getAccessToken(
  rawKey: string,
  fetchImpl: typeof fetch,
  now: Date,
): Promise<string> {
  const key = parseServiceAccountKey(rawKey);
  const tokenUri = key.token_uri || "https://oauth2.googleapis.com/token";
  const iat = Math.floor(now.getTime() / 1000);
  const header = base64UrlEncode(textEncoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = base64UrlEncode(
    textEncoder.encode(
      JSON.stringify({
        iss: key.client_email,
        scope: INDEXING_SCOPE,
        aud: tokenUri,
        iat,
        exp: iat + 3600,
      }),
    ),
  );
  const signingInput = `${header}.${claims}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    await importPrivateKey(key.private_key),
    textEncoder.encode(signingInput),
  );
  const assertion = `${signingInput}.${base64UrlEncode(signature)}`;

  const res = await fetchImpl(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: HTTP ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google token exchange returned no access_token");
  return data.access_token;
}

// --- Jobs API ---

async function listOpenJobs(apiBaseUrl: string, fetchImpl: typeof fetch): Promise<ListedJob[]> {
  const base = apiBaseUrl.replace(/\/+$/, "");
  const jobs: ListedJob[] = [];
  let offset = 0;
  for (let page = 0; page < 1000; page++) {
    const res = await fetchImpl(
      `${base}/api/v1/jobs/list?limit=${JOBS_PAGE_SIZE}&offset=${offset}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`Jobs list failed: HTTP ${res.status}`);
    const data = (await res.json()) as {
      total?: number;
      jobs?: ListedJob[];
      items?: ListedJob[];
      data?: ListedJob[];
    };
    const items = data.jobs || data.items || data.data || [];
    for (const job of items) {
      if (job && typeof job.id === "number" && typeof job.slug === "string" && job.slug) {
        jobs.push(job);
      }
    }
    offset += items.length;
    if (items.length === 0 || offset >= (data.total ?? 0)) break;
  }
  return jobs;
}

/** 200 → page still exists (expired), 404 → gone, anything else → unknown (retry later). */
async function jobPageStatus(
  apiBaseUrl: string,
  slug: string,
  fetchImpl: typeof fetch,
): Promise<"exists" | "gone" | "unknown"> {
  const base = apiBaseUrl.replace(/\/+$/, "");
  const res = await fetchImpl(`${base}/api/v1/jobs/slug/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  if (res.ok) return "exists";
  if (res.status === 404) return "gone";
  return "unknown";
}

// --- Main ---

export async function runJobIndexing(deps: IndexingDeps): Promise<RunSummary> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? ((m: string) => console.log(`[job-indexing] ${m}`));

  const summary: RunSummary = {
    openJobs: 0,
    updated: [],
    deleted: [],
    failed: [],
    deferredForQuota: 0,
  };

  if (!deps.serviceAccountKey) {
    summary.skipped = "GOOGLE_INDEXING_SA_KEY is not set";
    log(summary.skipped);
    return summary;
  }

  const state: SavedState = JSON.parse((await deps.kv.get(STATE_KEY)) || "{}");
  const openJobs = await listOpenJobs(deps.apiBaseUrl, fetchImpl);
  summary.openJobs = openJobs.length;

  // Build the work list.
  type Task =
    | { kind: "open"; id: string; slug: string; fp: string; type: "URL_UPDATED" }
    | { kind: "closed"; id: string; slug: string };
  const tasks: Task[] = [];
  const openIds = new Set<string>();

  for (const job of openJobs) {
    const id = String(job.id);
    openIds.add(id);
    const fp = await jobFingerprint(job);
    const saved = state[id];
    if (!saved || saved.fp !== fp || saved.slug !== job.slug) {
      tasks.push({ kind: "open", id, slug: job.slug, fp, type: "URL_UPDATED" });
    }
  }
  for (const [id, saved] of Object.entries(state)) {
    if (!openIds.has(id)) tasks.push({ kind: "closed", id, slug: saved.slug });
  }

  if (tasks.length === 0) {
    log(`no changes (${openJobs.length} open jobs)`);
    return summary;
  }

  // Daily cap.
  const day = now().toISOString().slice(0, 10);
  let sentToday = Number((await deps.kv.get(quotaKey(day))) || "0");

  let accessToken: string | null = null;
  const publish = async (url: string, type: NotificationType): Promise<boolean> => {
    assertJobUrl(deps.siteUrl, url);
    if (deps.dryRun) {
      log(`dry-run ${type} ${url}`);
      return true;
    }
    if (accessToken === null) {
      try {
        accessToken = await getAccessToken(deps.serviceAccountKey, fetchImpl, now());
      } catch (error) {
        throw new AuthError(error instanceof Error ? error.message : String(error));
      }
    }
    const res = await fetchImpl(INDEXING_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type }),
    });
    if (!res.ok) {
      log(`FAILED ${type} ${url}: HTTP ${res.status} ${await res.text()}`);
      return false;
    }
    log(`${type} ${url}`);
    return true;
  };

  for (const task of tasks) {
    if (sentToday >= DAILY_SEND_CAP) {
      summary.deferredForQuota++;
      continue;
    }
    const url = jobUrl(deps.siteUrl, task.slug);
    try {
      if (task.kind === "open") {
        if (await publish(url, "URL_UPDATED")) {
          sentToday++;
          state[task.id] = { slug: task.slug, fp: task.fp };
          summary.updated.push(url);
        } else {
          summary.failed.push(url);
        }
      } else {
        const status = await jobPageStatus(deps.apiBaseUrl, task.slug, fetchImpl);
        if (status === "unknown") {
          summary.failed.push(url); // keep in state, retry next run
          continue;
        }
        const type: NotificationType = status === "exists" ? "URL_UPDATED" : "URL_DELETED";
        if (await publish(url, type)) {
          sentToday++;
          delete state[task.id];
          (type === "URL_DELETED" ? summary.deleted : summary.updated).push(url);
        } else {
          summary.failed.push(url);
        }
      }
    } catch (error) {
      summary.failed.push(url);
      log(`error for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      // An auth failure (bad key, API disabled, not an Owner) fails every remaining
      // send the same way — stop; everything unsent is retried next run.
      if (error instanceof AuthError) break;
    }
  }

  if (!deps.dryRun) {
    await deps.kv.put(STATE_KEY, JSON.stringify(state));
    await deps.kv.put(quotaKey(day), String(sentToday), { expirationTtl: 3 * 86400 });
  }

  log(
    `done: open=${summary.openJobs} updated=${summary.updated.length} ` +
      `deleted=${summary.deleted.length} failed=${summary.failed.length} ` +
      `deferred=${summary.deferredForQuota}`,
  );
  return summary;
}

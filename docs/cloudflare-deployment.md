# Cloudflare Deployment Guide — previewcv

Deploys this Next.js 15 app to **Cloudflare Workers** via the **OpenNext** adapter, using
**Workers Builds** (Cloudflare's built-in Git CI/CD) for push-to-deploy. No GitHub Actions.

- **Worker name:** `previewcv`
- **Adapter:** `@opennextjs/cloudflare`
- **Deploy branch:** `deployment` (repo default is `master` — see §5)
- **KV namespace (ISR cache):** `NEXT_INC_CACHE_KV` → id `acca016d90fc4b569ce7b112b3dc6bd6`
  (dedicated to previewcv — never shared with letsmakecv)

---

## 1. Files added are
| File | Purpose |
|---|---|
| `open-next.config.ts` | OpenNext config; KV-backed ISR/incremental cache |
| `wrangler.jsonc` | Worker config: `nodejs_compat`, compat date, `ASSETS` + KV bindings |
| `package.json` | `next` bumped to `^15.5.19` (OpenNext needs ≥15.5.18); scripts + dev deps |
| `.gitignore` | ignores `.open-next/`, `.wrangler/`, `.dev.vars`, `cloudflare-env.d.ts` |
| `.dev.vars` | local-only runtime secrets for `npm run preview` (gitignored) |

## 2. Scripts
```jsonc
"preview":   "opennextjs-cloudflare build && opennextjs-cloudflare preview", // local workerd
"cf:build":  "opennextjs-cloudflare build",   // Workers Builds — Build command
"cf:deploy": "wrangler deploy",               // Workers Builds — Deploy command
"deploy":    "opennextjs-cloudflare build && wrangler deploy", // local one-shot
"cf-typegen":"wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
```
> Use the `npm run` forms in Workers Builds, **not** `npx` (npx can fail with
> "could not determine executable to run").

## 3. Environment — three buckets (this app reads server env at runtime!)

Unlike a purely static frontend, previewcv's `api/resume/[token]` route handlers read server env
**at request time**, so those vars must live on the **Worker**, not just the build.

| Bucket | Where | Vars |
|---|---|---|
| **Build variables** (inlined at `next build`) | Workers Builds → Build variables | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_BLOG_API_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `NEXT_PUBLIC_LOGO_URL`, `NEXT_PUBLIC_PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` |
| **Runtime variables** (plaintext) | Worker → Settings → Variables and Secrets | `API_BASE_URL`, `NEXT_FAVICON`, `RATE_LIMIT_REQUESTS_PER_HOUR`, `RATE_LIMIT_WINDOW_MS` |
| **Runtime secrets** | Worker → Settings → Variables and Secrets (Secret) | `RECAPTCHA_SECRET_KEY`, `SHARED_LINK_API_TOKEN` |

> ⚠️ These are **runtime** variables (read at request time by the `api/resume` route), **not**
> "Build variables". A Build variable only exists during `next build` and never reaches the deployed
> Worker, so it cannot supply `API_BASE_URL`.
>
> ⚠️ `wrangler deploy` deletes all plaintext vars before applying config unless `keep_vars: true` is
> set in `wrangler.jsonc` (it is). That is why a dashboard-only `API_BASE_URL` got wiped on deploy
> and `/api/resume` fell back to `http://localhost:8000` → `PARSE_ERROR`. Secrets are never deleted,
> which is why `SHARED_LINK_API_TOKEN` survived. With `keep_vars: true`, dashboard-set vars persist.

Locally, all runtime vars/secrets go in `.dev.vars`. `NEXT_PUBLIC_*` come from `.env.local`.

## 4. Local testing
```bash
# fill .dev.vars with the runtime values (copy from .env.local), then:
npm run preview     # builds + runs in workerd at http://localhost:8787 (KV simulated locally)
```

## 5. Deploy via Workers Builds
1. `git push origin deployment`
2. Dashboard → Workers & Pages → Create → Workers → Import a repository → select this repo.
3. Build command `npm run cf:build`, Deploy command `npm run cf:deploy`; add the 7 build variables.
4. **Production branch:** repo default is `master`. To deploy from `deployment`, either set
   `deployment` as the GitHub default branch, or set it under Worker → Settings → Builds → Branch
   control (only appears after the repo is connected).
5. Add the runtime variables + secrets (§3) to the Worker.
6. Verify on `*.workers.dev`, then add the custom domain `previewcv.com`.

## 6. SEO status (as of setup)
previewcv's code is already SEO-correct: SSR job/blog pages with `generateMetadata`, a proper
`robots.ts` (allows public, blocks auth/private, points to `sitemap-index.xml`), and jobs+blog
sitemaps. The "Excluded by noindex" entries in Search Console are **stale** — an old global
noindex was removed and the live site no longer emits it. Action is in Search Console (Validate
Fix, Request Indexing, confirm sitemap submitted), not in code.

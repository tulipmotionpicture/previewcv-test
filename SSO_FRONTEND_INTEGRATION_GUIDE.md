# Lightweight SSO – Frontend Integration Guide

> **Audience:** Next.js frontend engineers for **letsmakecv.com** and **previewcv.com**.
> **Goal:** When a user is logged in on either site, opening the other site auto‑logs them in (bidirectional), without sharing cookies or `localStorage` across origins, without modifying the existing login/register/OAuth flows, and without any new third‑party dependency.

---

## 1. How it works (30‑second summary)

`letsmakecv.com` and `previewcv.com` are two different registrable domains, so the browser cannot share cookies or `localStorage` between them. Instead we use the classic **silent‑SSO with hidden iframe + postMessage + short‑lived single‑use ticket** pattern:

```
┌────────────────────────────┐                ┌────────────────────────────┐
│  previewcv.com (TARGET)    │                │ letsmakecv.com  (SOURCE)   │
│  app boots, no local token │                │  user already logged in    │
└──────────────┬─────────────┘                └─────────────┬──────────────┘
               │                                            │
               │  1. mount hidden <iframe>                  │
               │     src = SOURCE/sso/handoff               │
               │           ?return=https://previewcv.com    │
               │ ──────────────────────────────────────────▶│
               │                                            │
               │                                            │  2. handoff page reads
               │                                            │     localStorage.access_token
               │                                            │     POST /auth/sso/ticket
               │                                            │     { audience: TARGET }
               │                                            │  ──▶ backend (Redis 60 s)
               │                                            │  ◀── { ticket, expires_in }
               │                                            │
               │  3. window.postMessage(                    │
               │       { type:"sso", status:"ok", ticket }, │
               │       TARGET   ◀ strict targetOrigin)      │
               │ ◀──────────────────────────────────────────│
               │                                            │
               │  4. POST /auth/sso/exchange { ticket }     │
               │     (Origin: https://previewcv.com)        │
               │  ──▶ backend (Redis GETDEL atomic)         │
               │  ◀── standard TokenResponse                │
               │                                            │
               │  5. localStorage.setItem(access_token …)   │
               │     trigger auth store re‑hydrate          │
               │                                            │
```

The exact same flow runs in reverse (source = previewcv, target = letsmakecv).

**What the backend guarantees:**
- Ticket is **single‑use** (atomic `GETDEL` in Redis).
- Ticket is **short‑lived** (60 s TTL).
- Ticket is **audience‑bound** – the `Origin` header on `/exchange` must equal the `audience` passed at mint time.
- Both origins (mint side and exchange side) must be in the server‑side **allowlist**.
- Tokens returned are *identical* in shape to `/auth/login` – `{ access_token, refresh_token, token_type, expires_in, user }`.

---

## 2. Backend endpoints you will call

Base URL: same as today (e.g. `https://api.letsmakecv.com` or whatever `NEXT_PUBLIC_API_URL` is set to). The endpoints are served on the same FastAPI service for both sites.

### 2.1 `POST /api/v1/auth/sso/ticket` (authenticated)

| | |
|---|---|
| **Auth** | `Authorization: Bearer <candidate access_token>` |
| **Body** | `{ "audience": "https://previewcv.com" }` |
| **200** | `{ "ticket": "<opaque-string>", "expires_in": 60 }` |
| **400** | Audience not in allowlist. |
| **401** | Missing/invalid/expired token. |
| **429** | Per‑user rate limit hit (30/min, 300/day). |
| **503** | Redis down – treat as "anonymous". |

The `audience` must be the **peer origin**, exactly matching one of the entries in the allowlist (see §6). No trailing slash. No path.

### 2.2 `POST /api/v1/auth/sso/exchange` (public)

| | |
|---|---|
| **Auth** | None |
| **Headers** | The browser sends `Origin` automatically; the backend uses it. |
| **Body** | `{ "ticket": "<the-ticket-from-step-2.1>" }` |
| **200** | Standard `TokenResponse` (see §2.3). |
| **400** | Missing ticket. |
| **401** | Ticket invalid / expired / already used / user inactive. |
| **403** | Origin not in allowlist, or `Origin ≠ audience`. |
| **429** | Per‑IP rate limit hit (20/min, 500/day). |
| **503** | Redis down – treat as "anonymous". |

### 2.3 `TokenResponse` shape (identical to `/auth/login`)

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "...": "...same User schema you already use from /auth/login..."
  }
}
```

> Treat the response **exactly** like a `/auth/login` response. Reuse your existing "save tokens + hydrate user" code path.

---

## 3. Configuration constants (put in a shared file)

Create `lib/sso/config.ts` (or whatever naming convention each app uses).

```ts
// lib/sso/config.ts

/**
 * Origins that are permitted to participate in SSO.
 * MUST match the backend SSO_ALLOWED_ORIGINS env var.
 */
export const SSO_ALLOWED_ORIGINS = [
  "https://letsmakecv.com",
  "https://www.letsmakecv.com",
  "https://previewcv.com",
  "https://www.previewcv.com",
  "http://localhost:3000",
] as const;

/**
 * Map every allowed origin to its peer.
 * - apex ↔ apex
 * - www  ↔ www
 * - localhost has no peer (both apps share port 3000 locally; SSO is a no‑op).
 */
export const SSO_PEER: Record<string, string | null> = {
  "https://letsmakecv.com":      "https://previewcv.com",
  "https://www.letsmakecv.com":  "https://www.previewcv.com",
  "https://previewcv.com":       "https://letsmakecv.com",
  "https://www.previewcv.com":   "https://www.letsmakecv.com",
  "http://localhost:3000":       null,
};

/** Backend API base URL (already configured per app). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!; // e.g. https://api.letsmakecv.com

/** Hard timeout for the SSO bootstrap iframe (ms). */
export const SSO_BOOTSTRAP_TIMEOUT_MS = 3000;

/** localStorage keys – keep identical to what /auth/login uses today. */
export const LS_ACCESS_TOKEN  = "access_token";
export const LS_REFRESH_TOKEN = "refresh_token";
export const LS_USER_TYPE     = "user_type";

/** Normalize an origin string the same way the backend does. */
export function normalizeOrigin(o: string | null | undefined): string | null {
  if (!o) return null;
  return o.trim().replace(/\/+$/, "").toLowerCase();
}

/** Get the current page's normalized origin (browser only). */
export function currentOrigin(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeOrigin(window.location.origin);
}

/** Get the peer origin for the current site (or null if none). */
export function peerOriginForCurrentSite(): string | null {
  const here = currentOrigin();
  if (!here) return null;
  return SSO_PEER[here] ?? null;
}

/** Allowlist membership check. */
export function isAllowedOrigin(o: string | null): o is string {
  return !!o && (SSO_ALLOWED_ORIGINS as readonly string[]).includes(o);
}
```

> **Keep `SSO_ALLOWED_ORIGINS` and `SSO_PEER` byte‑identical between the two repos.** A mismatch breaks the exchange step silently.

---

## 4. Page 1 – `/sso/handoff` (must exist on BOTH sites)

This page runs **inside a hidden iframe** mounted by the *peer* origin. Its only job is to:
1. Validate the `?return=` param against the allowlist.
2. Read `localStorage.access_token` on its own origin.
3. If logged in → mint a ticket → `postMessage` it to the parent.
4. If anonymous or any error → `postMessage({ status: "anonymous" })`.
5. Render nothing visible (it's an invisible iframe).

### 4.1 Next.js App Router – `app/sso/handoff/page.tsx`

```tsx
// app/sso/handoff/page.tsx
"use client";

import { useEffect } from "react";
import {
  API_BASE_URL,
  LS_ACCESS_TOKEN,
  SSO_ALLOWED_ORIGINS,
  normalizeOrigin,
} from "@/lib/sso/config";

export default function SSOHandoffPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ret = normalizeOrigin(params.get("return"));

    // Always reply to the parent – never leave it hanging.
    const reply = (data: Record<string, unknown>) => {
      if (!ret) return; // can't reply safely without a verified target
      try {
        window.parent.postMessage({ type: "sso", ...data }, ret);
      } catch {
        /* parent may already be gone – ignore */
      }
    };

    // 1. Validate return origin against the allowlist.
    if (!ret || !(SSO_ALLOWED_ORIGINS as readonly string[]).includes(ret)) {
      // Nothing we can do – just close out silently.
      return;
    }

    // 2. Read local token.
    let token: string | null = null;
    try {
      token = window.localStorage.getItem(LS_ACCESS_TOKEN);
    } catch {
      token = null; // localStorage blocked (private mode, etc.)
    }

    if (!token) {
      reply({ status: "anonymous" });
      return;
    }

    // 3. Mint a ticket for the requesting peer.
    const ctrl = new AbortController();
    const timeoutId = window.setTimeout(() => ctrl.abort(), 5000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/sso/ticket`, {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ audience: ret }),
        });

        if (!res.ok) {
          // 401 → our local token is stale; treat as anonymous.
          // 4xx/5xx → still treat as anonymous so peer falls back gracefully.
          reply({ status: "anonymous" });
          return;
        }

        const json = (await res.json()) as { ticket: string; expires_in: number };
        reply({ status: "ok", ticket: json.ticket });
      } catch {
        reply({ status: "anonymous" });
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();
  }, []);

  // Render absolutely nothing – this page only lives inside a hidden iframe.
  return null;
}
```

If you're on **Pages Router**, the equivalent file is `pages/sso/handoff.tsx` with the same body but no `"use client"` directive.

### 4.2 SEO / indexing hygiene

Add to `app/sso/handoff/layout.tsx` (App Router):
```tsx
export const metadata = { robots: { index: false, follow: false } };
```
Or for Pages Router, render `<Head><meta name="robots" content="noindex,nofollow" /></Head>`.

Also ensure the route is excluded from your sitemap.

### 4.3 X‑Frame‑Options / CSP

The backend already sets `X-Frame-Options: DENY` globally, but that's the **backend** response – frontend pages are served by Next.js / your CDN. Make sure the frontend does **not** set `X-Frame-Options: DENY` or `frame-ancestors 'none'` on `/sso/handoff` (it must be embeddable by the peer site only).

Recommended for `/sso/handoff` on each site:
```
Content-Security-Policy: frame-ancestors https://previewcv.com https://www.previewcv.com http://localhost:3000;
```
(Replace `previewcv.com` with `letsmakecv.com` on the previewcv app.)

In `next.config.js`:
```js
async headers() {
  return [
    {
      source: "/sso/handoff",
      headers: [
        // letsmakecv app version – ALLOW preview origins to embed:
        { key: "Content-Security-Policy",
          value: "frame-ancestors https://previewcv.com https://www.previewcv.com http://localhost:3000;" },
        // Remove any default X-Frame-Options on this route:
        { key: "X-Frame-Options", value: "" },
      ],
    },
  ];
}
```

> If you have a global middleware adding `X-Frame-Options: DENY`, add an explicit exception for `/sso/handoff`.

---

## 5. Page 2 – Bootstrap hook (mount on BOTH sites in app root)

This runs on every page load. If the user is **not** logged in locally, it silently asks the peer "are you logged in?" via the hidden iframe. If yes, it exchanges the returned ticket for a token pair and hydrates auth state.

### 5.1 `lib/sso/useSsoBootstrap.ts`

```ts
// lib/sso/useSsoBootstrap.ts
"use client";

import { useEffect } from "react";
import {
  API_BASE_URL,
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_TYPE,
  SSO_BOOTSTRAP_TIMEOUT_MS,
  currentOrigin,
  isAllowedOrigin,
  normalizeOrigin,
  peerOriginForCurrentSite,
} from "./config";

type SsoMessage =
  | { type: "sso"; status: "ok"; ticket: string }
  | { type: "sso"; status: "anonymous" };

/**
 * Call this once at the root of the app (e.g. in your root layout or a
 * top-level <AuthProvider>). It runs only in the browser, only once per
 * full page load, and only when the user has no local access_token.
 *
 * onLoggedIn:  fired after a successful exchange so you can hydrate your
 *              auth store / re-fetch user / router.refresh().
 */
export function useSsoBootstrap(opts: { onLoggedIn?: (user: unknown) => void } = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Avoid running inside the handoff iframe itself.
    if (window.location.pathname.startsWith("/sso/")) return;

    // If we're already logged in locally, nothing to do.
    try {
      if (window.localStorage.getItem(LS_ACCESS_TOKEN)) return;
    } catch {
      return; // localStorage blocked – give up silently.
    }

    const here = currentOrigin();
    if (!isAllowedOrigin(here)) return; // unknown origin (preview deploys, etc.)

    const peer = peerOriginForCurrentSite();
    if (!peer) return; // localhost – SSO disabled in dev (see §6).

    // Guard against double-mounts (React strict mode, fast refresh).
    const FLAG = "__sso_bootstrap_in_flight__";
    if ((window as any)[FLAG]) return;
    (window as any)[FLAG] = true;

    // ---- mount hidden iframe ----------------------------------------------
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("title", "sso");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.referrerPolicy = "no-referrer";
    iframe.src = `${peer}/sso/handoff?return=${encodeURIComponent(here!)}`;

    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("message", onMessage);
      try { iframe.remove(); } catch {}
      try { delete (window as any)[FLAG]; } catch {}
      window.clearTimeout(timeoutId);
    };

    const onMessage = async (evt: MessageEvent) => {
      // Strict origin check – ignore anything else.
      if (normalizeOrigin(evt.origin) !== peer) return;
      const data = evt.data as SsoMessage | undefined;
      if (!data || data.type !== "sso") return;

      if (data.status === "anonymous") {
        cleanup();
        return;
      }

      if (data.status === "ok" && data.ticket) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/sso/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket: data.ticket }),
          });

          if (!res.ok) {
            cleanup();
            return;
          }

          const json = await res.json();

          // Persist tokens – same shape your /auth/login handler uses.
          try {
            window.localStorage.setItem(LS_ACCESS_TOKEN, json.access_token);
            window.localStorage.setItem(LS_REFRESH_TOKEN, json.refresh_token);
            window.localStorage.setItem(LS_USER_TYPE, "user");
          } catch { /* private mode */ }

          opts.onLoggedIn?.(json.user);
        } catch {
          /* swallow – user just stays anonymous */
        } finally {
          cleanup();
        }
      }
    };

    window.addEventListener("message", onMessage);

    // Fail-safe timeout – peer unreachable / extension blocked the iframe.
    const timeoutId = window.setTimeout(cleanup, SSO_BOOTSTRAP_TIMEOUT_MS);

    document.body.appendChild(iframe);

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
```

### 5.2 Wire it into your auth provider

Example for an existing `<AuthProvider>` or root layout:

```tsx
// app/(app)/AuthProvider.tsx  (or wherever your auth store lives)
"use client";

import { useRouter } from "next/navigation";
import { useSsoBootstrap } from "@/lib/sso/useSsoBootstrap";
import { useAuthStore } from "@/lib/auth/store"; // your existing store

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  useSsoBootstrap({
    onLoggedIn: (user) => {
      setUser(user);     // hydrate your store the same way /auth/login does
      router.refresh();  // re-run server components with the new auth state
    },
  });

  return <>{children}</>;
}
```

> If you don't have a central auth store, the minimum viable hook just does `window.location.reload()` inside `onLoggedIn`. Refresh is fine because tokens are already in `localStorage`.

---

## 6. Per‑environment behavior

| Environment | letsmakecv origin | previewcv origin | SSO active? |
|---|---|---|---|
| **Production** | `https://letsmakecv.com` & `https://www.letsmakecv.com` | `https://previewcv.com` & `https://www.previewcv.com` | ✅ Yes, bidirectional |
| **Local dev** | `http://localhost:3000` | `http://localhost:3000` (same port, switch apps) | ❌ No (peer = `null`, hook short-circuits) |
| **Preview / staging** | whatever Vercel/Netlify URL | whatever Vercel/Netlify URL | ❌ No (origin not in allowlist → hook short-circuits) |

If you want to test SSO end‑to‑end before prod:
- **Option A (recommended):** spin up a staging on stable subdomains (e.g. `staging.letsmakecv.com` / `staging.previewcv.com`), add them to `SSO_ALLOWED_ORIGINS` on backend and the frontend constants, deploy.
- **Option B:** temporarily run preview on `localhost:3001`, add `http://localhost:3001` to the allowlist on both sides, and add the peer mapping in `SSO_PEER`.

The hook is designed so that **any unknown origin is a no‑op** – there is no failure mode that breaks login.

---

## 7. Edge cases & how they're handled

| Scenario | Result |
|---|---|
| Peer user not logged in | `anonymous` postMessage → hook cleans up, normal anonymous UX. |
| Peer unreachable / extension blocks iframe | 3 s timeout → cleanup → anonymous UX. |
| User already logged in locally | Hook exits immediately (no iframe mounted). |
| Ticket replay attempt | Backend `GETDEL` returns nothing on 2nd try → 401. |
| Ticket used on wrong domain | Backend audience vs `Origin` mismatch → 403. |
| User deactivated between mint & exchange | Backend re‑checks `is_active` → 401. |
| Safari ITP / 3rd‑party cookie blocking | **Unaffected** – no cookies used, only postMessage + same‑origin `localStorage`. |
| Multiple browser tabs / React strict‑mode double mount | `__sso_bootstrap_in_flight__` flag prevents duplicate iframes. |
| `/sso/handoff` opened directly by a human | Reads `return` param, fails allowlist or has no parent → page is blank, no harm. |

---

## 8. Optional: cross‑domain logout propagation

JWTs are stateless on the backend, so logging out on one site doesn't invalidate the other site's local token. For UX consistency you can have logout send a "please clear your local tokens too" message to the peer.

### 8.1 `app/sso/logout/page.tsx` (on BOTH sites)

```tsx
"use client";

import { useEffect } from "react";
import {
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_TYPE,
  SSO_ALLOWED_ORIGINS,
  normalizeOrigin,
} from "@/lib/sso/config";

export default function SSOLogoutPage() {
  useEffect(() => {
    const ret = normalizeOrigin(
      new URLSearchParams(window.location.search).get("return")
    );
    try {
      window.localStorage.removeItem(LS_ACCESS_TOKEN);
      window.localStorage.removeItem(LS_REFRESH_TOKEN);
      window.localStorage.removeItem(LS_USER_TYPE);
    } catch {}
    if (ret && (SSO_ALLOWED_ORIGINS as readonly string[]).includes(ret)) {
      try { window.parent.postMessage({ type: "sso", status: "logged_out" }, ret); } catch {}
    }
  }, []);

  return null;
}
```

(Apply the same CSP `frame-ancestors` rule as for `/sso/handoff`.)

### 8.2 Wrap your existing logout handler

```ts
export function logout() {
  // 1. Your existing local cleanup
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_type");

  // 2. Propagate to peer (best effort, no need to await)
  const peer = peerOriginForCurrentSite();
  const here = currentOrigin();
  if (peer && here) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${peer}/sso/logout?return=${encodeURIComponent(here)}`;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 2000);
  }

  // 3. Your existing redirect
  window.location.href = "/";
}
```

This is **opt‑in** – skip it on v1 if you want the smallest surface area. Cross‑domain logout failures are non‑fatal.

---

## 9. Manual test plan

Run these against production (or against staging once you've added the staging origins to the allowlist).

### Test 1 – Cold cross‑site auto‑login (letsmakecv → previewcv)
1. Open `https://letsmakecv.com`, log in normally.
2. In a new tab on the same browser profile, open `https://previewcv.com`.
3. **Expected:** within ~1 s, the previewcv navbar shows the logged‑in user without any login UI.
4. **DevTools → Network:** confirm one `POST /api/v1/auth/sso/exchange` call returns 200.
5. **DevTools → Application → Local Storage** on `previewcv.com`: `access_token` is present.

### Test 2 – Cold cross‑site auto‑login (previewcv → letsmakecv)
Same as Test 1 with the sites swapped.

### Test 3 – Truly anonymous user
1. Clear `localStorage` on both `letsmakecv.com` and `previewcv.com`.
2. Open `previewcv.com`.
3. **Expected:** normal anonymous UI within ~3 s (timeout fires). One `GET /sso/handoff` to peer that returns and posts `{status:"anonymous"}`. No `/sso/exchange` call.

### Test 4 – Replay attack
1. Capture a successful ticket from the handoff iframe (`window.postMessage` payload).
2. Try `POST /auth/sso/exchange { ticket }` a second time.
3. **Expected:** 401 `Invalid or expired SSO ticket`.

### Test 5 – Stale ticket
1. Mint a ticket, wait 65 s, exchange it.
2. **Expected:** 401.

### Test 6 – Wrong origin
1. Mint a ticket for `audience=https://previewcv.com`.
2. From DevTools on `letsmakecv.com`, try to exchange it (so `Origin: https://letsmakecv.com`).
3. **Expected:** 403 `SSO ticket not valid for this origin`.

### Test 7 – Logout propagation (only if §8 implemented)
1. Log in on both sites.
2. Click logout on `letsmakecv.com`.
3. Reload `previewcv.com` tab.
4. **Expected:** anonymous UI – local token was cleared.

---

## 10. Checklist before shipping

- [ ] `lib/sso/config.ts` exists on **both** repos with identical `SSO_ALLOWED_ORIGINS` and `SSO_PEER`.
- [ ] `app/sso/handoff/page.tsx` (or `pages/sso/handoff.tsx`) deployed on **both** repos.
- [ ] `/sso/handoff` is `noindex,nofollow` and excluded from sitemap.
- [ ] `next.config.js` sets `Content-Security-Policy: frame-ancestors <peer-origins>` for `/sso/handoff` and removes any `X-Frame-Options: DENY` for that route.
- [ ] `useSsoBootstrap()` is called exactly once at the root of each app.
- [ ] `onLoggedIn` callback hydrates your auth store **and** triggers a UI refresh (`router.refresh()` or full reload).
- [ ] Verified Tests 1–6 on staging or prod.
- [ ] (Optional) Logout propagation implemented and Test 7 passing.

---

## 11. FAQ

**Q: Why not just share a cookie on `.parent.com`?**
The two sites have *different* registrable domains (`letsmakecv.com` and `previewcv.com`), so no shared parent domain exists. Cookies are physically impossible to share.

**Q: Why not put the token in the iframe URL or postMessage payload directly?**
Tokens are valid for 24 h. We use a **60 s single‑use ticket** so even if a postMessage leaks or is logged, it's harmless after the first redemption.

**Q: Does this affect Safari users?**
No. We never set a third‑party cookie. We use `postMessage` + same‑origin `localStorage` only, which Safari ITP does not block.

**Q: Will logged‑in users see a flicker?**
No. The hook only runs when there is **no** local `access_token`. Users already logged in on the current site are fast‑pathed out before any iframe is created.

**Q: What if the peer site is down?**
The 3 s `SSO_BOOTSTRAP_TIMEOUT_MS` fires → cleanup → user sees the normal anonymous UI. The login button still works as today.

**Q: Can recruiters use this?**
No. The backend only mints tickets for **candidate** (user entity) tokens. Recruiter SSO was explicitly out of scope.

**Q: Do I need to change anything in the existing `/auth/login`, `/auth/refresh`, `/auth/logout` flows?**
**No.** The SSO endpoints are 100% additive. Existing flows are untouched.

---

## 12. Reference – backend files

For future maintainers:

| File | Purpose |
|---|---|
| `app/core/config.py` | Reads `SSO_ALLOWED_ORIGINS` and `SSO_TICKET_TTL_SECONDS` env vars. |
| `app/routers/auth.py` | Implements `/api/v1/auth/sso/ticket` and `/api/v1/auth/sso/exchange` (tag `Authentication`). |
| `app/services/redis_cache_service.py` | Shared async Redis client, used for ticket storage. |
| `app/utils/rate_limit.py` | Per‑user / per‑IP throttling for SSO endpoints. |
| `app/core/security.py::create_tokens` | Reused to issue the final access + refresh pair. |

Backend env var to set in production:
```env
SSO_ALLOWED_ORIGINS=https://letsmakecv.com,https://www.letsmakecv.com,https://previewcv.com,https://www.previewcv.com
SSO_TICKET_TTL_SECONDS=60
```
(Defaults already cover the four prod origins + `localhost:3000`.)

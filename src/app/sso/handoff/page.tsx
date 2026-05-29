// src/app/sso/handoff/page.tsx
"use client";

import { useEffect } from "react";
import {
  apiUrl,
  LS_ACCESS_TOKEN,
  SSO_ALLOWED_ORIGINS,
  normalizeOrigin,
} from "@/lib/sso/config";

/**
 * SSO handoff page (top-level, redirect-based).
 *
 * Old behaviour: rendered nothing, replied via postMessage from a hidden
 * iframe. Broken in production by browser storage partitioning.
 *
 * New behaviour: top-level navigation. Reads its own (unpartitioned)
 * localStorage, mints a ticket if logged in, 302s the user back to
 * `?return=<peer-receive-url>` with the ticket in the URL fragment.
 *
 * Fragments aren't sent to servers; tickets are single-use + 60s TTL;
 * fragment leak via history is acceptable.
 *
 * Path validation on `return`: must be `/sso/receive` on an allow-listed
 * origin. Prevents this endpoint from being abused as an open redirector.
 */
export default function SSOHandoffPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ret = validateReturnUrl(params.get("return"));

    if (!ret) return; // unsafe/unknown — stay blank, do nothing.

    let token: string | null = null;
    try {
      token = window.localStorage.getItem(LS_ACCESS_TOKEN);
    } catch {
      token = null;
    }

    if (!token) {
      window.location.replace(`${ret}?sso=anon`);
      return;
    }

    const ctrl = new AbortController();
    const timeoutId = window.setTimeout(() => ctrl.abort(), 8000);

    (async () => {
      try {
        const audience = new URL(ret).origin;
        const res = await fetch(apiUrl("auth/sso/ticket"), {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ audience }),
        });

        if (!res.ok) {
          window.location.replace(`${ret}?sso=anon`);
          return;
        }

        const json = (await res.json()) as { ticket: string; expires_in: number };
        window.location.replace(`${ret}#ticket=${encodeURIComponent(json.ticket)}`);
      } catch {
        window.location.replace(`${ret}?sso=anon`);
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#666" }}>
      <p>Signing you in…</p>
    </div>
  );
}

/**
 * Validate `return`: must parse as a URL, origin must be allow-listed,
 * path must be exactly `/sso/receive`. Returns the cleaned return URL
 * (origin + `/sso/receive`) or null.
 */
function validateReturnUrl(raw: string | null): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const origin = normalizeOrigin(u.origin);
  if (!origin || !(SSO_ALLOWED_ORIGINS as readonly string[]).includes(origin)) {
    return null;
  }
  if (u.pathname !== "/sso/receive") {
    return null;
  }
  return `${origin}/sso/receive`;
}

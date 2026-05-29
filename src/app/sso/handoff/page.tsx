// src/app/sso/handoff/page.tsx
"use client";

import { useEffect } from "react";
import {
  apiUrl,
  LS_ACCESS_TOKEN,
  SSO_ALLOWED_ORIGINS,
  normalizeOrigin,
} from "@/lib/sso/config";

export default function SSOHandoffPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ret = normalizeOrigin(params.get("return"));

    // Always reply to the parent – never leave it hanging (when we can).
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
      // Untrusted/unknown parent – stay silent.
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
        const res = await fetch(apiUrl("auth/sso/ticket"), {
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

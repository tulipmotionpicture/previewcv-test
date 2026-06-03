// src/app/sso/receive/page.tsx
"use client";

import { useEffect } from "react";
import {
  apiUrl,
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_TYPE,
  LS_RECRUITER_ACCESS_TOKEN,
} from "@/lib/sso/config";

/**
 * SSO receive page (top-level).
 *
 * Lands here after the peer's /sso/handoff redirected back. Two cases:
 *
 *   1. URL fragment `#ticket=XYZ`
 *      -> POST /api/v1/auth/sso/exchange
 *      -> persist tokens (matches what /candidate/login does so AuthContext
 *         finds them on next mount)
 *      -> redirect to sso_return_to (or "/" fallback)
 *
 *   2. Query `?sso=anon`
 *      -> peer said the user isn't logged in there either
 *      -> mark sso_checked, redirect to sso_return_to as anonymous
 *
 * In both cases we set sessionStorage.sso_checked so the bootstrap hook
 * doesn't trigger another redirect on the next navigation.
 *
 * NOTE: this repo also has recruiter auth with separate tokens
 * (recruiter_access_token / recruiter_refresh_token). SSO here is for
 * candidate (user) auth only — recruiter sessions are not shared.
 */
export default function SSOReceivePage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const returnTo = getReturnTo();

    // Safety net: never overwrite a logged-in recruiter session. Candidate SSO
    // and recruiter auth use separate tokens; if a recruiter is signed in, skip
    // the exchange entirely and send them back where they were (defends against
    // any path that reaches /sso/receive while a recruiter session exists).
    try {
      if (window.localStorage.getItem(LS_RECRUITER_ACCESS_TOKEN)) {
        finish(returnTo);
        return;
      }
    } catch { /* ignore */ }

    // Anonymous bounce-back: peer told us user isn't logged in there.
    // Set the loop guard so we don't immediately retry SSO on next page.
    // (The bootstrap hook's hasFreshAnonCheck() reads this with a TTL.)
    if (url.searchParams.get("sso") === "anon") {
      try {
        window.sessionStorage.setItem(
          "sso_checked",
          JSON.stringify({ at: Date.now() }),
        );
      } catch { /* ignore */ }
      finish(returnTo);
      return;
    }

    const fragParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const ticket = fragParams.get("ticket");

    if (!ticket) {
      // Direct visit with no ticket and no anon flag. Don't set the loop
      // guard — bootstrap should still try SSO on the next regular page.
      finish(returnTo);
      return;
    }

    const ctrl = new AbortController();
    const timeoutId = window.setTimeout(() => ctrl.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(apiUrl("auth/sso/exchange"), {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket }),
        });

        if (!res.ok) {
          // Exchange failed (stale ticket, network blip, etc.). Don't
          // permanently block SSO — let the user retry on next visit.
          finish(returnTo);
          return;
        }

        const json = await res.json();

        try {
          // Clear any stale recruiter session — SSO logs in as candidate.
          window.localStorage.removeItem("recruiter_access_token");
          window.localStorage.removeItem("recruiter_refresh_token");

          window.localStorage.setItem(LS_ACCESS_TOKEN, json.access_token);
          window.localStorage.setItem(LS_REFRESH_TOKEN, json.refresh_token);
          window.localStorage.setItem(LS_USER_TYPE, "user");
          // Successful exchange — clear any leftover anon-bounce flag so
          // subsequent /sso/receive direct visits don't get confused.
          window.sessionStorage.removeItem("sso_checked");
        } catch { /* private mode */ }

        finish(returnTo);
      } catch {
        finish(returnTo);
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
 * Read sso_return_to from sessionStorage, validate it's a same-origin
 * relative path, clear it. Defaults to "/" on any problem.
 */
function getReturnTo(): string {
  try {
    const raw = window.sessionStorage.getItem("sso_return_to");
    window.sessionStorage.removeItem("sso_return_to");
    if (!raw) return "/";
    if (!/^\/[^/]/.test(raw) && raw !== "/") return "/";
    return raw;
  } catch {
    return "/";
  }
}

function finish(returnTo: string) {
  window.location.replace(returnTo);
}

// src/lib/sso/useSsoBootstrap.ts
"use client";

import { useEffect } from "react";
import {
  LS_ACCESS_TOKEN,
  currentOrigin,
  isAllowedOrigin,
  peerOriginForCurrentSite,
} from "./config";

/**
 * Top-level-redirect SSO bootstrap.
 *
 * Why redirect (not iframe): modern browsers partition `localStorage` by
 * top-frame origin (Chrome 2024+, Safari ITP, Firefox TCP). An iframe
 * at letsmakecv.com inside previewcv.com sees an EMPTY partitioned
 * storage, not letsmakecv's real one — the previous iframe + postMessage
 * approach silently fails in production.
 *
 * Flow:
 *   1. Anonymous visitor lands on previewcv.com (or letsmakecv.com).
 *   2. Stash original URL in sessionStorage as `sso_return_to`.
 *   3. Top-level redirect to peer's /sso/handoff?return=<here>/sso/receive
 *   4. Peer's handoff page:
 *        - if logged in -> mint ticket -> redirect to our /sso/receive#ticket=XYZ
 *        - if anonymous -> redirect to our /sso/receive?sso=anon
 *   5. Our /sso/receive page exchanges ticket (or notes anon), stores
 *      tokens, then navigates to the original URL.
 *
 * Loop prevention: ONLY set sessionStorage.sso_checked when the peer
 * explicitly told us the user is anonymous there (sso=anon bounce-back).
 * The flag carries a timestamp and expires after SSO_CHECK_TTL_MS so
 * the user gets another chance if they log into the peer site later in
 * the same tab. Successful exchanges don't need a flag because the
 * resulting access_token alone is enough to skip the bootstrap.
 */
const SSO_CHECK_TTL_MS = 5 * 60 * 1000; // 5 minutes

function hasFreshAnonCheck(): boolean {
  try {
    const raw = window.sessionStorage.getItem("sso_checked");
    if (!raw) return false;
    // Backwards-compat: old code stored "1" with no timestamp. Treat any
    // non-JSON value as immediately-expired so users on the old format
    // get a clean retry on first page load after this deploy.
    if (raw === "1") {
      window.sessionStorage.removeItem("sso_checked");
      return false;
    }
    const parsed = JSON.parse(raw) as { at?: number };
    if (!parsed?.at) return false;
    return Date.now() - parsed.at < SSO_CHECK_TTL_MS;
  } catch {
    return false;
  }
}

export function useSsoBootstrap(_opts: { onLoggedIn?: (user: unknown) => void } = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.pathname.startsWith("/sso/")) return;

    try {
      if (window.localStorage.getItem(LS_ACCESS_TOKEN)) return;
    } catch {
      return;
    }

    // Loop guard: only blocks if a recent anonymous bounce-back happened.
    if (hasFreshAnonCheck()) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("sso") === "anon") {
      // Peer just told us user is anonymous there too. Remember it with
      // a timestamp so we don't immediately retry, but allow retries
      // after SSO_CHECK_TTL_MS in case the user logs in elsewhere.
      try {
        window.sessionStorage.setItem(
          "sso_checked",
          JSON.stringify({ at: Date.now() }),
        );
      } catch { /* ignore */ }
      // Clean the URL so the flag doesn't leak into shared links.
      params.delete("sso");
      const qs = params.toString();
      const cleanUrl =
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState(null, "", cleanUrl);
      return;
    }

    const here = currentOrigin();
    if (!isAllowedOrigin(here)) return;

    const peer = peerOriginForCurrentSite();
    if (!peer) return;

    try {
      const target =
        window.location.pathname + window.location.search + window.location.hash;
      window.sessionStorage.setItem("sso_return_to", target);
    } catch { /* ignore */ }

    const ret = `${here}/sso/receive`;
    window.location.replace(
      `${peer}/sso/handoff?return=${encodeURIComponent(ret)}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

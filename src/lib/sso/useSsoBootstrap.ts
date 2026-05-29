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
 * Loop prevention: sessionStorage.sso_checked = "1" after any attempt
 * (success or anon). Cleared on logout/tab close.
 *
 * Skip conditions:
 *   - Already have a local access_token.
 *   - On an /sso/* route — those drive themselves.
 *   - sso_checked is set (already attempted this session).
 *   - URL has `?sso=anon` (peer just told us "not logged in").
 *   - Origin / peer not configured.
 *
 * onLoggedIn: kept for API compat but no longer fires from this hook —
 * the actual login happens on /sso/receive after the bounce.
 */
export function useSsoBootstrap(_opts: { onLoggedIn?: (user: unknown) => void } = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.pathname.startsWith("/sso/")) return;

    try {
      if (window.localStorage.getItem(LS_ACCESS_TOKEN)) return;
    } catch {
      return;
    }

    try {
      if (window.sessionStorage.getItem("sso_checked") === "1") return;
    } catch {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("sso") === "anon") {
      try { window.sessionStorage.setItem("sso_checked", "1"); } catch { /* ignore */ }
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

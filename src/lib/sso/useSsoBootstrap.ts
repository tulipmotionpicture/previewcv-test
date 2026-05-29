// src/lib/sso/useSsoBootstrap.ts
"use client";

import { useEffect } from "react";
import {
  apiUrl,
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
    if (!peer) return; // no peer mapped – SSO disabled for this origin.

    // Guard against double-mounts (React strict mode, fast refresh).
    const FLAG = "__sso_bootstrap_in_flight__";
    if ((window as unknown as Record<string, unknown>)[FLAG]) return;
    (window as unknown as Record<string, unknown>)[FLAG] = true;

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
      try { iframe.remove(); } catch { }
      try { delete (window as unknown as Record<string, unknown>)[FLAG]; } catch { }
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
          const res = await fetch(apiUrl("auth/sso/exchange"), {
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

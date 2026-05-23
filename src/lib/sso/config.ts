// src/lib/sso/config.ts

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
  "http://localhost:3001",
] as const;

/**
 * Map every allowed origin to its peer.
 * - apex ↔ apex
 * - www  ↔ www
 * - localhost has no peer (both apps share port 3000 locally; SSO is a no‑op).
 */
export const SSO_PEER: Record<string, string | null> = {
  "https://letsmakecv.com": "https://previewcv.com",
  "https://www.letsmakecv.com": "https://www.previewcv.com",
  "https://previewcv.com": "https://letsmakecv.com",
  "https://www.previewcv.com": "https://www.letsmakecv.com",
  "http://localhost:3000": "http://localhost:3001",
  "http://localhost:3001": "http://localhost:3000",
};

/** Backend API base URL (already configured per app). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

/** Hard timeout for the SSO bootstrap iframe (ms). */
export const SSO_BOOTSTRAP_TIMEOUT_MS = 3000;

/** localStorage keys – keep identical to what /auth/login uses today. */
export const LS_ACCESS_TOKEN = "access_token";
export const LS_REFRESH_TOKEN = "refresh_token";
export const LS_USER_TYPE = "user_type";

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

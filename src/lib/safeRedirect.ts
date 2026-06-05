/**
 * Helpers for safely redirecting a user back to where they came from after authentication.
 *
 * SECURITY: never redirect to an attacker-controlled absolute URL (open-redirect). We only ever
 * follow same-origin relative paths that start with a single "/". This mirrors the validation in
 * src/app/sso/receive/page.tsx (`getReturnTo`).
 */

const POST_LOGIN_REDIRECT_KEY = "post_login_redirect";

/**
 * Validate that `raw` is a safe, same-origin relative path. Rejects absolute URLs
 * ("https://evil.com"), protocol-relative URLs ("//evil.com"), and anything not starting with a
 * single "/". Returns `fallback` on any problem.
 */
export function safeInternalPath(
  raw: string | null | undefined,
  fallback = "/candidate/dashboard",
): string {
  if (!raw) return fallback;
  // Must be exactly "/" or start with "/" followed by a non-"/" character (blocks "//host").
  if (raw !== "/" && !/^\/[^/]/.test(raw)) return fallback;
  return raw;
}

/**
 * Stash an intended post-login destination before a full-page auth redirect (e.g. social OAuth),
 * where we can't carry a query param through the round-trip. No-op for invalid/empty paths.
 */
export function setPostLoginRedirect(path: string | null | undefined): void {
  try {
    const safe = safeInternalPath(path, "");
    if (safe) window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, safe);
    else window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

/**
 * Read and clear the stashed post-login destination. Returns `fallback` when nothing was stashed
 * or the stored value fails validation.
 */
export function consumePostLoginRedirect(fallback = "/candidate/dashboard"): string {
  try {
    const raw = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return safeInternalPath(raw, fallback);
  } catch {
    return fallback;
  }
}

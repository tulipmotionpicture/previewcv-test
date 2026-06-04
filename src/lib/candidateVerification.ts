import type { User } from "@/types/api";

/**
 * A candidate must be active AND verified before they can apply to jobs.
 * Per product decision: blocked when `is_active !== true || is_verified !== true`
 * (the candidate `/me` response carries these flags). Returns `false` when there
 * is no user — unauthenticated users are handled by the login prompt, not this gate.
 */
export function candidateNeedsVerification(u?: User | null): boolean {
  if (!u) return false;
  return u.is_active !== true || u.is_verified !== true;
}

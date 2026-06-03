import type { Recruiter } from "@/types/api";

/**
 * A recruiter needs to verify their email before they can post jobs.
 * Only an explicit `false` counts as unverified — undefined fields are NOT
 * treated as unverified, to avoid false-gating when the profile is partial.
 * Verifying the email is expected to flip both flags to `true`.
 */
export function recruiterNeedsVerification(r?: Recruiter | null): boolean {
  if (!r) return false;
  return r.is_email_verified === false || r.is_verified === false;
}

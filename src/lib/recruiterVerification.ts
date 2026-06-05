import type { Recruiter } from "@/types/api";

/**
 * A recruiter needs to verify their email before they can post jobs.
 * Only an explicit `false` counts as unverified — undefined fields are NOT
 * treated as unverified, to avoid false-gating when the profile is partial.
 * Verifying the email is expected to flip both flags to `true`.
 */
export function recruiterNeedsVerification(r?: Recruiter | null): boolean {
  if (!r) return false;
  //return r.is_email_verified === false || r.is_verified === false;
  return r.is_email_verified === false;
}

/**
 * A recruiter needs to RE-validate before posting jobs after editing their profile.
 * The backend flips `is_verified` to `false` on profile updates; `can_post_jobs` (from the KYC
 * status endpoint) may independently be `false`. Either explicit `false` blocks posting until
 * the account is revalidated (handled manually via support). Only explicit `false` counts, so
 * we never false-gate while these fields are still loading/undefined.
 */
export function recruiterNeedsRevalidation(
  r?: Recruiter | null,
  canPostJobs?: boolean,
): boolean {
  if (!r) return false;
  return r.is_verified === false || canPostJobs === false;
}

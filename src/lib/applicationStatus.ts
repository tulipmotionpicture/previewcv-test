// Job application statuses: display labels, the ones a recruiter can set, and which
// notify the candidate. Mirrors the backend's ApplicationStatus and notification events.

const LABELS: Record<string, string> = {
  draft: "Draft",
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview",
  interviewed: "Interviewed",
  offered: "Offered",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Order of the recruiter's status dropdown. */
export const RECRUITER_STATUS_OPTIONS = [
  "applied",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "interviewed",
  "offered",
  "accepted",
  "rejected",
] as const;

/** Moving an application to one of these sends the candidate a push + email. */
export const CANDIDATE_NOTIFIED_STATUSES: ReadonlySet<string> = new Set([
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "offered",
  "accepted",
  "rejected",
]);

export function applicationStatusLabel(status?: string | null): string {
  const key = (status || "").toLowerCase();
  return LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

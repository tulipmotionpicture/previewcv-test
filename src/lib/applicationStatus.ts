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

/**
 * Permission a team member needs to move an application to each status
 * (mirrors the backend's STATUS_PERMISSIONS). Final decisions are separate
 * from screening; members without them can add a recommendation note.
 */
export const STATUS_PERMISSION: Record<string, string> = {
  under_review: "applicants.screen",
  shortlisted: "applicants.screen",
  interview_scheduled: "applicants.interview",
  interviewed: "applicants.interview",
  offered: "applicants.decide",
  rejected: "applicants.decide",
  accepted: "applicants.decide",
  withdrawn: "applicants.decide",
};

const RECOMMEND_ACTIONS: Record<string, string> = {
  shortlisted: "Shortlist",
  interview_scheduled: "Interview",
  offered: "Offer",
  rejected: "Reject",
};

/**
 * "Recommended: Reject · Sam" (+N when more teammates recommended), or null
 * when there is none or the application already has that status.
 */
export function recommendationLabel(
  rec: { status: string; author_name?: string | null; count?: number } | null | undefined,
  currentStatus?: string | null,
): string | null {
  if (!rec || rec.status === currentStatus) return null;
  const action = RECOMMEND_ACTIONS[rec.status] ?? applicationStatusLabel(rec.status);
  const who = rec.author_name?.trim();
  const more = (rec.count ?? 1) > 1 ? ` +${(rec.count ?? 1) - 1}` : "";
  return `Recommended: ${action}${who ? ` · ${who}` : ""}${more}`;
}

export function applicationStatusLabel(status?: string | null): string {
  const key = (status || "").toLowerCase();
  return LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

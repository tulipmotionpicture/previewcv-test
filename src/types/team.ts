// Recruiter teams: sub-users with roles/permissions and internal notes.
// Mirrors the backend contract in app/routers/recruiter_team.py.

export type TeamPermission =
  | "jobs.view" | "jobs.create" | "jobs.edit" | "jobs.manage"
  | "applicants.view" | "applicants.screen" | "applicants.interview"
  | "applicants.decide" | "applicants.message"
  | "notes.view" | "notes.write"
  | "cv.search" | "cv.unlock" | "buckets.view" | "buckets.manage"
  | "analytics.view" | "company.edit" | "kyc.manage"
  | "billing.view" | "billing.manage" | "team.manage";

export interface RecruiterActor {
  type: "owner" | "member";
  member_id: number | null;
  name: string;
  email: string;
  job_title?: string | null;
  role: string;
  role_name: string;
  job_scope: "all" | "assigned";
  job_ids: number[];
  permissions: string[];
  /** Members: the person (one login across companies) and the company acted for. */
  person_id?: number;
  company_id?: number;
}

/** A company the signed-in team member works for (company switcher). */
export interface TeamMembership {
  member_id: number;
  company_id: number;
  company_name: string | null;
  company_logo_url: string | null;
  role: string;
  role_name: string;
  status: "active" | "invited";
  current: boolean;
}

export interface TeamPermissionDef {
  key: string;
  group: string;
  label: string;
  owner_only: boolean;
}

export interface TeamRoleDef {
  key: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface TeamCatalog {
  permissions: TeamPermissionDef[];
  roles: TeamRoleDef[];
  status_permissions: Record<string, string>;
  max_members: number;
}

export interface TeamMember {
  id: number;
  email: string;
  full_name: string;
  job_title: string | null;
  phone: string | null;
  role: string;
  job_scope: "all" | "assigned";
  job_ids: number[];
  status: "invited" | "active" | "suspended" | "left" | "removed";
  joined_at?: string | null;
  ended_at?: string | null;
  grants: string[];
  revokes: string[];
  permissions: string[];
  invite_expires_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
}

export interface TeamMemberInput {
  email?: string;
  full_name?: string;
  job_title?: string | null;
  role?: string;
  job_scope?: "all" | "assigned";
  job_ids?: number[];
  grants?: string[];
  revokes?: string[];
}

export interface TeamPerson {
  key: string; // "owner" | "m:<id>"
  member_id: number | null;
  name: string;
  role: string;
  role_name: string;
  job_title?: string | null;
}

export interface TeamActivity {
  id: number;
  actor: string;
  actor_name: string;
  action: string;
  target_type: string | null;
  target_id: number | null;
  meta: Record<string, unknown>;
  created_at: string | null;
}

export type NoteTargetType = "application" | "resume" | "intro";

export interface TeamNote {
  id: number;
  target_type: NoteTargetType;
  target_id: number;
  job_id: number | null;
  author: { key: string; member_id: number | null; name: string };
  kind: "note" | "recommendation";
  recommended_status: string | null;
  body: string;
  mentions: string[];
  created_at: string | null;
  updated_at: string | null;
  can_edit: boolean;
  can_delete: boolean;
}

export interface InvitePreview {
  email: string;
  full_name: string;
  role: string;
  role_name: string;
  company_name: string | null;
  company_logo: string | null;
  /** The person already has a team login (another company): confirm with that password. */
  has_account: boolean;
  expires_at: string;
}

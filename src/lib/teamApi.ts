import { api } from "@/lib/api";
import type {
  InvitePreview,
  NoteTargetType,
  RecruiterActor,
  TeamActivity,
  TeamCatalog,
  TeamMember,
  TeamMemberInput,
  TeamMembership,
  TeamNote,
  TeamPerson,
} from "@/types/team";
import type { Recruiter } from "@/types/api";

const TEAM = "/api/v1/recruiters/team";

/** Login-shaped response from invite accept and company switch. */
export interface TeamSession {
  access_token: string;
  refresh_token: string;
  recruiter: Recruiter;
  actor: RecruiterActor;
  memberships: TeamMembership[];
}
const NOTES = "/api/v1/recruiters/notes";

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

/** Recruiter teams API (team management, invites, internal notes). */
export const teamApi = {
  catalog: () => api.request<TeamCatalog & { success: boolean }>(`${TEAM}/catalog`, {}, true, true),

  me: async () =>
    (await api.request<{ actor: RecruiterActor }>(`${TEAM}/me`, {}, true, true)).actor,

  directory: async () =>
    (await api.request<{ people: TeamPerson[] }>(`${TEAM}/directory`, {}, true, true)).people,

  members: async () =>
    (await api.request<{ members: TeamMember[] }>(`${TEAM}/members`, {}, true, true)).members,

  invite: async (input: TeamMemberInput) =>
    (await api.request<{ member: TeamMember }>(`${TEAM}/members`, json("POST", input), true, true)).member,

  update: async (id: number, input: TeamMemberInput) =>
    (await api.request<{ member: TeamMember }>(`${TEAM}/members/${id}`, json("PATCH", input), true, true)).member,

  resendInvite: async (id: number) =>
    (await api.request<{ member: TeamMember }>(`${TEAM}/members/${id}/resend-invite`, json("POST"), true, true)).member,

  suspend: async (id: number) =>
    (await api.request<{ member: TeamMember }>(`${TEAM}/members/${id}/suspend`, json("POST"), true, true)).member,

  reactivate: async (id: number) =>
    (await api.request<{ member: TeamMember }>(`${TEAM}/members/${id}/reactivate`, json("POST"), true, true)).member,

  remove: (id: number) => api.request<{ success: boolean }>(`${TEAM}/members/${id}`, json("DELETE"), true, true),

  activity: async (params: { member_id?: number; before_id?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && q.append(k, String(v)));
    return api.request<{ activity: TeamActivity[]; next_before_id: number | null }>(
      `${TEAM}/activity?${q.toString()}`, {}, true, true,
    );
  },

  invitePreview: async (token: string) =>
    (await api.request<{ invite: InvitePreview }>(`${TEAM}/invite/${encodeURIComponent(token)}`)).invite,

  acceptInvite: (token: string, password: string, full_name?: string) =>
    api.request<TeamSession>(`${TEAM}/invite/accept`, json("POST", { token, password, full_name })),

  myCompanies: async () =>
    (await api.request<{ memberships: TeamMembership[] }>(`${TEAM}/my-companies`, {}, true, true)).memberships,

  /** New tokens acting at another of the person's companies. */
  switchCompany: (member_id: number) =>
    api.request<TeamSession>(`${TEAM}/switch`, json("POST", { member_id }), true, true),

  /** Leave the current company (other companies are unaffected). */
  leave: async () =>
    (await api.request<{ memberships: TeamMembership[] }>(`${TEAM}/me/leave`, json("POST"), true, true)).memberships,

  notes: async (target_type: NoteTargetType, target_id: number) =>
    (
      await api.request<{ notes: TeamNote[] }>(
        `${NOTES}?target_type=${target_type}&target_id=${target_id}`, {}, true, true,
      )
    ).notes,

  addNote: async (input: {
    target_type: NoteTargetType;
    target_id: number;
    body: string;
    kind?: "note" | "recommendation";
    recommended_status?: string;
    mentions?: string[];
  }) => (await api.request<{ note: TeamNote }>(NOTES, json("POST", input), true, true)).note,

  editNote: async (id: number, body: string) =>
    (await api.request<{ note: TeamNote }>(`${NOTES}/${id}`, json("PATCH", { body }), true, true)).note,

  deleteNote: (id: number) => api.request<{ success: boolean }>(`${NOTES}/${id}`, json("DELETE"), true, true),
};

/** True when the backend says this endpoint/feature is off (404) or not allowed (403). */
export const isTeamUnavailable = (e: unknown) =>
  !!e && typeof e === "object" && "status" in e && [403, 404].includes((e as { status: number }).status);

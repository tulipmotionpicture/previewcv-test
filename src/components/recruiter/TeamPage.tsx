"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History, KeyRound, LogOut, MailPlus, MoreHorizontal, PauseCircle, PlayCircle, RotateCw, Trash2, UserCog, Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { teamApi, isTeamUnavailable } from "@/lib/teamApi";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MaximizableModal from "@/components/common/MaximizableModal";
import type { Job } from "@/types/api";
import type { TeamActivity, TeamCatalog, TeamMember, TeamMemberInput, TeamPerson } from "@/types/team";

const inputCls =
  "w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
const btnPrimary =
  "inline-flex items-center gap-2 px-4 py-2 bg-primary-blue hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  invited: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  suspended: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  left: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  removed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

/** Left or removed: kept for history (notes, activity), no access. */
const isFormer = (m: TeamMember) => m.status === "left" || m.status === "removed";

const ACTION_LABEL: Record<string, string> = {
  "application.status": "changed an application status",
  "application.message": "messaged a candidate",
  "note.create": "added a note",
  "note.recommend": "made a recommendation",
  "note.delete": "deleted a note",
  "job.create": "posted a job",
  "member.invite": "invited a member",
  "member.update": "changed a member's access",
  "member.suspend": "suspended a member",
  "member.reactivate": "reactivated a member",
  "member.remove": "removed a member",
  "member.join": "joined the team",
  "member.leave": "left the team",
};

/** Team tab: everyone sees the directory; team.manage also manages members. */
export default function TeamPage() {
  const { can, actor, isTeamMember } = useRecruiterAuth();
  const { showToast } = useToast();
  const canManage = can("team.manage");

  const [catalog, setCatalog] = useState<TeamCatalog | null>(null);
  const [people, setPeople] = useState<TeamPerson[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activity, setActivity] = useState<TeamActivity[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | "new" | null>(null);
  const [confirm, setConfirm] = useState<{ member: TeamMember; action: "remove" | "suspend" } | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cat, dir] = await Promise.all([teamApi.catalog(), teamApi.directory()]);
      setCatalog(cat);
      setPeople(dir);
      if (canManage) {
        const [m, a, j] = await Promise.all([
          teamApi.members(),
          teamApi.activity({ limit: 30 }),
          api.getMyJobPostings(new URLSearchParams({ limit: "100" })).catch(() => null),
        ]);
        setMembers(m);
        setActivity(a.activity);
        setJobs(j?.data?.jobs ?? []);
      }
    } catch (e) {
      if (isTeamUnavailable(e)) setUnavailable(true);
      else showToast(e instanceof Error ? e.message : "Couldn't load your team", "error");
    } finally {
      setLoading(false);
    }
  }, [canManage, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const roleName = (key: string) => catalog?.roles.find((r) => r.key === key)?.name ?? key;

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      showToast(done, "success");
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong", "error");
    }
  };

  if (loading && !catalog && !unavailable) {
    return <div className="p-8 text-gray-500">Loading team…</div>;
  }
  if (unavailable) {
    return (
      <div className="p-8 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Team</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Team accounts aren&apos;t available on your account yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6" /> Team
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {canManage
              ? "Invite colleagues and choose what each one can do. Final hiring decisions can be kept to the people you trust with them."
              : "People in your hiring team."}
          </p>
        </div>
        {canManage && (
          <button className={btnPrimary} onClick={() => setEditing("new")}>
            <MailPlus className="w-4 h-4" /> Invite member
          </button>
        )}
      </div>

      {isTeamMember && actor && <MyAccount />}

      {canManage ? (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Jobs</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700/60">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{people[0]?.name ?? "Owner"}</div>
                  <div className="text-xs text-gray-500">Account owner</div>
                </td>
                <td className="px-4 py-3">Owner</td>
                <td className="px-4 py-3">All</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE.active}`}>active</span></td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
              </tr>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-100 dark:border-gray-700/60 last:border-0 ${isFormer(m) ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{m.full_name}</div>
                    <div className="text-xs text-gray-500">{m.email}{m.job_title ? ` · ${m.job_title}` : ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    {roleName(m.role)}
                    {(m.grants.length > 0 || m.revokes.length > 0) && (
                      <span className="ml-1 text-xs text-gray-500">(customised)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{m.job_scope === "all" ? "All" : `${m.job_ids.length} assigned`}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[m.status] ?? ""}`}>
                      {isFormer(m) ? `former (${m.status})` : m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {isFormer(m) && m.ended_at
                      ? `Until ${new Date(m.ended_at + "Z").toLocaleDateString()}`
                      : m.last_login_at ? new Date(m.last_login_at + "Z").toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 relative">
                    {!isFormer(m) && (<>
                    <button
                      aria-label={`Actions for ${m.full_name}`}
                      className={btnGhost}
                      onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuFor === m.id && (
                      <div
                        className="absolute right-4 z-20 mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
                        onMouseLeave={() => setMenuFor(null)}
                      >
                        <button className={`${btnGhost} w-full`} onClick={() => { setMenuFor(null); setEditing(m); }}>
                          <UserCog className="w-4 h-4" /> Edit access
                        </button>
                        {m.status === "invited" && (
                          <button
                            className={`${btnGhost} w-full`}
                            onClick={() => { setMenuFor(null); act(() => teamApi.resendInvite(m.id), "Invitation resent"); }}
                          >
                            <RotateCw className="w-4 h-4" /> Resend invite
                          </button>
                        )}
                        {m.status === "suspended" ? (
                          <button
                            className={`${btnGhost} w-full`}
                            onClick={() => { setMenuFor(null); act(() => teamApi.reactivate(m.id), "Member reactivated"); }}
                          >
                            <PlayCircle className="w-4 h-4" /> Reactivate
                          </button>
                        ) : (
                          <button
                            className={`${btnGhost} w-full`}
                            onClick={() => { setMenuFor(null); setConfirm({ member: m, action: "suspend" }); }}
                          >
                            <PauseCircle className="w-4 h-4" /> Suspend
                          </button>
                        )}
                        <button
                          className={`${btnGhost} w-full text-red-600`}
                          onClick={() => { setMenuFor(null); setConfirm({ member: m, action: "remove" }); }}
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    )}
                    </>)}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No team members yet. Invite a colleague to share the work.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {people.map((p) => (
            <div key={p.key} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                {p.job_title && <div className="text-xs text-gray-500">{p.job_title}</div>}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{p.role_name}</span>
            </div>
          ))}
        </section>
      )}

      {canManage && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <History className="w-5 h-5" /> Recent activity
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {activity.length === 0 && <p className="px-4 py-6 text-sm text-gray-500">Nothing yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="px-4 py-2.5 text-sm flex flex-wrap justify-between gap-2">
                <span className="text-gray-800 dark:text-gray-200">
                  <span className="font-medium">{a.actor_name}</span>{" "}
                  {ACTION_LABEL[a.action] ?? a.action}
                  {a.action === "application.status" && a.meta?.to ? (
                    <span className="text-gray-500"> → {String(a.meta.to).replace(/_/g, " ")}</span>
                  ) : null}
                </span>
                <span className="text-xs text-gray-500">{a.created_at ? new Date(a.created_at + "Z").toLocaleString() : ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {editing && catalog && (
        <MemberDialog
          catalog={catalog}
          jobs={jobs}
          member={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            setEditing(null);
            showToast(msg, "success");
            await load();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          const c = confirm;
          setConfirm(null);
          if (!c) return;
          if (c.action === "remove") act(() => teamApi.remove(c.member.id), "Member removed");
          else act(() => teamApi.suspend(c.member.id), "Member suspended");
        }}
        title={confirm?.action === "remove" ? `Remove ${confirm?.member.full_name}?` : `Suspend ${confirm?.member.full_name}?`}
        message={
          confirm?.action === "remove"
            ? "They lose access to your company straight away. Their notes and activity stay, with their name. Access they have to other companies on PreviewCV isn't affected."
            : "They can't use your company's account until reactivated. Other companies they work for aren't affected."
        }
        confirmText={confirm?.action === "remove" ? "Remove" : "Suspend"}
        variant="danger"
      />
    </div>
  );
}

/** Member's own name, title and password. */
function MyAccount() {
  const { actor, recruiter, signInWithTokens, logout } = useRecruiterAuth();
  const [leaving, setLeaving] = useState(false);
  const { showToast } = useToast();
  const [name, setName] = useState(actor?.name ?? "");
  const [title, setTitle] = useState(actor?.job_title ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    try {
      await api.request("/api/v1/recruiters/team/me", { method: "PUT", body: JSON.stringify({ full_name: name, job_title: title }) }, true, true);
      showToast("Profile saved", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't save", "error");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setBusy(true);
    try {
      const r = await api.request<{ access_token: string; refresh_token: string }>(
        "/api/v1/recruiters/team/me/change-password",
        { method: "POST", body: JSON.stringify({ current_password: current, new_password: next }) },
        true, true,
      );
      await signInWithTokens(r.access_token, r.refresh_token);
      setCurrent("");
      setNext("");
      showToast("Password changed. Other devices were signed out.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't change the password", "error");
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setLeaving(false);
    setBusy(true);
    try {
      const left = await teamApi.leave();
      const next = left.find((c) => c.status === "active");
      if (next) {
        const s = await teamApi.switchCompany(next.member_id).catch(() => null);
        if (s) {
          await signInWithTokens(s.access_token, s.refresh_token);
          window.location.assign("/recruiter/dashboard");
          return;
        }
      }
      await logout();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't leave the company", "error");
      setBusy(false);
    }
  };

  const companyName = recruiter?.company_name || "this company";

  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">My profile</h3>
        <p className="text-xs text-gray-500">
          {actor?.email} · {actor?.role_name}. Your name and password are the same for every company you work for.
        </p>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        <input className={inputCls} value={title ?? ""} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" />
        <button className={btnPrimary} disabled={busy || !name.trim()} onClick={saveProfile}>Save</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><KeyRound className="w-4 h-4" /> Password</h3>
        <input className={inputCls} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" autoComplete="current-password" />
        <input className={inputCls} type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" />
        <button className={btnPrimary} disabled={busy || !current || next.length < 8} onClick={changePassword}>Change password</button>
      </div>
      <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Leave {companyName}</h3>
          <p className="text-xs text-gray-500">
            You lose access to this company. Your notes stay with the team. Other companies you work for aren&apos;t affected.
          </p>
        </div>
        <button className={`${btnGhost} text-red-600 border border-red-200 dark:border-red-900`} disabled={busy} onClick={() => setLeaving(true)}>
          <LogOut className="w-4 h-4" /> Leave company
        </button>
      </div>
      <ConfirmDialog
        isOpen={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={leave}
        title={`Leave ${companyName}?`}
        message="You'll need a new invitation to come back."
        confirmText="Leave"
        variant="danger"
      />
    </section>
  );
}

/** Invite / edit: role, job access, per-permission tweaks. */
function MemberDialog({
  catalog, jobs, member, onClose, onSaved,
}: {
  catalog: TeamCatalog;
  jobs: Job[];
  member: TeamMember | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const { showToast } = useToast();
  const [isMax, setIsMax] = useState(false);
  const [email, setEmail] = useState(member?.email ?? "");
  const [fullName, setFullName] = useState(member?.full_name ?? "");
  const [jobTitle, setJobTitle] = useState(member?.job_title ?? "");
  const [role, setRole] = useState(member?.role ?? "recruiter");
  const [scope, setScope] = useState<"all" | "assigned">(member?.job_scope ?? "all");
  const [jobIds, setJobIds] = useState<number[]>(member?.job_ids ?? []);
  const [grants, setGrants] = useState<string[]>(member?.grants ?? []);
  const [revokes, setRevokes] = useState<string[]>(member?.revokes ?? []);
  const [showPerms, setShowPerms] = useState(!!member && (member.grants.length > 0 || member.revokes.length > 0));
  const [saving, setSaving] = useState(false);

  const roleDef = catalog.roles.find((r) => r.key === role);
  const base = useMemo(() => new Set(roleDef?.permissions ?? []), [roleDef]);
  const effective = (key: string) => (base.has(key) || grants.includes(key)) && !revokes.includes(key);

  const toggle = (key: string) => {
    const on = effective(key);
    if (base.has(key)) {
      setRevokes((r) => (on ? [...r, key] : r.filter((x) => x !== key)));
      setGrants((g) => g.filter((x) => x !== key));
    } else {
      setGrants((g) => (on ? g.filter((x) => x !== key) : [...g, key]));
      setRevokes((r) => r.filter((x) => x !== key));
    }
  };

  const groups = useMemo(() => {
    const out: Record<string, typeof catalog.permissions> = {};
    for (const p of catalog.permissions) (out[p.group] ??= []).push(p);
    return out;
  }, [catalog]);

  const save = async () => {
    setSaving(true);
    const input: TeamMemberInput = {
      full_name: fullName.trim(),
      job_title: jobTitle.trim() || null,
      role,
      job_scope: scope,
      job_ids: scope === "assigned" ? jobIds : [],
      grants: grants.filter((g) => !base.has(g)),
      revokes: revokes.filter((r) => base.has(r)),
    };
    try {
      if (member) {
        await teamApi.update(member.id, input);
        onSaved("Access updated");
      } else {
        await teamApi.invite({ ...input, email: email.trim() });
        onSaved(`Invitation sent to ${email.trim()}`);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MaximizableModal
      isOpen
      onClose={onClose}
      title={member ? `Edit ${member.full_name}` : "Invite a team member"}
      isMaximized={isMax}
      setIsMaximized={setIsMax}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button
            className={btnPrimary}
            disabled={saving || !fullName.trim() || (!member && !email.trim()) || (scope === "assigned" && jobIds.length === 0)}
            onClick={save}
          >
            {member ? "Save" : "Send invitation"}
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-gray-700 dark:text-gray-300">Full name</span>
            <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-gray-700 dark:text-gray-300">Work email</span>
            <input className={inputCls} type="email" value={email} disabled={!!member} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="block mb-1 text-gray-700 dark:text-gray-300">Job title (optional)</span>
            <input className={inputCls} value={jobTitle ?? ""} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. HR Executive" />
          </label>
        </div>

        <div>
          <span className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Role</span>
          <div className="grid md:grid-cols-2 gap-2">
            {catalog.roles.map((r) => (
              <label
                key={r.key}
                className={`p-3 rounded-lg border cursor-pointer text-sm ${role === r.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}
              >
                <input type="radio" className="sr-only" checked={role === r.key} onChange={() => { setRole(r.key); setGrants([]); setRevokes([]); }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{r.name}</span>
                <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5">{r.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Which jobs?</span>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={scope === "all"} onChange={() => setScope("all")} /> All jobs</label>
            <label className="flex items-center gap-2"><input type="radio" checked={scope === "assigned"} onChange={() => setScope("assigned")} /> Only selected jobs</label>
          </div>
          {scope === "assigned" && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {jobs.length === 0 && <p className="p-3 text-sm text-gray-500">No jobs yet. Jobs this member posts are always theirs.</p>}
              {jobs.map((j) => (
                <label key={j.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={jobIds.includes(j.id)}
                    onChange={(e) => setJobIds((ids) => (e.target.checked ? [...ids, j.id] : ids.filter((x) => x !== j.id)))}
                  />
                  {j.title}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button className="text-sm text-blue-600 dark:text-blue-400" onClick={() => setShowPerms((v) => !v)}>
            {showPerms ? "Hide" : "Customise"} permissions for this person
          </button>
          {showPerms && (
            <div className="mt-3 grid md:grid-cols-2 gap-4">
              {Object.entries(groups).map(([group, perms]) => (
                <div key={group}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{group}</div>
                  {perms.map((p) => (
                    <label key={p.key} className={`flex items-start gap-2 py-1 text-sm ${p.owner_only ? "opacity-50" : ""}`}>
                      <input type="checkbox" disabled={p.owner_only} checked={!p.owner_only && effective(p.key)} onChange={() => toggle(p.key)} />
                      <span>
                        {p.label}
                        {p.owner_only && <span className="text-xs text-gray-500"> (owner only)</span>}
                        {!p.owner_only && base.has(p.key) !== effective(p.key) && (
                          <span className="text-xs text-amber-600"> (changed)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MaximizableModal>
  );
}

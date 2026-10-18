"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, MessageSquarePlus, Pencil, Trash2, ThumbsUp } from "lucide-react";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import { teamApi, isTeamUnavailable } from "@/lib/teamApi";
import { applicationStatusLabel } from "@/lib/applicationStatus";
import type { NoteTargetType, TeamNote, TeamPerson } from "@/types/team";

const MAX = 5000;
const RECOMMENDABLE = ["shortlisted", "interview_scheduled", "offered", "rejected"] as const;

interface Props {
  targetType: NoteTargetType;
  targetId: number;
}

/**
 * Internal team notes on an application or talent profile. Never shown to the
 * candidate. Members without final-decision rights can add a recommendation,
 * which notifies the people who can decide.
 */
export default function TeamNotesPanel({ targetType, targetId }: Props) {
  const { can, actor, teamsEnabled } = useRecruiterAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<TeamNote[] | null>(null);
  const [people, setPeople] = useState<TeamPerson[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [body, setBody] = useState("");
  const [recommend, setRecommend] = useState<string>("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ id: number; body: string } | null>(null);

  const canView = teamsEnabled && can("notes.view");
  const canWrite = can("notes.write");
  const isApplication = targetType === "application";

  const load = useCallback(async () => {
    try {
      const [n, p] = await Promise.all([teamApi.notes(targetType, targetId), teamApi.directory()]);
      setNotes(n);
      setPeople(p);
    } catch (e) {
      if (isTeamUnavailable(e)) setUnavailable(true);
      else setNotes([]);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  // Teams not enabled on the backend yet, or no permission: render nothing.
  if (!canView || unavailable) return null;

  const others = people.filter((p) => p.key !== (actor?.type === "member" ? `m:${actor.member_id}` : "owner"));

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    try {
      const note = await teamApi.addNote({
        target_type: targetType,
        target_id: targetId,
        body: text,
        kind: recommend ? "recommendation" : "note",
        recommended_status: recommend || undefined,
        mentions,
      });
      setNotes((prev) => [...(prev ?? []), note]);
      setBody("");
      setRecommend("");
      setMentions([]);
      showToast(recommend ? "Recommendation sent to the decision makers" : "Note added", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't add the note", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const note = await teamApi.editNote(editing.id, editing.body.trim());
      setNotes((prev) => (prev ?? []).map((n) => (n.id === note.id ? note : n)));
      setEditing(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't save the note", "error");
    }
  };

  const remove = async (id: number) => {
    try {
      await teamApi.deleteNote(id);
      setNotes((prev) => (prev ?? []).filter((n) => n.id !== id));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't delete the note", "error");
    }
  };

  const name = (key: string) => people.find((p) => p.key === key)?.name ?? "Teammate";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team notes</h4>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
          <Lock className="w-3 h-3" /> Only your team sees these
        </span>
      </div>

      <div className="space-y-3 mt-3">
        {notes === null && <p className="text-sm text-gray-500">Loading…</p>}
        {notes?.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
        {notes?.map((n) => (
          <div
            key={n.id}
            className={`p-3 rounded-lg border text-sm ${
              n.kind === "recommendation"
                ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700"
                : "border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{n.author.name}</span>
                {n.created_at && <> · {new Date(n.created_at + "Z").toLocaleString()}</>}
                {n.updated_at && " · edited"}
              </div>
              <div className="flex items-center gap-1">
                {n.can_edit && (
                  <button
                    aria-label="Edit note"
                    onClick={() => setEditing({ id: n.id, body: n.body })}
                    className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {n.can_delete && (
                  <button
                    aria-label="Delete note"
                    onClick={() => remove(n.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {n.kind === "recommendation" && n.recommended_status && (
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
                <ThumbsUp className="w-3.5 h-3.5" /> Recommends: {applicationStatusLabel(n.recommended_status)}
              </div>
            )}
            {editing?.id === n.id ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editing.body}
                  maxLength={MAX}
                  rows={3}
                  onChange={(e) => setEditing({ id: n.id, body: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1.5 bg-primary-blue text-white rounded-lg text-xs font-medium">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{n.body}</p>
            )}
            {n.mentions.length > 0 && (
              <p className="mt-1 text-[11px] text-gray-500">Notified: {n.mentions.map(name).join(", ")}</p>
            )}
          </div>
        ))}
      </div>

      {canWrite && (
        <div className="mt-4 space-y-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={recommend ? "Why do you recommend this?" : "Add a note for your team…"}
            rows={3}
            maxLength={MAX}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            {isApplication && (
              <select
                value={recommend}
                onChange={(e) => setRecommend(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                aria-label="Recommend a decision"
              >
                <option value="">Plain note</option>
                {RECOMMENDABLE.map((s) => (
                  <option key={s} value={s}>
                    Recommend: {applicationStatusLabel(s)}
                  </option>
                ))}
              </select>
            )}
            {others.length > 0 && (
              <select
                value=""
                onChange={(e) => e.target.value && setMentions((m) => [...new Set([...m, e.target.value])])}
                className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                aria-label="Notify a teammate"
              >
                <option value="">Notify a teammate…</option>
                {others.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} ({p.role_name})
                  </option>
                ))}
              </select>
            )}
            {mentions.map((k) => (
              <button
                key={k}
                onClick={() => setMentions((m) => m.filter((x) => x !== k))}
                className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                title="Remove"
              >
                @{name(k)} ×
              </button>
            ))}
            <button
              onClick={submit}
              disabled={saving || !body.trim()}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-blue hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {recommend ? "Send recommendation" : "Add note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

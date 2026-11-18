"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

/**
 * Candidate "New job alerts" switch (backend GET/PUT /api/v1/notifications/preferences).
 * On by default; flips at once, goes back if saving fails, and is disabled while saving.
 */
export default function CandidateJobAlertsSetting() {
    const { success, error } = useToast();
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoadFailed(false);
        try {
            const prefs = await api.getNotificationPreferences();
            setEnabled(prefs.job_alerts);
        } catch {
            setLoadFailed(true);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async () => {
        if (saving || enabled === null) return;
        const previous = enabled;
        const next = !enabled;
        setEnabled(next);
        setSaving(true);
        try {
            const saved = await api.updateNotificationPreferences({ job_alerts: next });
            setEnabled(saved.job_alerts);
            success(next ? "Job alerts turned on" : "Job alerts turned off");
        } catch {
            setEnabled(previous);
            error("Couldn't save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const on = enabled ?? true;
    const disabled = enabled === null || saving;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-gray-900">Notifications</h3>
            </div>

            <div className="p-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">New job alerts</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Get a notification when a new job that suits you is posted
                    </p>
                    {loadFailed ? (
                        <p className="text-sm mt-1">
                            <span className="text-red-600">Couldn&apos;t load this setting. </span>
                            <button
                                type="button"
                                onClick={load}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                Retry
                            </button>
                        </p>
                    ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {saving || (enabled === null && !loadFailed) ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : null}
                    <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label="New job alerts"
                        disabled={disabled}
                        onClick={toggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${on ? "bg-indigo-600" : "bg-gray-200"}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

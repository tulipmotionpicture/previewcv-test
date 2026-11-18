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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose what we notify you about
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">New job alerts</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get a notification when a new job that suits you is posted
                    </p>
                    {loadFailed ? (
                        <p className="text-sm mt-1">
                            <span className="text-red-600 dark:text-red-400">Couldn&apos;t load this setting. </span>
                            <button
                                type="button"
                                onClick={load}
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${on ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`}
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

"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Application } from "@/types/api";

interface ApplicationsListProps {
    applications: Application[];
    loading: boolean;
}

export default function ApplicationsList({ applications, loading }: ApplicationsListProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    No applications yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start applying to jobs to see your applications here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app) => (
                <div
                    key={app.id}
                    className="border-2 border-gray-300 dark:border-gray-800 p-6"
                >
                    <div className="flex items-center justify-between">
                        {/* Left side - Avatar and Info */}
                        <div className="flex items-center gap-4 flex-1">
                            {/* Circular Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {app.company_name?.charAt(0).toUpperCase() ||
                                    app.job?.company_name?.charAt(0).toUpperCase() ||
                                    "G"}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    {app.job_title || app.job?.title || `Job #${app.job_id}`}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {app.company_name || app.job?.company_name || "Company"}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(app.applied_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Status and Action */}
                        <div className="flex items-center gap-4">
                            {/* Status Badge */}
                            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                                {app.status === "applied" ? "Applied" : app.status.replace("_", " ")}
                            </span>

                            {/* View Job Link */}
                            <Link
                                href={`/job/${app.job_slug}`}
                                className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 underline transition-colors"
                            >
                                View Job
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

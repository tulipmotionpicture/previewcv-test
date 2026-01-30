"use client";

import Link from "next/link";
import { Calendar, Briefcase, Building2, ExternalLink, FileText } from "lucide-react";
import { Application } from "@/types/api";

interface ApplicationsListProps {
    applications: Application[];
    loading: boolean;
}

export default function ApplicationsList({ applications, loading }: ApplicationsListProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0369A1] border-t-transparent"></div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                    <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-2">
                    No applications yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start applying to jobs to see your applications here
                </p>
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-lg transition-colors duration-150 cursor-pointer"
                >
                    <Briefcase className="w-5 h-5" />
                    Browse Jobs
                </Link>
            </div>
        );
    }

    // Status color mapping - Flat design colors
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "applied":
                return "bg-[#0EA5E9] text-white";
            case "reviewing":
            case "in_review":
                return "bg-[#F59E0B] text-white";
            case "interview":
                return "bg-[#8B5CF6] text-white";
            case "accepted":
            case "hired":
                return "bg-[#22C55E] text-white";
            case "rejected":
                return "bg-[#EF4444] text-white";
            default:
                return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
        }
    };

    return (
        <div className="space-y-3">
            {applications.map((app) => (
                <div
                    key={app.id}
                    className="group bg-white dark:bg-gray-900 rounded-lg border border-teal-600 dark:border-gray-800 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] transition-all duration-150 overflow-hidden cursor-pointer"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left side - Avatar and Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Company Avatar - Flat Design */}
                                <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {app.company_name?.charAt(0).toUpperCase() ||
                                        app.job?.company_name?.charAt(0).toUpperCase() ||
                                        "C"}
                                </div>

                                {/* Job Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150">
                                        {app.job_title || app.job?.title || `Job #${app.job_id}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <Building2 className="w-4 h-4" />
                                        <span className="truncate">
                                            {app.company_name || app.job?.company_name || "Company"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            Applied {new Date(app.applied_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Status and Action */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Status Badge - Flat Design */}
                                <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${getStatusColor(app.status)}`}>
                                    {app.status === "applied" ? "Applied" : app.status.replace("_", " ")}
                                </span>

                                {/* View Job Link - Flat Design */}
                                <Link
                                    href={`/job/${app.job_slug}`}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-teal-600 dark:text-[#0EA5E9] text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                                >
                                    View Job
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";

import Link from "next/link";
import { Briefcase, Building2, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { Job } from "@/types/api";

interface RelevantJobsProps {
    jobs: Job[];
    loading: boolean;
}

export default function RelevantJobs({ jobs, loading }: RelevantJobsProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No relevant jobs found at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
                <Link
                    key={job.id}
                    href={`/job/${job.slug}`}
                    className="group block bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] transition-all duration-150 shadow-sm hover:shadow-md"
                >
                    <div className="flex items-start gap-3">
                        {/* Company Logo Placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-[#F0F9FF] dark:bg-gray-800 flex items-center justify-center text-[#0369A1] group-hover:bg-[#0369A1] group-hover:text-white transition-colors duration-150 flex-shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150">
                                {job.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 truncate">
                                {job.company_name}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#0369A1] dark:text-[#0EA5E9] uppercase">
                                    <Briefcase className="w-3 h-3" />
                                    {job.job_type.replace("_", " ")}
                                </span>
                            </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0369A1] transition-colors duration-150 self-center" />
                    </div>
                </Link>
            ))}

            <Link
                href="/jobs"
                className="block text-center py-2 text-xs font-bold text-[#0369A1] dark:text-[#0EA5E9] hover:underline transition-all duration-150 mt-2"
            >
                View All Recommendations
            </Link>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { Building2, MapPin, DollarSign, Clock } from "lucide-react";

interface JobDetailsSidebarProps {
    currentJob?: Job;
}

export default function JobDetailsSidebar({ currentJob }: JobDetailsSidebarProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJobs() {
            try {
                const params = new URLSearchParams();
                params.append("limit", "6"); // Fetch extra to allow filtering

                if (currentJob) {
                    if (currentJob.job_type) {
                        params.append("job_type", currentJob.job_type);
                    }
                    if (currentJob.experience_level) {
                        params.append("experience_level", currentJob.experience_level);
                    }
                    // Note: Add more filters like category if available in API
                }

                const response = await api.getJobs(params);
                let fetchedJobs = response.jobs || [];

                // Filter out the current job if present
                if (currentJob) {
                    fetchedJobs = fetchedJobs.filter((j) => j.id !== currentJob.id);
                }

                setJobs(fetchedJobs.slice(0, 5));
            } catch (error) {
                console.error("Failed to load jobs:", error);
            } finally {
                setLoading(false);
            }
        }

        loadJobs();
    }, [currentJob]);

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        return "Just now";
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Similar/Recent Jobs Widget */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {currentJob ? "Similar Jobs" : "Recent Jobs"}
                    </h2>
                </div>

                <div className="p-2">
                    {loading ? (
                        <div className="space-y-3 p-2">
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : jobs.length > 0 ? (
                        <div className="flex flex-col">
                            {jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/job/${job.slug}`}
                                    className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0 p-1.5">
                                        {job.company_logo_url ? (
                                            <Image
                                                src={job.company_logo_url}
                                                alt={job.company_name}
                                                width={40}
                                                height={40}
                                                className="object-contain w-full h-full"
                                            />
                                        ) : (
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors leading-tight mb-1">
                                            {job.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">
                                            {job.company_name}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getTimeAgo(job.posted_date)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No similar jobs found
                        </div>
                    )}
                </div>
            </div>

            {/* Create Resume Card */}
            <Link href="/resume/build" className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-5 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-base font-bold text-blue-700 dark:text-blue-400 mb-0.5">Create Resume</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Build a new cv profile</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-none group-hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                    </div>
                </div>
            </Link>

            {/* Create Cover Letter Card */}
            <Link href="/cover-letter/create" className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-5 border border-purple-100 dark:border-purple-900/30 hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-0.5">Create Cover letter</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI-assisted drafting</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-purple-200 dark:shadow-none group-hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <path d="M2 2l7.586 7.586" />
                            <circle cx="11" cy="11" r="2" />
                        </svg>
                    </div>
                </div>
            </Link>
        </div>
    );
}

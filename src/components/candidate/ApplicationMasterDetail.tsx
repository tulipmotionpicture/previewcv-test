import React, { useState, useEffect } from "react";
import { Application } from "@/types/api";
import { Job } from "@/types/jobs";
import ApplicationSidebarCard from "./ApplicationSidebarCard";
import ApplicationDetailView from "./ApplicationDetailView";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api"; // Ensure this import is correct

interface ApplicationMasterDetailProps {
    applications: Application[];
    loading: boolean;
    pagination?: {
        page: number;
        total_pages: number;
        has_more: boolean;
        has_previous: boolean;
    };
    onPageChange?: (direction: "next" | "prev") => void;
}

const ApplicationMasterDetail: React.FC<ApplicationMasterDetailProps> = ({
    applications,
    loading,
    pagination,
    onPageChange,
}) => {
    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(
        null
    );
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [similarJobs, setSimilarJobs] = useState<Job[]>([]);

    // Set initial selected application
    useEffect(() => {
        if (applications.length > 0 && !selectedApplicationId) {
            setSelectedApplicationId(applications[0].id);
        }
    }, [applications]);

    // Fetch similar jobs when selection changes
    useEffect(() => {
        if (selectedApplicationId) {
            const app = applications.find(a => a.id === selectedApplicationId);
            const params: any = { limit: 4 };

            // Add context for better recommendations if available
            if (app) {
                if (app.job_type) params.job_type = app.job_type;
                if (app.experience_level) params.experience_level = app.experience_level;
                // If we had country code, we could add it here.
                // Assuming job object is populated
                if (app.job?.country) params.country = app.job.country;
            }

            api.getRelevantJobs(params).then(res => {
                if (res.success && res.jobs) {
                    setSimilarJobs(res.jobs || []);
                }
            }).catch(err => console.error("Failed to fetch similar jobs", err));
        }
    }, [selectedApplicationId, applications]);

    const selectedApplication = applications.find(
        (app) => app.id === selectedApplicationId
    );

    const filteredApplications = applications.filter((app) => {
        const matchesSearch = (app.job_title || app.job?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.company_name || app.job?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === "Recruiter Actions") {
            return matchesSearch && (app.recruiter_viewed || app.status === "interview_scheduled" || app.status === "offered");
        }
        // Add other filters as needed
        return matchesSearch;
    });

    if (loading) {
        return <div className="p-10 text-center">Loading applications...</div>;
    }

    if (applications.length === 0) {
        return <div className="p-10 text-center text-gray-500">No applications found.</div>;
    }

    return (
        <div className="flex sticky top-5 h-[calc(100vh-100px)] bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Sidebar List */}
            <div className="w-1/3 min-w-[320px] border-r border-slate-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
                {/* Filters & Search */}
                <div className="p-4 border-b border-slate-100 dark:border-gray-800 space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {["All", "Recruiter Actions", "Active"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filter === f
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                    : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:bg-slate-50"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {/* Header Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                            <span>Showing page {pagination.page} of {pagination.total_pages}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onPageChange?.("prev")}
                                    disabled={!pagination.has_previous}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onPageChange?.("next")}
                                    disabled={!pagination.has_more}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredApplications.map((app) => (
                        <ApplicationSidebarCard
                            key={app.id}
                            application={app}
                            isSelected={app.id === selectedApplicationId}
                            onClick={() => setSelectedApplicationId(app.id)}
                        />
                    ))}
                    {filteredApplications.length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No applications found matching your criteria.
                        </div>
                    )}
                </div>


                {/* Pagination Controls */}
                {pagination && pagination.total_pages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                        <button
                            onClick={() => onPageChange?.("prev")}
                            disabled={!pagination.has_previous}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">
                            Page {pagination.page} / {pagination.total_pages}
                        </span>
                        <button
                            onClick={() => onPageChange?.("next")}
                            disabled={!pagination.has_more}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Detail View */}
            <div className="flex-1 bg-white dark:bg-gray-900 h-full overflow-hidden flex flex-col">
                {selectedApplication ? (
                    <ApplicationDetailView
                        application={selectedApplication}
                        similarJobs={similarJobs}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select an application to view details
                    </div>
                )}
            </div>
        </div >
    );
};

export default ApplicationMasterDetail;

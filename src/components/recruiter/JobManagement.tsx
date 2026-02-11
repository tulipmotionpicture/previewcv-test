"use client";

import { useState, useEffect } from "react";
import { Job } from "@/types/api";
import {
  Search,
  MapPin,
  Calendar,
  MoreHorizontal,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import CreateJobModal from "./CreateJobModal";

export type JobManagementTab = "create" | "manage";

export type JobFormState = {
  title: string;
  country: string;
  state: string;
  city: string;
  job_type:
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "temporary"
  | "freelance"
  | "other";
  experience_level:
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "director"
  | "executive";
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  is_remote: boolean;
  required_skills: string;
  preferred_skills: string;
  categories: string;
};

export const JOB_FORM_INITIAL: JobFormState = {
  title: "",
  country: "",
  state: "",
  city: "",
  job_type: "full_time",
  experience_level: "entry",
  description: "",
  requirements: "",
  responsibilities: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  is_remote: false,
  required_skills: "",
  preferred_skills: "",
  categories: "",
};

export interface JobFilters {
  is_active?: boolean | null;
  posted_date_from?: string;
  posted_date_to?: string;
  application_deadline_from?: string;
  application_deadline_to?: string;
  search_keyword?: string;
}

interface JobManagementProps {
  jobs: Job[];
  loadingJobs: boolean;
  jobForm: JobFormState;
  creatingJob: boolean;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  filters: JobFilters;
  activeView?: JobManagementTab;
  onViewChange?: (view: JobManagementTab) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: JobFilters) => void; // ... (rest remains)
  onJobFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onCreateJob: (e: React.FormEvent) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: number) => void;
  onViewApplications: (jobId: number) => void;
}

export default function JobManagement({
  jobs,
  loadingJobs,
  jobForm,
  creatingJob,
  totalJobs,
  currentPage,
  totalPages,
  filters,
  onPageChange,
  onFiltersChange,
  onJobFormChange,
  onCreateJob,
  onEditJob,
  onDeleteJob,
  onViewApplications,
  activeView,
  onViewChange,
}: JobManagementProps) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<JobManagementTab>("manage");

  const activeTab = activeView !== undefined ? activeView : internalActiveTab;

  const handleTabChange = (tab: JobManagementTab) => {
    if (onViewChange) {
      onViewChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Local state for debounced search (updates UI instantly, triggers API after 500ms)
  const [localSearch, setLocalSearch] = useState(filters.search_keyword || "");

  // Debounce search timeout
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Sync localSearch when filters change externally (e.g., clear filters)
  useEffect(() => {
    setLocalSearch(filters.search_keyword || "");
  }, [filters.search_keyword]);

  // State for tracking which job's menu is open
  const [openMenuJobId, setOpenMenuJobId] = useState<number | null>(null);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search_keyword: val,
      });
    }, 500);
    setSearchTimeout(timeout);
  };

  // Helper for relative time
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CreateJobModal
        isOpen={activeTab === "create"}
        onClose={() => handleTabChange("manage")}
        jobForm={jobForm}
        onChange={onJobFormChange}
        onSubmit={onCreateJob}
        isSubmitting={creatingJob}
      />

      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
        </div>
        <button
          onClick={() => handleTabChange("create")}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Job Table - Takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700  overflow-hidden flex flex-col sticky top-5 h-[calc(100vh-140px)]">
            <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
              {loadingJobs ? (
                <div className="text-center py-12 text-gray-500">
                  Loading jobs...
                </div>
              ) : jobs.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      {["ROLE", "STATUS", "LOCATION", "POSTED", "ACTIONS"].map(
                        (heading, index) => (
                          <th
                            key={heading}
                            className={`px-4 py-3 text-xs bg-[#101828] font-bold text-white dark:text-gray-500 uppercase tracking-wider ${index === 4 ? "text-right" : "text-left"
                              }`}
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        {/* Role */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                            {job.title}
                          </div>
                          <div className="text-xs text-[#60768D] dark:text-gray-400 mt-1 capitalize">
                            Engineering {job.job_type.replace(/_/g, " ")}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${job.is_active
                              ? "bg-[#E6F4EA] text-[#1E7F3A] dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                          >
                            {job.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {/* Location */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {job.location}
                          </div>
                        </td>
                        {/* Posted */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatTimeAgo(
                              job.posted_date || new Date().toISOString(),
                            )}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuJobId(
                                  openMenuJobId === job.id ? null : job.id,
                                );
                              }}
                              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                            </button>

                            {openMenuJobId === job.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuJobId(null)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1E1E1E] shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        onEditJob(job);
                                        setOpenMenuJobId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                      </svg>
                                      Edit Job
                                    </button>
                                    <button
                                      onClick={() => {
                                        onViewApplications(job.id);
                                        setOpenMenuJobId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View Applications
                                    </button>
                                    <button
                                      onClick={() => {
                                        onDeleteJob(job.id);
                                        setOpenMenuJobId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Deactivate Job
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No jobs found.</p>
                </div>
              )}
            </div>

            {/* Pagination Footter */}
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center justify-between bg-white dark:bg-[#282727] rounded-b-xl mt-auto">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, start + maxVisible - 1);
                    if (end - start < maxVisible - 1) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters - Takes 1 column */}

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#282727]  rounded-xl border border-[#E1E8F1] dark:border-gray-700  space-y-6">
            {/* Search by Role */}

            <h1 className="bg-[#101828]  text-[13px] font-bold text-white dark:text-gray-500 uppercase tracking-wider p-3 rounded-t-xl">
              Filter
            </h1>
            <div className="px-2">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search Jobs
                </label>
                <Search className="absolute left-3 translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by title, location, skills..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Date Filters - Functional */}
            <div className="px-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Posted Between
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.posted_date_from || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        posted_date_from: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <input
                    type="date"
                    value={filters.posted_date_to || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        posted_date_to: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setLocalSearch("");
                  onFiltersChange({
                    is_active: null,
                    posted_date_from: "",
                    posted_date_to: "",
                    application_deadline_from: "",
                    application_deadline_to: "",
                    search_keyword: "",
                  });
                }}
                className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

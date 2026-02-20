"use client";

import { useState, useEffect } from "react";
import { Job } from "@/types/api";
import { Search, Plus } from "lucide-react";
import CreateJobModal from "./CreateJobModal";
import JobsTable from "./JobsTable";

export type JobManagementTab = "create" | "manage";

export type JobFormState = {
  title: string;
  country: string;
  countryCode?: string;
  state: string;
  stateCode?: string;
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
  countryCode: "",
  state: "",
  stateCode: "",
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
        <div></div>
        <button
          onClick={() => handleTabChange("create")}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Job Table - Takes 3 columns */}
        <div className="lg:col-span-3">
          <JobsTable
            jobs={jobs}
            loadingJobs={loadingJobs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
            onViewApplications={onViewApplications}
          />
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

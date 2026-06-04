"use client";

import { useState, useEffect, useMemo } from "react";
import { Job } from "@/types/api";
import { Plus, ChevronDown } from "lucide-react";
import { SearchSuggestInput } from "@/components/ui";
import JobModal from "./JobModal";
import JobsTable from "./JobsTable";

export type JobManagementTab = "create" | "manage";

export type JobFormState = {
  title: string;
  company_name: string;
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
  salary_type: "hourly" | "weekly" | "monthly" | "yearly";
  is_remote: boolean;
  is_active: boolean;
  required_skills: string;
  preferred_skills: string;
  categories: string;
};

export const JOB_FORM_INITIAL: JobFormState = {
  title: "",
  company_name: "",
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
  salary_type: "yearly",
  is_remote: false,
  is_active: true,
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
  onCreateNewJob?: () => void;
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
  onCreateNewJob,
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

  // Today (UTC date) used to cap the date pickers.
  const today = new Date().toISOString().split("T")[0];

  // Map the tri-state is_active filter to/from a select value.
  const statusValue =
    filters.is_active == null ? "all" : filters.is_active ? "active" : "inactive";

  const handleStatusChange = (val: string) => {
    onFiltersChange({
      ...filters,
      is_active: val === "all" ? null : val === "active",
    });
  };

  // Count of applied filters — drives the header badge and the Clear button.
  const activeFilterCount = [
    !!filters.search_keyword,
    filters.is_active != null,
    !!filters.posted_date_from,
    !!filters.posted_date_to,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setLocalSearch("");
    onFiltersChange({
      is_active: null,
      posted_date_from: "",
      posted_date_to: "",
      application_deadline_from: "",
      application_deadline_to: "",
      search_keyword: "",
    });
  };

  // Autocomplete suggestions derived from the loaded jobs (titles, locations, skills).
  const searchSuggestions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.title) set.add(j.title);
      if (j.location) set.add(j.location);
      (j.required_skills || []).forEach((s) => s && set.add(s));
      (j.preferred_skills || []).forEach((s) => s && set.add(s));
    });
    return Array.from(set);
  }, [jobs]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <JobModal
        isOpen={activeTab === "create"}
        onClose={() => handleTabChange("manage")}
        job={null}
        onSave={async (_, data) => {
          const e = {
            preventDefault: () => {},
            target: {},
          } as any;

          Object.keys(data).forEach((key) => {
            const event = {
              target: {
                name: key,
                value: (data as any)[key],
                type:
                  typeof (data as any)[key] === "boolean" ? "checkbox" : "text",
                checked:
                  typeof (data as any)[key] === "boolean"
                    ? (data as any)[key]
                    : undefined,
              },
            };
            onJobFormChange(event as any);
          });
          setTimeout(() => {
            onCreateJob(e);
            handleTabChange("manage");
          }, 100);
        }}
        loadingJobDetails={creatingJob}
      />

      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div></div>
        <button
          onClick={() => onCreateNewJob ? onCreateNewJob() : handleTabChange("create")}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
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
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 shadow-sm sticky top-5">
            {/* Header */}
            <div className="bg-[#2F4269] px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">
                Filter
              </h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="p-4 space-y-5">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search Jobs
                </label>
                <SearchSuggestInput
                  value={localSearch}
                  onChange={handleSearchChange}
                  suggestions={searchSuggestions}
                  placeholder="Search by title, location, skills..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusValue}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Posted Between */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Posted Between
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.posted_date_from || ""}
                      max={filters.posted_date_to || today}
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
                      min={filters.posted_date_from || ""}
                      max={today}
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

              {/* Clear Filters — only when something is applied */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

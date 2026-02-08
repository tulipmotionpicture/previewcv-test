"use client";

import { useState } from "react";
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
  Filter
} from "lucide-react";

type JobManagementTab = "create" | "manage";

export type JobFormState = {
  title: string;
  location: string;
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
  location: "",
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
  title?: string;
  location?: string;
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
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: JobFilters) => void;
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
}: JobManagementProps) {
  const [activeTab, setActiveTab] = useState<JobManagementTab>("manage");

  // Local state for debounced filters
  const [localSearch, setLocalSearch] = useState(filters.title || "");
  const [localLocation, setLocalLocation] = useState(filters.location || "");

  // Debounce search inputs
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string, type: 'title' | 'location') => {
    if (type === 'title') setLocalSearch(val);
    else setLocalLocation(val);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      onFiltersChange({
        ...filters,
        title: type === 'title' ? val : localSearch,
        location: type === 'location' ? val : localLocation,
        // Reset page to 1 on filter change usually handled by parent or we should trigger it
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

  // Import specific icons
  const {
    Search,
    MapPin,
    Calendar,
    MoreHorizontal,
    Plus,
    Clock,
    ChevronLeft,
    ChevronRight,
    Filter
  } = require("lucide-react");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Create Job View */}
      {activeTab === "create" && (
        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Post New Opportunity
            </h3>
            <button
              onClick={() => setActiveTab("manage")}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={onCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="title"
                value={jobForm.title}
                onChange={onJobFormChange}
                placeholder="Job Title"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <input
                name="location"
                value={jobForm.location}
                onChange={onJobFormChange}
                placeholder="Location (e.g. Remote)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>
            {/* ... keeping form parts brief as they are unchanged usually, but I'm replacing the whole component body roughly so I need to include them or be careful with range. 
                Wait, I am replacing from 'export interface' down to end of component. 
                I need to include the full form content.
            */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select
                name="job_type"
                value={jobForm.job_type}
                onChange={onJobFormChange}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
                <option value="freelance">Freelance</option>
                <option value="other">Other</option>
              </select>
              <select
                name="experience_level"
                value={jobForm.experience_level}
                onChange={onJobFormChange}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
              <select
                name="salary_currency"
                value={jobForm.salary_currency}
                onChange={onJobFormChange}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="number"
                name="salary_min"
                value={jobForm.salary_min}
                onChange={onJobFormChange}
                placeholder="Minimum Salary"
                min="0"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                type="number"
                name="salary_max"
                value={jobForm.salary_max}
                onChange={onJobFormChange}
                placeholder="Maximum Salary"
                min="0"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="is_remote"
                checked={jobForm.is_remote}
                onChange={onJobFormChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Position is remote-friendly
            </label>

            <div>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={onJobFormChange}
                placeholder="Describe the opportunity, team, and impact."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <textarea
                name="requirements"
                value={jobForm.requirements}
                onChange={onJobFormChange}
                placeholder="Core qualifications or requirements (comma or line separated)."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={3}
              />
              <textarea
                name="responsibilities"
                value={jobForm.responsibilities}
                onChange={onJobFormChange}
                placeholder="Key responsibilities or day-to-day expectations."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                name="required_skills"
                value={jobForm.required_skills}
                onChange={onJobFormChange}
                placeholder="Required skills (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                name="preferred_skills"
                value={jobForm.preferred_skills}
                onChange={onJobFormChange}
                placeholder="Preferred skills (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                name="categories"
                value={jobForm.categories}
                onChange={onJobFormChange}
                placeholder="Categories or tags (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creatingJob}
                className="px-6 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                {creatingJob ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Jobs View */}
      {activeTab === "manage" && (
        <>
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Jobs
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome back john, Here what happening today.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("create")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Job
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Job Table - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#282727] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="overflow-x-auto flex-1">
                  {loadingJobs ? (
                    <div className="text-center py-12 text-gray-500">
                      Loading jobs...
                    </div>
                  ) : jobs.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          {[
                            "ROLE",
                            "STATUS",
                            "LOCATION",
                            "POSTED",
                            "ACTIONS"
                          ].map((heading, index) => (
                            <th
                              key={heading}
                              className={`px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${index === 4 ? "text-right" : "text-left"
                                }`}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            {/* Role */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                                {job.title}
                              </div>
                              <div className="text-xs text-[#60768D] dark:text-gray-400 mt-1 capitalize">
                                Engineering {job.job_type.replace(/_/g, " ")}
                              </div>
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${job.is_active
                                ? "bg-[#E6F4EA] text-[#1E7F3A] dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}>
                                {job.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            {/* Location */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {job.location}
                              </div>
                            </td>
                            {/* Posted */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatTimeAgo(job.posted_date || new Date().toISOString())}
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => onEditJob(job)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => onDeleteJob(job.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <button onClick={() => onViewApplications(job.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title="View Applications">
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
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
                {totalPages > 1 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filters - Takes 1 column */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Filters
              </h2>
              <div className="bg-white dark:bg-[#282727] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                {/* Search by Role */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => handleSearchChange(e.target.value, 'title')}
                      placeholder="Search by role"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={localLocation}
                      onChange={(e) => handleSearchChange(e.target.value, 'location')}
                      placeholder="e.g. Remote, New York"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Date Filters - Functional */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Posted Between</label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">From</label>
                      <input
                        type="date"
                        value={filters.posted_date_from || ""}
                        onChange={e => onFiltersChange({ ...filters, posted_date_from: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">To</label>
                      <input
                        type="date"
                        value={filters.posted_date_to || ""}
                        onChange={e => onFiltersChange({ ...filters, posted_date_to: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setLocalSearch("");
                      setLocalLocation("");
                      onFiltersChange({
                        is_active: null,
                        posted_date_from: "",
                        posted_date_to: "",
                        application_deadline_from: "",
                        application_deadline_to: "",
                        title: "",
                        location: ""
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
        </>
      )}
    </div>
  );
}

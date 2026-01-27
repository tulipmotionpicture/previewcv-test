"use client";

import { useState } from "react";
import { Job } from "@/types/api";

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
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ">
      {/* Hero Banner */}
      <div className="relative w-full h-48 mb-8 rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop"
          alt="Career Opportunities"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <h1 className="text-4xl font-bold text-white ml-12">
            Career Opportunities
          </h1>
        </div>
      </div>

      {/* Tab Navigation and Actions */}
      <div className="flex items-center justify-between mb-8">
        {activeTab === "manage" && (
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        )}
        <div
          className={`flex gap-3 justify-end ${activeTab === "create" ? "w-full" : ""}`}
        >
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "manage"
                ? "bg-teal-dark dark:bg-teal-dark text-white hover:bg-teal-700 dark:hover:bg-teal-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Manage Jobs
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "create"
                ? "bg-teal-dark dark:bg-teal-dark text-white hover:bg-teal-700 dark:hover:bg-teal-800"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Job
          </button>
        </div>
      </div>

      {/* Create Job Tab */}
      {activeTab === "create" && (
        <section className=" dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            Post New Opportunity
          </h3>
          <form onSubmit={onCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="title"
                value={jobForm.title}
                onChange={onJobFormChange}
                placeholder="Job Title"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <input
                name="location"
                value={jobForm.location}
                onChange={onJobFormChange}
                placeholder="Location (e.g. Remote)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select
                name="job_type"
                value={jobForm.job_type}
                onChange={onJobFormChange}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
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
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
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
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
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
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                type="number"
                name="salary_max"
                value={jobForm.salary_max}
                onChange={onJobFormChange}
                placeholder="Maximum Salary"
                min="0"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="is_remote"
                checked={jobForm.is_remote}
                onChange={onJobFormChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Position is remote-friendly
            </label>

            <div>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={onJobFormChange}
                placeholder="Describe the opportunity, team, and impact."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={3}
              />
              <textarea
                name="responsibilities"
                value={jobForm.responsibilities}
                onChange={onJobFormChange}
                placeholder="Key responsibilities or day-to-day expectations."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                name="required_skills"
                value={jobForm.required_skills}
                onChange={onJobFormChange}
                placeholder="Required skills (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                name="preferred_skills"
                value={jobForm.preferred_skills}
                onChange={onJobFormChange}
                placeholder="Preferred skills (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <input
                name="categories"
                value={jobForm.categories}
                onChange={onJobFormChange}
                placeholder="Categories or tags (comma separated)"
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creatingJob}
                className="px-6 py-3 bg-gray-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all disabled:opacity-70"
              >
                {creatingJob ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Manage Jobs Tab */}
      {activeTab === "manage" && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Filters Section */}
          <div className="mb-6">
            {showFilters && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Active Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={
                        filters.is_active === null
                          ? "all"
                          : filters.is_active
                            ? "active"
                            : "inactive"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        onFiltersChange({
                          ...filters,
                          is_active:
                            value === "all" ? null : value === "active",
                        });
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">All Jobs</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>

                  {/* Posted Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Posted From
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
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Posted Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Posted To
                    </label>
                    <input
                      type="date"
                      value={filters.posted_date_to || ""}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          posted_date_to: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Application Deadline From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline From
                    </label>
                    <input
                      type="date"
                      value={filters.application_deadline_from || ""}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          application_deadline_from: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Application Deadline To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline To
                    </label>
                    <input
                      type="date"
                      value={filters.application_deadline_to || ""}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          application_deadline_to: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        onFiltersChange({
                          is_active: null,
                          posted_date_from: "",
                          posted_date_to: "",
                          application_deadline_from: "",
                          application_deadline_to: "",
                        })
                      }
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loadingJobs ? (
            <div className="text-center py-10 text-gray-500">
              Loading jobs...
            </div>
          ) : jobs.length > 0 ? (
            <>
              {/* Table */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Table Header */}
                <div className="bg-black dark:bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                  <span className="font-medium text-sm">Job Type</span>
                  <span className="font-medium text-sm">Actions</span>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
                          {job.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">
                          {job.job_type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onEditJob(job)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          title="Edit Job"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete Job"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                        <button
                          onClick={() => onViewApplications(job.id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                          View Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {jobs.length} of {totalJobs} jobs
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
          {!loadingJobs && jobs.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Create your first job
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

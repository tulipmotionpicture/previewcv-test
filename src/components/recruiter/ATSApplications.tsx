"use client";

import { useState } from "react";
import { Job, Application } from "@/types/api";
import {
  Search,
  Copy,
  ChevronDown,
  FileText,
  Clock,
  Calendar
} from "lucide-react";

interface ATSApplicationsProps {
  jobs: Job[];
  applications: Application[];
  selectedJobId: number | null;
  statusFilter: string;
  loadingApps: boolean;
  onJobSelect: (jobId: number) => void;
  onStatusFilterChange: (status: string) => void;
  onViewDetails: (app: Application) => void;
  onUpdateStatus: (appId: number, newStatus: string) => void;
}

export default function ATSApplications({
  jobs,
  applications,
  selectedJobId,
  statusFilter,
  loadingApps,
  onJobSelect,
  onStatusFilterChange,
  onViewDetails,
  onUpdateStatus,
}: ATSApplicationsProps) {

  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusUpdate = (appId: number, newStatus: string) => {
    onUpdateStatus(appId, newStatus);
  };

  // Filter applications locally by name if search term exists
  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const name = app.applicant?.full_name || app.candidate_name || "";
    const email = app.applicant?.email || app.candidate_email || "";
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'applied':
        return 'bg-[#E6F4EA] text-[#1E7F3A] dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'hired':
      case 'offered':
      case 'accepted':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Application Review System
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Review and manage candidate applications for your active roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* LEFT COLUMN: Candidate Table (Main) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 overflow-hidden shadow-sm h-[600px] flex flex-col">

            {/* Table Header */}
            <div className="bg-[#0B172B] px-4 py-3 grid grid-cols-12 gap-4 items-center sticky top-0 z-10">
              <div className="col-span-4 text-xs font-bold text-white uppercase tracking-wider">Candidate</div>
              <div className="col-span-2 text-xs font-bold text-white uppercase tracking-wider">Status</div>
              <div className="col-span-3 text-xs font-bold text-white uppercase tracking-wider">Resume</div>
              <div className="col-span-3 text-xs font-bold text-white uppercase tracking-wider text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto flex-1 custom-scrollbar">
              {loadingApps ? (
                <div className="p-10 text-center text-gray-500">Loading applications...</div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <div key={app.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                    {/* Candidate Info */}
                    <div className="col-span-4">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                        {app.applicant?.full_name || app.candidate_name || "Unknown Name"}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#60768D] dark:text-gray-400">
                          {app.applicant?.email || app.candidate_email || "No Email"}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(app.applicant?.email || app.candidate_email || "")}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(app.status)}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Resume */}
                    <div className="col-span-3">
                      {app.resume?.pdf_url ? (
                        <a
                          href={app.resume.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Resume
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No Resume</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-4">
                      <button
                        onClick={() => onViewDetails(app)}
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline decoration-gray-300 underline-offset-4"
                      >
                        View Detail
                      </button>

                      <div className="relative group">
                        {/* Styled Select Mockup - Using real select for functionality but styled like the button */}
                        <div className="relative">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                            className="appearance-none pl-4 pr-9 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 w-[110px]"
                          >
                            <option value="applied" className="text-gray-900 bg-white">Applied</option>
                            <option value="under_review" className="text-gray-900 bg-white">Under Review</option>
                            <option value="interview_scheduled" className="text-gray-900 bg-white">Interview</option>
                            <option value="offered" className="text-gray-900 bg-white">Offered</option>
                            <option value="accepted" className="text-gray-900 bg-white">Accepted</option>
                            <option value="rejected" className="text-gray-900 bg-white">Rejected</option>
                            <option value="withdrawn" className="text-gray-900 bg-white">Withdrawn</option>
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500">
                  No applications found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Filter Section (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 overflow-hidden shadow-sm sticky top-6">

            {/* Filter Header */}
            <div className="bg-[#0B172B] px-6 py-4">
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">Filter</h2>
            </div>

            <div className="p-5 space-y-6">

              {/* Job Categories Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Categories</label>
                <div className="relative">
                  <select
                    value={selectedJobId ?? ""}
                    onChange={(e) => onJobSelect(Number(e.target.value))}
                    className="w-full appearance-none px-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
                  >
                    <option value="" disabled>Select Jobs</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
                  >
                    <option value="All">All</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="interview_scheduled">Interview</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Candidate Name Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Candidate Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by candidate name"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:text-gray-200 transition-all"
                  />
                </div>
              </div>

              {/* Dates | Time (Placeholder Mockup) */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                  <span>Dates</span>
                  <span className="text-gray-300">|</span>
                  <span>Time</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-lg text-xs" type="date" />
                  </div>
                  <div className="relative">
                    <input className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-lg text-xs" type="time" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

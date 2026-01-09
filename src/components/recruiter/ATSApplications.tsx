"use client";

import { useState } from "react";
import { Job, Application } from "@/types/api";

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
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const handleStatusUpdate = (appId: number, newStatus: string) => {
    onUpdateStatus(appId, newStatus);
    setActionMenuOpen(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black mb-4 text-gray-900 dark:text-gray-100">
        Application Review System
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">
        Review and manage candidate applications for your active roles.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
            Select Job:
          </span>
          <select
            className="flex-1 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-gray-100"
            value={selectedJobId ?? ""}
            onChange={(e) => onJobSelect(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a job to view applications
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} {job.status === "active" ? "✓" : `(${job.status})`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
            Filter Status:
          </span>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-gray-900 dark:text-gray-100"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option>All</option>
            <option>Applied</option>
            <option>Under Review</option>
            <option>Interview Scheduled</option>
            <option>Offered</option>
            <option>Accepted</option>
            <option>Rejected</option>
            <option>Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Candidate
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Resume
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loadingApps ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Loading applications...
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-6 border-b border-gray-50 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {app.applicant?.full_name || app.candidate_name}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {app.applicant?.email || app.candidate_email}
                    </p>
                  </td>
                  <td className="px-6 py-6 border-b border-gray-50 dark:border-gray-800">
                    <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {app.resume?.name || "No Resume"}
                    </span>
                    {app.resume?.pdf_url && (
                      <a
                        href={app.resume.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 dark:text-blue-400 underline text-xs"
                      >
                        View PDF
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right border-b border-gray-50 dark:border-gray-800">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          onViewDetails(app);
                          setActionMenuOpen(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors uppercase tracking-tight shadow-sm shadow-blue-200 dark:shadow-blue-900/50"
                      >
                        View Details
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(
                              actionMenuOpen === app.id ? null : app.id
                            );
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-tight shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50"
                        >
                          Actions ▼
                        </button>
                        {actionMenuOpen === app.id && (
                          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2">
                            {app.status === "applied" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(app.id, "under_review")
                                }
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors"
                              >
                                Mark Under Review
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  app.id,
                                  "interview_scheduled"
                                )
                              }
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app.id, "rejected")
                              }
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loadingApps && applications.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-20 text-center text-gray-400 font-medium italic"
                >
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

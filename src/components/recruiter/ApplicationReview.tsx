"use client";

import { useState, useRef, useEffect } from "react";
import { Application } from "@/types/api";

type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected";

interface ApplicationReviewProps {
  applications: Application[];
  loadingApplications: boolean;
  statusFilter: ApplicationStatus | "all";
  onStatusFilterChange: (status: ApplicationStatus | "all") => void;
  onUpdateStatus: (applicationId: number, status: ApplicationStatus) => void;
  onViewDetail: (application: Application) => void;
  onBackToJobs: () => void;
}

export default function ApplicationReview({
  applications,
  loadingApplications,
  statusFilter,
  onStatusFilterChange,
  onUpdateStatus,
  onViewDetail,
  onBackToJobs,
}: ApplicationReviewProps) {
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "reviewed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "shortlisted":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleStatusChange = (
    applicationId: number,
    newStatus: ApplicationStatus
  ) => {
    onUpdateStatus(applicationId, newStatus);
    setOpenActionMenu(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToJobs}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Application Review
          </h1>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as ApplicationStatus | "all")
          }
          className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 font-semibold"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loadingApplications ? (
          <div className="text-center py-10 text-gray-400">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="w-[25%] px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="w-[20%] px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-[25%] px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="w-[25%] px-6 py-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {app.candidate_name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                            {app.candidate_name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {app.candidate_email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="w-[20%] px-6 py-4">
                      <span className="text-gray-700 dark:text-gray-300 font-medium truncate block">
                        {app.job_title || "N/A"}
                      </span>
                    </td>
                    <td className="w-[15%] px-6 py-4 text-gray-500 dark:text-gray-400">
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="w-[15%] px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(
                          app.status
                        )}`}
                      >
                        {app.status
                          ? app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="w-[25%] px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewDetail(app)}
                          className="px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <div className="relative" ref={actionMenuRef}>
                          <button
                            onClick={() =>
                              setOpenActionMenu(
                                openActionMenu === app.id ? null : app.id
                              )
                            }
                            className="px-3 py-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            Update ▼
                          </button>
                          {openActionMenu === app.id && (
                            <div className="fixed z-50 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 right-auto transform -translate-x-1/2">
                              {(
                                [
                                  "pending",
                                  "reviewed",
                                  "shortlisted",
                                  "rejected",
                                ] as ApplicationStatus[]
                              ).map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(app.id, status)
                                  }
                                  className={`w-full px-4 py-2 text-left text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    app.status === status
                                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

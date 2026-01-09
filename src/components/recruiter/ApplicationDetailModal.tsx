"use client";

import { Application } from "@/types/api";

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl mx-4 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Candidate Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {application.candidate_name?.charAt(0) || "?"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {application.candidate_name || "Unknown Candidate"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {application.candidate_email || "No email provided"}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Job Title
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">
                {application.job_title || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(
                  application.status
                )}`}
              >
                {application.status
                  ? application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)
                  : "Unknown"}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Applied Date
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">
                {application.applied_at
                  ? new Date(application.applied_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Application ID
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">
                #{application.id}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Cover Letter
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.cover_letter}
                </p>
              </div>
            </div>
          )}

          {/* Resume Link */}
          {application.resume?.pdf_url && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Resume
              </p>
              <a
                href={application.resume.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Resume
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

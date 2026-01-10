"use client";

import { ApplicationDetailResponse } from "@/types/api";

interface ApplicationDetailModalProps {
  applicationDetail: ApplicationDetailResponse | null;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
}

export default function ApplicationDetailModal({
  applicationDetail,
  isOpen,
  loading,
  onClose,
}: ApplicationDetailModalProps) {
  if (!isOpen) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "under_review":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "offered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "accepted":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "withdrawn":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl mx-4 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : applicationDetail ? (
            <>
              {/* Candidate Info Section */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {applicationDetail.candidate.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {applicationDetail.candidate.full_name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {applicationDetail.candidate.email}
                  </p>
                  {applicationDetail.candidate.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {applicationDetail.candidate.phone_code}{" "}
                      {applicationDetail.candidate.phone}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadgeColor(
                    applicationDetail.application.status
                  )}`}
                >
                  {applicationDetail.application.status.replace("_", " ")}
                </span>
              </div>

              {/* Job Info */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  Applied For
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {applicationDetail.job.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {applicationDetail.job.company_name} •{" "}
                  {applicationDetail.job.location}
                </p>
              </div>

              {/* Application Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Application ID
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    #{applicationDetail.application.id}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Applied Date
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    {new Date(
                      applicationDetail.application.applied_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Last Updated
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    {new Date(
                      applicationDetail.application.updated_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Candidate Details */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                  Candidate Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {applicationDetail.candidate.first_name && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.candidate.first_name}{" "}
                        {applicationDetail.candidate.last_name}
                      </p>
                    </div>
                  )}
                  {applicationDetail.candidate.gender && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {applicationDetail.candidate.gender}
                      </p>
                    </div>
                  )}
                  {applicationDetail.candidate.nationality && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 mb-0.5">
                        Nationality
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.candidate.nationality}
                      </p>
                    </div>
                  )}
                  {applicationDetail.candidate.date_of_birth && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 mb-0.5">
                        Date of Birth
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.candidate.date_of_birth}
                      </p>
                    </div>
                  )}
                  {applicationDetail.candidate.country && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.candidate.city &&
                          `${applicationDetail.candidate.city}, `}
                        {applicationDetail.candidate.state &&
                          `${applicationDetail.candidate.state}, `}
                        {applicationDetail.candidate.country}
                      </p>
                    </div>
                  )}
                  {applicationDetail.candidate.address && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Address</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.candidate.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Info */}
              {applicationDetail.resume && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                    Resume
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {applicationDetail.resume.name}
                      </p>
                      {applicationDetail.resume.current_title && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {applicationDetail.resume.current_title}
                        </p>
                      )}
                    </div>
                    {applicationDetail.resume.pdf_url && (
                      <a
                        href={applicationDetail.resume.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Message */}
              {applicationDetail.application.custom_message && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                    Cover Letter / Message
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {applicationDetail.application.custom_message}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No application details available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
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

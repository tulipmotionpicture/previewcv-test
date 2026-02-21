"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Job } from "@/types/api";
import { Clock, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface JobsTableProps {
  jobs: Job[];
  loadingJobs: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: number) => void;
  onViewApplications: (jobId: number) => void;
}

export default function JobsTable({
  jobs,
  loadingJobs,
  currentPage,
  totalPages,
  onPageChange,
  onEditJob,
  onDeleteJob,
  onViewApplications,
}: JobsTableProps) {
  const [openMenuJobId, setOpenMenuJobId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;

  return (
    <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 overflow-hidden flex flex-col sticky top-5 h-auto max-h-[calc(110vh-140px)]">
      <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
        {loadingJobs ? (
          <div className="text-center py-12 text-gray-500">Loading jobs...</div>
        ) : jobs.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {[
                  "ROLE",
                  "STATUS",
                  "View Count",
                  "Application",
                  "POSTED",
                  "ACTIONS",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    className={`px-4 py-3 text-xs bg-[#2F4269] font-bold text-white dark:text-gray-500 uppercase tracking-wider ${index === 4 ? "text-right" : "text-left"
                      }`}
                  >
                    {heading}
                  </th>
                ))}
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
                  {/* View Count */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium text-center">
                    {job.view_count}
                  </td>
                  {/* Application Count */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium text-center">
                    {job.application_count}
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
                          const btn = e.currentTarget as HTMLElement;
                          const rect = btn.getBoundingClientRect();
                          const menuWidth = 192; // w-48
                          const menuHeight = 150; // approximate
                          const viewportWidth = window.innerWidth;
                          const viewportHeight = window.innerHeight;

                          // Calculate horizontal position (prefer right-aligned with button)
                          let left = rect.right - menuWidth;
                          // Ensure menu stays within viewport with 8px margin
                          if (left < 8) left = 8;
                          if (left + menuWidth > viewportWidth - 8) {
                            left = viewportWidth - menuWidth - 8;
                          }

                          // Calculate vertical position (prefer below button)
                          let top = rect.bottom + 8;
                          // If menu would overflow bottom, position above button instead
                          if (top + menuHeight > viewportHeight - 8) {
                            top = rect.top - menuHeight - 8;
                          }

                          setMenuPosition({
                            top: Math.max(8, top + window.scrollY),
                            left: left + window.scrollX,
                          });
                          setOpenMenuJobId(
                            openMenuJobId === job.id ? null : job.id,
                          );
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                      </button>

                      {openMenuJobId === job.id &&
                        menuPosition &&
                        createPortal(
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => {
                                setOpenMenuJobId(null);
                                setMenuPosition(null);
                              }}
                            ></div>
                            <div
                              style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                              }}
                              className="fixed w-48 rounded-md bg-white dark:bg-[#1E1E1E] shadow-lg border border-gray-300 ring-black ring-opacity-5 z-20 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    onEditJob(job);
                                    setOpenMenuJobId(null);
                                    setMenuPosition(null);
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
                                    setMenuPosition(null);
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
                                    setMenuPosition(null);
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
                          </>,
                          document.body,
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
                    ? "bg-primary-blue text-white shadow-sm"
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
  );
}

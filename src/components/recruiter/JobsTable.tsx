"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Job } from "@/types/api";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  QrCode,
  X,
  Download,
  MapPin,
  Briefcase,
  Share2,
  Copy,
  Sparkles,
} from "lucide-react";
import { formatSalaryRange } from "@/lib/salary";
import { Tooltip } from "@/components/ui";
import config from "@/config";
import { generateQRCodeDataURL, downloadElementAsImage } from "@/utils/qr";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
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
  const [qrJob, setQrJob] = useState<Job | null>(null);
  const [shareJob, setShareJob] = useState<Job | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const toast = useToast();

  useEffect(() => setMounted(true), []);


  async function getJobBySlug(slug: string): Promise<Job | null> {
    try {
      const response = await api.getJobBySlug(slug);
      return response.job;
    } catch (error) {
      return null;
    }
  }

  const handleShareJob = async (job: Job) => {
    const data = await getJobBySlug(job.slug);
    if (data) {
      setShareJob(data);
    }
  }

  useEffect(() => {
    if (qrJob) {
      const jobUrl = `${window.location.origin}/job/${qrJob.slug}`;
      generateQRCodeDataURL(jobUrl)
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [qrJob]);

  const handleDownloadCard = async () => {
    if (!qrJob) return;

    try {
      await downloadElementAsImage(
        "qr-share-card",
        `Job_${qrJob.slug}_ShareCard.png`,
      );
    } catch (error) {
      console.error("Failed to download QR share card:", error);
    }
  };


  console.log(shareJob, "share job data")
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
                  "SKILLS",
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
                      {job.job_type.replace(/_/g, " ")}
                      {job.is_remote ? " · Remote" : ""}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                      {formatSalaryRange(job)}
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
                  {/* Skills */}
                  <td className="px-4 py-3">
                    {(() => {
                      const required = job.required_skills || [];
                      const preferred = job.preferred_skills || [];
                      const total = required.length + preferred.length;
                      if (total === 0) {
                        return <span className="text-xs text-gray-400">—</span>;
                      }
                      const tip = (
                        <div className="text-left space-y-2 max-h-60 overflow-y-auto">
                          {required.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-300 mb-1">
                                Required
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {required.map((s, i) => (
                                  <span
                                    key={`r-${i}`}
                                    className="px-1.5 py-0.5 rounded bg-white/15 text-[11px]"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {preferred.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-300 mb-1">
                                Preferred
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {preferred.map((s, i) => (
                                  <span
                                    key={`p-${i}`}
                                    className="px-1.5 py-0.5 rounded bg-white/15 text-[11px]"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                      return (
                        <Tooltip content={tip} position="top">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#EEF2F8] text-[#2F4269] dark:bg-gray-800 dark:text-gray-300 hover:bg-[#E1E8F1] dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {total} {total === 1 ? "skill" : "skills"}
                          </button>
                        </Tooltip>
                      );
                    })()}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">

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
                                  <button
                                    onClick={() => {
                                      setQrJob(job);
                                      setOpenMenuJobId(null);
                                      setMenuPosition(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <QrCode className="w-4 h-4" />
                                    Show QR Code
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleShareJob(job);
                                      setOpenMenuJobId(null);
                                      setMenuPosition(null);

                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share job
                                  </button>
                                </div>
                              </div>
                            </>,
                            document.body,
                          )}
                      </div>
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
      {/* QR Code Modal */}
      {qrJob &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md">
            <div className="w-full max-w-md relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
              {/* Close Button placed outside card for better aesthetics */}
              <button
                onClick={() => setQrJob(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* The Shareable Card */}
              {qrDataUrl ? (
                <>
                  <div
                    id="qr-share-card"
                    className="relative w-full bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 rounded-[2rem] p-8 shadow-2xl overflow-hidden mb-6"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0ea5e9 100%)",
                    }}
                  >
                    {/* Decorative Background SVGs */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-20 pointer-events-none">
                      <svg
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="100"
                          cy="100"
                          r="100"
                          fill="currentColor"
                          className="text-white"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-10 pointer-events-none">
                      <svg
                        width="300"
                        height="300"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="currentColor"
                          className="text-white"
                          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98.1,-18.1,98.6,-2.4C99.1,13.2,93.4,29.1,84.3,42.8C75.2,56.5,62.8,68,48.6,76.5C34.4,85.1,18.5,90.6,2.2,87.6C-14.1,84.7,-30.1,73.3,-44.6,63C-59.1,52.8,-72,43.7,-80.6,31C-89.2,18.3,-93.5,2,-91.3,-13.2C-89,-28.4,-80.2,-42.6,-68.8,-52.9C-57.5,-63.3,-43.5,-69.8,-29.8,-75C-16.1,-80.2,-2.7,-84.1,11,-85.7C24.7,-87.3,30.6,-83.6,44.7,-76.4Z"
                          transform="translate(100 100)"
                        />
                      </svg>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col items-center text-center w-full">
                      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-2 mb-4 border border-white/30 shadow-lg">
                        {qrJob.company_logo_url ? (
                          <img
                            src={qrJob.company_logo_url}
                            alt="Logo"
                            className="w-16 h-16 object-contain rounded-xl bg-white"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-blue-600 font-bold text-3xl">
                            {qrJob.company_name?.charAt(0) || "C"}
                          </div>
                        )}
                      </div>

                      <h3 className="text-white font-black text-2xl mb-1.5 leading-tight tracking-tight drop-shadow-sm">
                        {qrJob.title}
                      </h3>
                      <p className="text-blue-100 font-semibold text-sm mb-5 tracking-wide uppercase drop-shadow-sm">
                        {qrJob.company_name}
                      </p>

                      <div className="flex items-center justify-center gap-4 text-white/90 text-xs font-medium mb-6 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {qrJob.is_remote
                            ? "Remote"
                            : qrJob.location || "Location TBA"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/50"></span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {qrJob.job_type
                            ?.split("_")
                            .map(
                              (w: string) =>
                                w.charAt(0).toUpperCase() + w.slice(1),
                            )
                            .join(" ")}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl shadow-2xl mb-5 transform transition-transform hover:scale-105 duration-300">
                        <img
                          src={qrDataUrl}
                          alt="Job QR Code"
                          className="w-44 h-44 rounded-xl"
                        />
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-8 bg-white/30"></div>
                        <p className="text-white font-bold text-xs tracking-[0.2em] uppercase">
                          Scan to Apply
                        </p>
                        <div className="h-[1px] w-8 bg-white/30"></div>
                      </div>

                      {config.app.logoUrl && (
                        <div className="mt-auto flex items-center justify-center opacity-90">
                          <img
                            src={config.app.logoUrl}
                            alt="PreviewCV"
                            className="h-6 object-contain brightness-0 invert"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadCard}
                    className="flex items-center justify-center gap-2 w-full max-w-sm py-3.5 bg-white text-blue-600 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transform duration-200"
                  >
                    <Download className="w-5 h-5" />
                    Download Shareable Card
                  </button>
                </>
              ) : (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl w-full flex flex-col items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-blue mb-4"></div>
                  <p className="text-gray-500 font-medium animate-pulse">
                    Generating your card...
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Share Job Modal */}
      {shareJob &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-9 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Share Job
                </h3>
                <button
                  onClick={() => setShareJob(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 dark:bg-[#1A1A1A]">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{shareJob.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="text-primary-blue bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{shareJob.company_name}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {shareJob.is_remote ? "Remote" : shareJob.location || "Location TBA"}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {shareJob.job_type?.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
                  </div>
                </div>

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none bg-white dark:bg-[#282727] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div
                    dangerouslySetInnerHTML={{ __html: shareJob.description || "<p>No description provided.</p>" }}
                    className="[&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mb-2 text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = shareJob.description || "";
                    const descriptionText = tempDiv.textContent || tempDiv.innerText || "";

                    const url = `${window.location.origin}/job/${shareJob.slug}`;
                    const content = `${shareJob.title}\n${descriptionText}\n\nApply here: ${url}`;

                    navigator.clipboard.writeText(content);
                    toast.success("Job content copied to clipboard!");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-[#282727] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-sm shadow-sm"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy Content</span>
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/job/${shareJob.slug}`;
                    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    window.open(linkedinUrl, '_blank', 'width=800,height=700,noopener,noreferrer');
                  }}
                  className="flex flex-1 items-center justify-center gap-2 px-5 py-3.5 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all font-bold text-sm shadow-sm"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share on LinkedIn</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

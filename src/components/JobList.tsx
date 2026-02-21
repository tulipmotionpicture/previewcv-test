"use client";
import React, { useState, useRef } from "react";
import { Job } from "@/types/api";
import Link from "next/link";
import BookmarkButton from "./BookmarkButton";
import { useToast } from "@/context/ToastContext";

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  error?: string;
}

function formatSalary(job: Job) {
  if (job.salary_min && job.salary_max) {
    return `${job.salary_currency || "USD"} ${job.salary_min} - ${job.salary_max
      }`;
  }
  return "Competitive Salary";
}

export default function JobList({ jobs, loading, error }: JobListProps) {
  const [jobsState, setJobsState] = useState(jobs);
  const sharingJobId = useRef<number | null>(null);
  const { success } = useToast();

  // Update jobs state when props change
  React.useEffect(() => {
    setJobsState(jobs);
  }, [jobs]);

  const handleBookmarkChange = (jobId: number, isBookmarked: boolean) => {
    setJobsState((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, is_bookmarked: isBookmarked } : job,
      ),
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1d ago";
    return `${diffInDays}d ago`;
  };

  const handleShare = async (job: Job) => {
    if (sharingJobId.current === job.id) return;
    sharingJobId.current = job.id;
    const jobUrl = `${window.location.origin}/job/${job.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          url: jobUrl,
        });
        success("Job shared successfully!");
      } catch (err) {
        // Ignore AbortError (user canceled the share)
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      } finally {
        sharingJobId.current = null;
      }
    } else {
      try {
        await navigator.clipboard.writeText(jobUrl);
        success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      } finally {
        sharingJobId.current = null;
      }
    }
  };

  return (
    <div className="relative">
      {error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : jobsState.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {jobsState.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 hover:border-blue-300 transition-shadow duration-300 flex flex-col h-full shadow-sm"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex gap-2.5">
                  {/* Logo */}
                  <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-1 border border-gray-100 dark:border-gray-700 shrink-0">
                    {job.company_logo_url ? (
                      <img
                        src={job.company_logo_url}
                        alt={job.company_name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-lg font-bold text-green-600">
                        {job.company_name?.charAt(0) || "C"}
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 leading-tight truncate pr-2">
                      {job.title}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
                      <span className="text-gray-900 dark:text-gray-300 font-semibold hover:text-primary-blue transition-colors">
                        <Link href={job.recruiter_profile_url || ""}>
                          {job.company_name}
                        </Link>
                      </span>
                      {job.location && (
                        <span className="text-gray-400 ml-1 truncate">
                          in {job.location}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <BookmarkButton
                    jobId={job.id}
                    jobSlug={job.slug}
                    isBookmarked={job.is_bookmarked || false}
                    onBookmarkChange={(isBookmarked) =>
                      handleBookmarkChange(job.id, isBookmarked)
                    }
                    size="sm"
                  />
                  <button
                    onClick={() => handleShare(job)}
                    className="p-1 text-gray-400 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Share Job"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-2">
                <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed line-clamp-2">
                  {stripHtml(job.description)}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {job.required_skills?.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-[10px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
                <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-[10px] font-medium">
                  {job.job_type?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Salary & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-baseline">
                  <span className="text-lg font-bold text-primary-blue dark:text-blue-400">
                    {formatSalary(job).split(" ")[0] === "USD"
                      ? "$"
                      : formatSalary(job).split(" ")[0]}
                    {formatSalary(job)
                      .split(" ")
                      .slice(1)
                      .join(" ")
                      .replace("Competitive Salary", "Competitive")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium ml-0.5">/month</span>
                </div>

                {job.is_remote && (
                  <span className="px-1.5 py-0.5 border border-[#FDB022] text-[#B54708] dark:text-[#FDB022] rounded text-[10px] font-medium bg-transparent">
                    Remote
                  </span>
                )}
                <span className="px-1.5 py-0.5 border border-purple-400 text-purple-600 dark:text-purple-400 rounded text-[10px] font-medium bg-transparent">
                  Junior Level
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800 mb-2"></div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 mt-auto">
                <div className="flex flex-col gap-0.5">
                  <div className="text-gray-500 dark:text-gray-400 text-[10px] font-medium">
                    Posted{" "}
                    {new Date(job.posted_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-[10px] font-medium gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      {job.application_count || 0}
                    </span>
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-[10px] font-medium gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {job.view_count || 0}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/job/${job.slug}`}
                  className="px-4 py-2 bg-primary-blue text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow text-center min-w-[100px]"
                >
                  Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-60 dark:bg-opacity-70 z-10 transition-opacity duration-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>?/gm, "");
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

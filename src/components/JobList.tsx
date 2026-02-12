"use client";
import React, { useState } from "react";
import { Job } from "@/types/api";
import Link from "next/link";
import BookmarkButton from "./BookmarkButton";

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

  return (
    <div className="relative pt-10">
      {error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : jobsState.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobsState.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-800 p-4 hover:border-blue-300 transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700 shrink-0">
                    {job.company_logo_url ? (
                      <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-green-600">
                        {job.company_name?.charAt(0) || "C"}
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      <span className="text-gray-900 dark:text-gray-300 font-semibold">{job.company_name}</span>
                      {job.location && <span className="text-gray-400 ml-1">in {job.location}</span>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <BookmarkButton
                    jobId={job.id}
                    jobSlug={job.slug}
                    isBookmarked={job.is_bookmarked || false}
                    onBookmarkChange={(isBookmarked) => handleBookmarkChange(job.id, isBookmarked)}
                    size="sm"
                  />
                  <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="mt-2 mb-3">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug line-clamp-1">
                  {stripHtml(job.description)}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {job.required_skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium">
                    {skill}
                  </span>
                ))}
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium">
                  {job.job_type?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Salary & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-baseline">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatSalary(job).split(' ')[0] === 'USD' ? '$' : formatSalary(job).split(' ')[0]}
                    {formatSalary(job).split(' ').slice(1).join(' ').replace("Competitive Salary", "Competitive")}
                  </span>

                </div>

                {job.is_remote && (
                  <span className="px-2 py-0.5 border border-yellow-400 text-yellow-600 dark:text-yellow-400 rounded text-xs font-medium bg-yellow-50 dark:bg-yellow-900/10">
                    Remote
                  </span>
                )}

                {job.experience_level && (
                  <span className="px-2 py-0.5 border border-purple-400 text-purple-600 dark:text-purple-400 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/10 capitalize">
                    {job.experience_level.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800 mb-3"></div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                    Posted {new Date(job.posted_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-medium gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {job.application_count || 0} applicants
                    </span>
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-medium gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      {job.view_count || 0} Views
                    </span>
                  </div>
                </div>

                <Link
                  href={`/job/${job.slug}`}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow text-center"
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
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>?/gm, '');
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

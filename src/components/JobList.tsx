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
    <div className="relative">
      {error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : jobsState.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobsState.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 rounded-[20px] border-2 border-[#E1E8F1] dark:border-gray-800 p-6 hover:border-[#BAD2F2] hover:border-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Logo */}
                <div className="w-[60px] h-[60px] rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 shrink-0">
                  {job.company_logo_url ? (
                    <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-green-600">
                      {job.company_name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-[1.1rem] font-bold text-gray-900 dark:text-gray-100 truncate leading-tight mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
                    <span className="text-gray-800 dark:text-gray-200">{job.company_name}</span>
                    {job.location && <span className="text-gray-400 font-normal"> in {job.location}</span>}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="text-[0.9rem] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {stripHtml(job.description)}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                {job.required_skills?.slice(0, 1).map(skill => (
                  <span key={skill} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700">
                    {skill}
                  </span>
                ))}
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700">
                  {job.job_type?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800 mt-2">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatSalary(job).split(' ')[0] === 'USD' ? '$' : formatSalary(job).split(' ')[0]}
                      {formatSalary(job).split(' ').slice(1).join(' ').replace("Competitive Salary", "Competitive")}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">/mo</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(job.posted_date)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/job/${job.slug}`}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                  >
                    View Detail
                  </Link>
                  <Link
                    href={`/job/${job.slug}`}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                  >
                    Apply
                  </Link>
                </div>
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

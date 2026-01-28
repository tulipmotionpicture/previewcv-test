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

  // console.log(jobsState[0].is_bookmarked, "jobsState");
  return (
    <div className="relative">
      {/* <h2 className="text-2xl font-bold mb-6 text-gray-900">Job Listings</h2> */}
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
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
            >
              {/* Header: Title, Company, Bookmark */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <a href={`/job/${job.slug}`} className="block group/title">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors mb-1">
                      {job.title}
                    </h3>
                  </a>

                  {job.recruiter_username && (
                    <Link
                      href={
                        job.recruiter_profile_url ||
                        `/recruiter/${job.recruiter_username}`
                      }
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {/* <span className="text-lg">🏢</span> */}
                      {job.company_name}
                    </Link>
                  )}
                </div>

                <BookmarkButton
                  jobId={job.id}
                  jobSlug={job.slug}
                  isBookmarked={job.is_bookmarked || false}
                  onBookmarkChange={(isBookmarked) =>
                    handleBookmarkChange(job.id, isBookmarked)
                  }
                  size="md"
                />
              </div>

              {/* Meta Info: Location, Remote, Experience */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location}
                </span>

                {job.is_remote && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Remote
                  </span>
                )}

                <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700">
                  {job.experience_level.charAt(0).toUpperCase() +
                    job.experience_level.slice(1)}{" "}
                  Level
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 6 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                        +{job.required_skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer: Stats, Salary, CTA */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Posted{" "}
                    {new Date(job.posted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {job.application_count} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {job.view_count} views
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between">
                  <span className="text-xs font-semibold">
                    {formatSalary(job)}
                  </span>
                  <a
                    href={`/job/${job.slug}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Apply Now
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-60 dark:bg-opacity-70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

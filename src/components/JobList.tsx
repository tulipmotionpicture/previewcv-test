import React from "react";
import { Job } from "@/types/api";
import Link from "next/link";

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  error?: string;
}

function formatSalary(job: Job) {
  if (job.salary_min && job.salary_max) {
    return `${job.salary_currency || "USD"} ${job.salary_min} - ${
      job.salary_max
    }`;
  }
  return "Competitive Salary";
}

export default function JobList({ jobs, loading, error }: JobListProps) {
  return (
    <div className="relative">
      {/* <h2 className="text-2xl font-bold mb-6 text-gray-900">Job Listings</h2> */}
      {error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : jobs.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 transition-all p-6 md:p-8 flex flex-col gap-3 group relative overflow-hidden hover:scale-101 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <h3 className="text-sm md:text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>

                {job.recruiter_username && (
                  <Link
                    href={
                      job.recruiter_profile_url ||
                      `/recruiter/${job.recruiter_username}`
                    }
                    className="bg-gray-100 dark:bg-gray-800 text-xs p-1 rounded  text-gray-700 dark:text-gray-200 whitespace-nowrap border border-gray-200 dark:border-gray-700"
                    title={`View recruiter profile: ${job.recruiter_username}`}
                  >
                    {job.company_name}
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-blue-400 dark:text-blue-300"
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
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-semibold border border-blue-100 dark:border-blue-800">
                    Remote
                  </span>
                )}

                {/* {job.industry && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                    {job.industry}
                  </span>
                )} */}
              </div>

              <p className="mb-4 text-gray-700 dark:text-gray-300 text-xs line-clamp-3">
                {job.description}
              </p>
              {(job.required_skills?.length > 0 ||
                (job.preferred_skills && job.preferred_skills.length > 0)) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.required_skills?.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 p-1 rounded text-xs dark:border-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                {job.preferred_skills?.map((skill) => (
                  <span
                    key={skill}
                    className="bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 p-0.5 rounded text-xs border-yellow-200 dark:border-yellow-700"
                  >
                    {skill} (Preferred)
                  </span>
                ))}
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-auto">
                <span className="text-xs text-gray-400 dark:text-gray-500 text-right md:text-left">
                  Posted {new Date(job.posted_date).toLocaleDateString()} |{" "}
                  {job.experience_level.charAt(0).toUpperCase() +
                    job.experience_level.slice(1)}
                  <br />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <span title="Applications">
                      {job.application_count} apps
                    </span>{" "}
                    |<span title="Views"> {job.view_count} views</span>
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {formatSalary(job)}
                  </span>
                  <a
                    href={`/jobs/${job.slug}`}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition w-full md:w-auto text-center shadow group-hover:scale-105 group-hover:shadow-lg text-sm"
                  >
                    Apply Now
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

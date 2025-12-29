import React from "react";
import { Job } from "@/types/api";

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
    <div>
      {/* <h2 className="text-2xl font-bold mb-6 text-gray-900">Job Listings</h2> */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading jobs...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-100 hover:shadow-xl transition-all p-6 md:p-8 flex flex-col gap-3 rounded-2xl group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {job.title}
                </h3>
                <span className="bg-gray-100 text-xs px-3 py-1 rounded font-semibold text-gray-700 whitespace-nowrap border border-gray-200">
                  {job.company_name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-blue-400"
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
                <span className="text-green-600 font-bold">
                  {formatSalary(job)}
                </span>
                {job.is_remote && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold border border-blue-100">
                    Remote
                  </span>
                )}
              </div>
              <p className="mb-4 text-gray-700 text-sm md:text-base line-clamp-3">
                {job.description}
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-auto">
                <a
                  href={`/jobs/${job.slug}`}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md font-semibold hover:bg-blue-700 transition w-full md:w-auto text-center shadow group-hover:scale-105 group-hover:shadow-lg text-sm"
                >
                  Apply Now
                </a>
                <span className="text-xs text-gray-400 text-right md:text-left">
                  Posted {new Date(job.posted_date).toLocaleDateString()} |{" "}
                  {job.experience_level.charAt(0).toUpperCase() +
                    job.experience_level.slice(1)}
                </span>
              </div>
              <span className="absolute right-0 top-0 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl shadow-sm">
                {job.status === "active"
                  ? "Open"
                  : job.status
                  ? job.status.charAt(0).toUpperCase() + job.status.slice(1)
                  : "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import JobList from "@/components/JobList";
import type { SEOJobsResponse } from "@/types/jobs";
import type { Job as ApiJob } from "@/types/api";

interface SEOJobsListProps {
  slug: string;
  limit?: number;
  offset?: number;
}

export default function SEOJobsList({
  slug,
  limit = 20,
  offset = 0,
}: SEOJobsListProps) {
  const [data, setData] = useState<SEOJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.getJobsBySlug(slug, { limit, offset });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [slug, limit, offset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  if (!data || !data.success || data.jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No jobs found for this category.
      </div>
    );
  }

  return (
    <div>
      {/* SEO Meta Header */}
      {data.meta && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {data.meta.h1}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            {data.meta.description}
          </p>
        </div>
      )}

      {/* Filters Applied Info */}
      {data.filters_applied && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Filters:</span>
          {data.filters_applied.country && (
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              Country: {data.filters_applied.country}
            </span>
          )}
          {data.filters_applied.city && (
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              City: {data.filters_applied.city}
            </span>
          )}
          {data.filters_applied.job_type && (
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              Type: {data.filters_applied.job_type}
            </span>
          )}
          {data.filters_applied.is_remote && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              Remote
            </span>
          )}
          {data.filters_applied.experience_level && (
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              Experience: {data.filters_applied.experience_level}
            </span>
          )}
          {data.fallback_applied && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
              Showing results for {data.fallback_applied}
            </span>
          )}
        </div>
      )}

      {/* Jobs List */}
      <JobList
        jobs={data.jobs as unknown as ApiJob[]}
        loading={false}
        error=""
      />

      {/* Pagination */}
      {data.pagination && data.pagination.has_more && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // Implement pagination logic
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Load More Jobs
          </button>
        </div>
      )}

      {/* Results Count */}
      {data.pagination && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {data.jobs.length} of {data.pagination.total} jobs
        </div>
      )}
    </div>
  );
}

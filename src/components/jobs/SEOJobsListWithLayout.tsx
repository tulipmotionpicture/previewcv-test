"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import JobsLayout from "@/components/JobsLayout";
import JobsFilters from "@/components/JobsFilters";
import JobList from "@/components/JobList";
import JobsSidebar from "@/components/JobsSidebar";
import type { SEOJobsResponse } from "@/types/jobs";
import type { Job as ApiJob } from "@/types/api";

interface SEOJobsListWithLayoutProps {
  slug: string;
  limit?: number;
  offset?: number;
}

export default function SEOJobsListWithLayout({
  slug,
  limit = 20,
  offset = 0,
}: SEOJobsListWithLayoutProps) {
  const [data, setData] = useState<SEOJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        // Build query params from selectedFilters
        const params: Record<string, string | number> = { limit, offset };

        Object.entries(selectedFilters).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            params[key] = values.join(",");
          }
        });

        const response = await api.getJobsBySlug(slug, params);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [slug, limit, offset, selectedFilters]);

  return (
    <div>
      {/* SEO Meta Header */}
      {data?.meta && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {data.meta.h1}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {data.meta.description}
            </p>

            {/* Filters Applied Info */}
            {data.filters_applied && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.filters_applied.country && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    📍 {data.filters_applied.country}
                  </span>
                )}
                {data.filters_applied.city && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    🏙️ {data.filters_applied.city}
                  </span>
                )}
                {data.filters_applied.job_type && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 capitalize">
                    💼 {data.filters_applied.job_type.replace("_", " ")}
                  </span>
                )}
                {data.filters_applied.is_remote && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold border border-blue-200 dark:border-blue-800">
                    🏠 Remote
                  </span>
                )}
                {data.filters_applied.experience_level && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 capitalize">
                    📊 {data.filters_applied.experience_level}
                  </span>
                )}
                {data.filters_applied.industry && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    🏢 {data.filters_applied.industry}
                  </span>
                )}
                {data.fallback_applied && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium border border-yellow-200 dark:border-yellow-800">
                    ⚠️ Showing results for {data.fallback_applied}
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            {data.pagination && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Found{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {data.pagination.total}
                </span>{" "}
                jobs
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="w-full flex justify-center mb-6 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSelectedFilters((prev) => ({
              ...prev,
              keyword: keyword ? [keyword] : [],
              location: location ? [location] : [],
            }));
          }}
          className="w-full max-w-7xl bg-white dark:bg-gray-900 
            border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Keyword */}
            <div className="flex-1 p-3 pl-4">
              <label
                htmlFor="seo-job-keywords"
                className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400"
              >
                KEYWORDS
              </label>
              <input
                id="seo-job-keywords"
                type="text"
                placeholder="Refine by job title, skills..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent outline-none 
                   text-gray-800 dark:text-gray-100 
                   placeholder-gray-400 font-medium text-sm"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800" />

            {/* Location */}
            <div className="flex-1 p-3">
              <label
                htmlFor="seo-job-location"
                className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400"
              >
                LOCATION
              </label>
              <input
                id="seo-job-location"
                type="text"
                placeholder="Refine by city, state..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent outline-none 
                   text-gray-800 dark:text-gray-100 
                   placeholder-gray-400 font-medium text-sm"
              />
            </div>

            {/* Button */}
            <div className="p-2 flex items-center">
              <button
                type="submit"
                className="w-full md:w-auto px-8 h-10
                   bg-blue-600 hover:bg-blue-700 
                   text-white font-medium text-sm
                   rounded-lg shadow-md transition-all
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Refine Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Jobs Layout with Filters and Sidebar */}
      <JobsLayout
        filters={
          <JobsFilters
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        }
        jobs={
          <JobList
            jobs={(data?.jobs || []) as unknown as ApiJob[]}
            loading={loading}
            error={
              error ||
              (!data?.success && data ? "No jobs found for this category." : "")
            }
          />
        }
        sidebar={<JobsSidebar />}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.has_more && (
        <div className="max-w-7xl mx-auto px-4 mt-8 text-center">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Load More Jobs
          </button>
        </div>
      )}
    </div>
  );
}

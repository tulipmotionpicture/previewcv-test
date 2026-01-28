"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import JobsLayout from "@/components/JobsLayout";
import JobsFilters from "@/components/JobsFilters";
import JobList from "@/components/JobList";
import JobsSidebar from "@/components/JobsSidebar";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import type { CardsSummaryResponse } from "@/types/jobs";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [cardsData, setCardsData] = useState<CardsSummaryResponse | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  // Store selected filters as a dynamic object
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  // State for search bar
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState("");
  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // On mount, if keyword is present in URL, set it in filters as well
  // Track if filters are initialized from URL
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  useEffect(() => {
    if (initialKeyword) {
      setSelectedFilters((prev) => ({
        ...prev,
        skill_search: [initialKeyword],
      }));
    }
    setFiltersInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeyword]);

  // Helper to build params from selectedFilters
  const buildJobFilterParams = useCallback(
    (selected: Record<string, string[]>, currentOffset: number = 0) => {
      const params = new URLSearchParams();
      Object.entries(selected).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          params.append(key, values.join(","));
        }
      });
      params.append("limit", limit.toString());
      params.append("offset", currentOffset.toString());
      return params;
    },
    [],
  );

  // Fetch job cards data
  useEffect(() => {
    const fetchCards = async () => {
      setCardsLoading(true);
      try {
        const response = await api.getCardsSummary();
        setCardsData(response);
      } catch (err) {
        console.error("Failed to load job cards:", err);
      } finally {
        setCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Fetch jobs function
  const fetchJobs = useCallback(
    async (currentOffset: number, isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const params = buildJobFilterParams(selectedFilters, currentOffset);
        console.log(
          "Fetching jobs with offset:",
          currentOffset,
          "isLoadMore:",
          isLoadMore,
        );
        const response = await api.getJobs(params);
        const newJobs = response.items || response.jobs || [];
        console.log("Received jobs:", newJobs.length, "Total:", response.total);

        if (isLoadMore) {
          setJobs((prev) => {
            const updated = [...prev, ...newJobs];
            console.log("Total jobs after load more:", updated.length);
            return updated;
          });
        } else {
          setJobs(newJobs);
        }

        setTotal(response.total || 0);
        // Check if there are more jobs to load
        const loadedCount = isLoadMore
          ? currentOffset + newJobs.length
          : newJobs.length;
        const hasMoreJobs = loadedCount < (response.total || 0);
        console.log(
          "Loaded count:",
          loadedCount,
          "Total:",
          response.total,
          "Has more:",
          hasMoreJobs,
        );
        setHasMore(hasMoreJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [selectedFilters, buildJobFilterParams],
  );

  // Initial load and filter change
  useEffect(() => {
    if (!filtersInitialized) return;
    setOffset(0);
    setHasMore(true);
    fetchJobs(0, false);
  }, [selectedFilters, fetchJobs, filtersInitialized]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    console.log(
      "handleLoadMore called - loadingMore:",
      loadingMore,
      "hasMore:",
      hasMore,
      "offset:",
      offset,
    );
    if (!loadingMore && hasMore) {
      const nextOffset = offset + limit;
      console.log("Loading more jobs with offset:", nextOffset);
      setOffset(nextOffset);
      fetchJobs(nextOffset, true);
    }
  }, [offset, loadingMore, hasMore, fetchJobs]);

  // Infinite scroll hook
  const { loadMoreRef } = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    threshold: 300,
  });

  // Auto-load more if page doesn't have scrollbar
  useEffect(() => {
    const checkAndLoadMore = () => {
      // Check if page has vertical scrollbar
      const hasVerticalScrollbar =
        document.documentElement.scrollHeight >
        document.documentElement.clientHeight;

      console.log(
        "Checking scrollbar - hasScrollbar:",
        hasVerticalScrollbar,
        "hasMore:",
        hasMore,
        "loading:",
        loading,
        "loadingMore:",
        loadingMore,
      );

      if (
        !hasVerticalScrollbar &&
        hasMore &&
        !loading &&
        !loadingMore &&
        jobs.length > 0
      ) {
        console.log("No scrollbar detected, auto-loading more jobs");
        handleLoadMore();
      }
    };

    // Check after render
    const timeoutId = setTimeout(checkAndLoadMore, 100);
    return () => clearTimeout(timeoutId);
  }, [jobs.length, hasMore, loading, loadingMore, handleLoadMore]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
      />
      <div className="pt-20">
        {/* Horizontal Search Bar */}
        <div className="w-full flex justify-center mb-4 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSelectedFilters((prev) => ({
                ...prev,
                skill_search: keyword ? [keyword] : [],
                location: location ? [location] : [],
              }));
            }}
            className="w-full max-w-7xl bg-white dark:bg-gray-800 
              border-2 border-gray-200 dark:border-gray-700 rounded-xl
              shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {/* Keyword */}
              <div className="flex-1 px-4 py-2.5 flex flex-col justify-center">
                <label
                  htmlFor="job-keywords"
                  className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide"
                >
                  Keywords
                </label>
                <input
                  id="job-keywords"
                  type="text"
                  placeholder="Job title, skills, company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent outline-none 
                     text-gray-900 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500 
                     font-medium text-sm
                     focus:ring-0 border-0 p-0"
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 my-2" />

              {/* Location */}
              <div className="flex-1 px-4 py-2.5 flex flex-col justify-center border-t md:border-t-0 border-gray-200 dark:border-gray-700">
                <label
                  htmlFor="job-location"
                  className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide"
                >
                  Location
                </label>
                <input
                  id="job-location"
                  type="text"
                  placeholder="City, state or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent outline-none 
                     text-gray-900 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500 
                     font-medium text-sm
                     focus:ring-0 border-0 p-0"
                />
              </div>

              {/* Button */}
              <div className="px-2 py-2 flex items-center justify-center border-t md:border-t-0 border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-2.5
                     bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     text-white font-semibold text-sm
                     rounded-lg shadow-md hover:shadow-lg 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transform hover:scale-105"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </form>
        </div>

        <JobsLayout
          filters={
            <JobsFilters
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
          }
          jobs={
            <>
              <JobList jobs={jobs} loading={loading} error={error} />
              {!loading && !error && hasMore && (
                <div
                  ref={loadMoreRef}
                  className="py-8 flex justify-center min-h-[100px]"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="text-sm font-medium">
                        Loading more jobs...
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Scroll to load more...
                    </div>
                  )}
                </div>
              )}
              {!loading && !error && !hasMore && jobs.length > 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  You've reached the end of the job listings
                </div>
              )}
            </>
          }
          sidebar={<JobsSidebar />}
        />
      </div>
    </div>
  );
}

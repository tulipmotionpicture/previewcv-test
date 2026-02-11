"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
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

function JobsPageContent() {
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

    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      <Header
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
      />
      <div className="pt-18 pb-8 px-12 max-w-7xl mx-auto" >
        {/* Search Bar Container */}
        {/* Search Bar Container */}
        <div className="border-1 border-[#E1E8F1] rounded-xl dark:border-gray-700 p-4 bg-white dark:bg-gray-900 mb-3">
          <div className="mb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSelectedFilters((prev) => ({
                  ...prev,
                  skill_search: keyword ? [keyword] : [],
                  location: location ? [location] : [],
                }));
                // Trigger fetch
                setOffset(0);
                fetchJobs(0, false);
              }}
              className="flex flex-col lg:flex-row items-stretch gap-3"
            >
              {/* Keyword Input */}
              <div className="flex-[2] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4   hover:border-blue-400 transition-colors">
                <svg className="w-6 h-6 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter Skills, Destinations, or Company Name"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 p-0"
                />
              </div>

              {/* Location Input */}
              <div className="flex-[1.5] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 py-3 hover:border-blue-400 transition-colors">
                <svg className="w-6 h-6 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter City or County"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 p-0"
                />
              </div>

              {/* Experience Input */}
              <div className="flex-[1.5] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 py-3 hover:border-blue-400 transition-colors">
                <span className="w-6 h-6 text-gray-400 mr-3 flex items-center justify-center font-bold text-lg shrink-0">₹</span>
                <input
                  type="text"
                  placeholder="Enter Salary"
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 p-0"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap min-w-[140px]"
              >
                Search Job
              </button>
            </form>
          </div>

          {/* Popular Search */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
            <span className="font-bold text-gray-500 dark:text-gray-400 mr-2">Popular Search:</span>
            {["UI UX developer", "FrontEnd developer", "Deops Engineer", "Product Manager"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setKeyword(tag);
                  setSelectedFilters(prev => ({ ...prev, skill_search: [tag] }));
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
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
              {/* Header for Job List */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h2 className="text-slate-500 text-[15px] font-medium">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{total}</span> jobs
                  {keyword && <span className="font-bold text-slate-900 dark:text-white"> {keyword}</span>}
                  {location && <> in <span className="font-bold text-slate-900 dark:text-white">{location}</span></>}
                </h2>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-1 py-1 hover:border-blue-400 transition-colors">
                  <span className="text-slate-500 text-sm">Sort by :</span>
                  <div className="relative group cursor-pointer">
                    <select className="appearance-none bg-transparent text-sm font-bold text-slate-900 dark:text-white border-none focus:ring-0 cursor-pointer  py-1 px-1">
                      <option>Date</option>
                      <option>Relevance</option>
                      <option>Salary</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-900 dark:text-white">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

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

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}

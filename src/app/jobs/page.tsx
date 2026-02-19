"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import JobsLayout from "@/components/JobsLayout";
import JobsFilters from "@/components/JobsFilters";
import JobList from "@/components/JobList";
import JobsSidebar from "@/components/JobsSidebar";
import { CountrySearch } from "@/components/location";
import FloatingHeader from "@/components/FloatingHeader";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";
  const initialCountry = searchParams.get("country") || "";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  // Store selected filters as a dynamic object
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  // State for search bar
  const [keyword, setKeyword] = useState(initialKeyword);
  const [country, setCountry] = useState(initialCountry);
  const [scrolled, setScrolled] = useState(false);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Mobile filter visibility state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On mount, if keyword is present in URL, set it in filters as well
  // Track if filters are initialized from URL
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  useEffect(() => {
    const updates: Record<string, string[]> = {};
    if (initialKeyword) updates.skill_search = [initialKeyword];
    if (initialCountry) updates.country = [initialCountry];

    if (Object.keys(updates).length > 0) {
      setSelectedFilters((prev) => ({
        ...prev,
        ...updates,
      }));
    }
    setFiltersInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeyword, initialCountry]);

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

  // Trigger search from modal or form
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword) params.set("keyword", keyword);
    else params.delete("keyword");

    if (country) params.set("country", country);
    else params.delete("country");

    router.push(`/jobs?${params.toString()}`);

    setSelectedFilters((prev) => ({
      ...prev,
      skill_search: keyword ? [keyword] : [],
      country: country ? [country] : [],
    }));

    // Trigger fetch
    setOffset(0);
    fetchJobs(0, false);
    setShowSearchModal(false);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />
      <div className="pt-18 pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        {/* Search Bar Container */}
        <div className={`sticky top-4 z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled ? 'mx-auto w-full md:w-[95%] md:max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-blue-200/50 dark:border-blue-900/30 rounded-2xl shadow-2xl p-2' : 'w-full bg-white dark:bg-gray-900 border-1 border-[#E1E8F1] dark:border-gray-700 rounded-xl shadow-md p-4'} mb-3`}>
          <div className="">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className={`flex flex-row items-stretch transition-all duration-500 gap-2`}
            >
              {/* Keyword Input */}
              <div className="relative flex-[2] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 hover:border-blue-400 transition-colors h-11 md:h-12 py-1 md:py-0">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* Desktop Input */}
                <input
                  type="text"
                  placeholder="Search jobs"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium focus:ring-0 p-0 text-sm md:text-base hidden md:block"
                />
                {/* Mobile Trigger Input */}
                <input
                  type="text"
                  placeholder="Search jobs"
                  value={keyword}
                  readOnly
                  onClick={() => setShowSearchModal(true)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium focus:ring-0 p-0 text-sm md:hidden cursor-pointer selection:bg-transparent"
                />
              </div>

              {/* Country Input - Hidden on Mobile */}
              <div className="hidden md:block flex-[1.5]">
                <CountrySearch
                  country={country}
                  onChange={(c) => setCountry(c ? c.name : "")}
                  placeholder="Enter Country"
                  renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 py-3 hover:border-blue-400 transition-colors h-full">
                      <svg
                        className="w-6 h-6 text-gray-400 mr-3 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Enter Country"
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 p-0"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Experience Input - Hidden on Mobile */}
              <div className="hidden md:flex flex-[1.5] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 items-center px-4 py-3 hover:border-blue-400 transition-colors h-full">
                <span className="w-6 h-6 text-gray-400 mr-3 flex items-center justify-center font-bold text-lg shrink-0">
                  ₹
                </span>
                <input
                  type="text"
                  placeholder="Enter Salary"
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 p-0"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-500 shadow-sm whitespace-nowrap px-6 py-2 md:px-8 md:py-3 h-11 md:h-auto text-sm md:text-base`}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <JobsLayout
          filters={
            <div className="hidden md:block">
              <JobsFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            </div>
          }
          jobs={
            <>
              {/* Mobile Filter & Sort Row */}
              <div className="flex items-center justify-between mb-4 md:hidden">
                <button
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                  onClick={() => setShowMobileFilters(true)}
                >
                  All Filter
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </button>

                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                  <span className="text-gray-500 text-sm whitespace-nowrap">Sort by :</span>
                  <div className="relative group cursor-pointer flex items-center">
                    <select className="appearance-none bg-transparent text-sm font-bold text-gray-900 border-none focus:ring-0 cursor-pointer pr-4 py-0 pl-1">
                      <option>Date</option>
                      <option>Relevance</option>
                      <option>Salary</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-900">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header for Job List */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h2 className="text-slate-500 text-[15px] font-medium">
                  Showing{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {total}
                  </span>{" "}
                  jobs
                  {keyword && (
                    <span className="font-bold text-slate-900 dark:text-white">
                      {" "}
                      {keyword}
                    </span>
                  )}
                  {country && (
                    <>
                      {" "}
                      in{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {country}
                      </span>
                    </>
                  )}
                </h2>

                <div className="hidden md:flex gap-2 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 items-center px-1 py-1 hover:border-blue-400 transition-colors">
                  <span className="text-slate-500 text-sm">Sort by :</span>
                  <div className="relative group cursor-pointer">
                    <select className="appearance-none bg-transparent text-sm font-bold text-slate-900 dark:text-white border-none focus:ring-0 cursor-pointer  py-1 px-1">
                      <option>Date</option>
                      <option>Relevance</option>
                      <option>Salary</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-900 dark:text-white">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
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

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex justify-end md:hidden">
            <div className="w-[85%] max-w-sm h-full bg-white dark:bg-gray-900 p-4 overflow-y-auto shadow-xl transition-transform transform translate-x-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="pb-20">
                <JobsFilters
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
                <div className="mt-6">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700"
                  >
                    Show Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-[110] bg-white dark:bg-gray-900 p-5 flex flex-col md:hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Search Jobs</h2>

            <div className="flex flex-col gap-5">
              <input
                type="text"
                placeholder="Enter skills, destination, or company name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2.5 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-colors rounded-none"
              />

              <input
                type="text"
                placeholder="Enter County"
                value={country} // Assuming we want user to type here, or use same CountrySearch comp if needed. Image shows text input.
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2.5 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-colors rounded-none"
              />

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl py-3 mt-4 shadow-lg active:scale-[0.98] transition-all"
              >
                Search Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { RelevantJobsResponse } from "@/types/jobs";
import RelevantJobItem from "./RelevantJobItem";

interface RelevantJobsProps {
  relevantJobsData: RelevantJobsResponse | null;
  loading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  infiniteScrollLoading?: boolean;
}

interface RelevantJobsProps {
  relevantJobsData: RelevantJobsResponse | null;
  loading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  infiniteScrollLoading?: boolean;
}

export default function RelevantJobs({
  relevantJobsData,
  loading,
  onLoadMore,
  hasMore = false,
  infiniteScrollLoading = false,
}: RelevantJobsProps) {
  const jobs = relevantJobsData?.jobs || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        !scrollRef.current ||
        !onLoadMore ||
        !hasMore ||
        infiniteScrollLoading
      )
        return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 200; // Load more when 200px from bottom

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        if (!isNearBottom) {
          setIsNearBottom(true);
          onLoadMore();
        }
      } else {
        setIsNearBottom(false);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [onLoadMore, hasMore, infiniteScrollLoading, isNearBottom]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          No relevant jobs found at the moment.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Complete your profile to get better recommendations
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Completeness Info */}
      {relevantJobsData?.profile_completeness && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Profile Completeness:{" "}
              {relevantJobsData.profile_completeness.score}%
            </span>
          </div>
          {relevantJobsData.profile_completeness.improvement_tips.length >
            0 && (
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Tip:</span>{" "}
              {relevantJobsData.profile_completeness.improvement_tips[0]}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Jobs Container */}
      <div
        ref={scrollRef}
        className="max-h-[750px] overflow-y-auto space-y-1 p-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {jobs.map((job) => (
          <RelevantJobItem key={job.id} job={job} />
        ))}

        {/* Infinite Scroll Loading Indicator */}
        {infiniteScrollLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#0369A1] dark:text-[#0EA5E9]" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Loading more recommendations...
            </span>
          </div>
        )}

        {/* Load More Button as Fallback */}
        {!infiniteScrollLoading && hasMore && onLoadMore && (
          <div className="text-center py-4">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 text-sm font-medium text-[#0369A1] dark:text-[#0EA5E9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Load More Recommendations
            </button>
          </div>
        )}
      </div>

      {/* External Link to Jobs Page */}
      <Link
        href="/jobs"
        className="block text-center py-2 text-xs font-bold text-[#0369A1] dark:text-[#0EA5E9] hover:underline transition-all duration-150 mt-2"
      >
        Browse All Jobs
      </Link>
    </div>
  );
}

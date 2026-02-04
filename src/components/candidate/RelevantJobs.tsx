"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  ChevronRight,
  Sparkles,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { RelevantJobsResponse } from "@/types/jobs";
import Tooltip from "@/components/ui/Tooltip";

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
          <Link
            key={job.id}
            href={`/job/${job.slug}`}
            className="group block p-2 border-b border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
          >
            <div className="flex items-start gap-3 relative">
              {/* Company Logo */}
              <div className="w-10 h-10 rounded-lg bg-[#F0F9FF] dark:bg-gray-800 flex items-center justify-center text-[#0369A1] group-hover:bg-[#0369A1] group-hover:text-white transition-colors duration-150 flex-shrink-0 overflow-hidden">
                {job.company_logo_url ? (
                  <img
                    src={job.company_logo_url}
                    alt={job.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150 pr-2">
                    {job.title}
                  </h4>
                  {job.why_recommended && job.why_recommended.length > 0 && (
                    <Tooltip
                      content={
                        <div className="space-y-1">
                          <div className="font-semibold mb-2">
                            Why Recommended:
                          </div>
                          {job.why_recommended.map((reason, index) => (
                            <div key={index} className="text-xs">
                              • {reason}
                            </div>
                          ))}
                        </div>
                      }
                      position="top"
                      className="max-w-xs"
                    >
                      <span className="inline-flex">
                        <Lightbulb className="w-4 h-4 text-yellow-500 dark:text-yellow-400 cursor-help" />
                      </span>
                    </Tooltip>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 truncate">
                  {job.company_name}
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 truncate">
                  {job.categories.slice(0, 3).map((category, index) => (
                    <span key={index} className="mr-1">
                      {category}
                      {index < 2 && ","}
                    </span>
                  ))}
                </p>

                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center ">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#0369A1] dark:text-[#0EA5E9] uppercase">
                      <Briefcase className="w-3 h-3" />
                      {job.job_type.replace("_", " ")}
                    </span>
                    {job.days_since_posted !== undefined && (
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                        {job.days_since_posted === 0
                          ? "Today"
                          : `${job.days_since_posted}d ago`}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    {Math.round(job.relevance_score)}% match
                  </span>
                </div>
              </div>
            </div>
          </Link>
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

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  jobId: number;
  jobSlug: string;
  isBookmarked: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function BookmarkButton({
  jobId,
  jobSlug,
  isBookmarked: initialBookmarked,
  onBookmarkChange,
  className = "",
  size = "md",
}: BookmarkButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when prop changes (e.g., after fetching bookmark status)
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/candidate/login?redirect=/jobs/${jobSlug}`);
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await api.removeBookmark(jobId);
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        await api.bookmarkJob(jobId);
        setIsBookmarked(true);
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      // Optionally show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg transition-all cursor-pointer ${
        isBookmarked
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this job"}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this job"}
    >
      {isLoading ? (
        <svg
          className={`${iconSizes[size]} animate-spin`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          className={iconSizes[size]}
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isBookmarked ? "0" : "2"}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
    </button>
  );
}

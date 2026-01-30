"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

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

  // Sync state when prop changes
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${isBookmarked
          ? "bg-[#0369A1] text-white border border-[#0369A1]"
          : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-[#0369A1] hover:text-[#0369A1] dark:hover:text-[#0EA5E9]"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this job"}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this job"}
    >
      {isLoading ? (
        <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
      ) : (
        <Bookmark
          className={iconSizes[size]}
          fill={isBookmarked ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}

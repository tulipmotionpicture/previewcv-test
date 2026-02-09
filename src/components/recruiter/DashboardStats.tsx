"use client";

import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { RecruiterDashboardAnalytics } from "@/types/api";

interface DashboardStatsProps {
  stats: RecruiterDashboardAnalytics | null;
  loading: boolean;
}

export default function DashboardStats({
  stats,
  loading,
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Overview
          </h1>
          <p className="text-sm text-[#60768D] dark:text-gray-400">
            Welcome back john, Here what happening today.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Overview
          </h1>
          <p className="text-sm text-[#60768D] dark:text-gray-400">
            Welcome back john, Here what happening today.
          </p>
        </div>
        <div className="text-center py-20">
          <p className="text-[#60768D] dark:text-gray-400">
            Failed to load statistics
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.active_jobs.count,
      icon: Briefcase,
      trend: stats.active_jobs.change_percentage,
      trendDirection: stats.active_jobs.trend,
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Application",
      value: stats.total_applications.count,
      icon: Users,
      trend: stats.total_applications.change_percentage,
      trendDirection: stats.total_applications.trend,
      iconBg: "bg-purple-100/50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Interview Schedule",
      value: stats.interviews.total,
      icon: Calendar,
      trend: stats.interviews.change_percentage,
      trendDirection: stats.interviews.trend,
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending Approvals",
      value: stats.pending_approvals.total,
      icon: Clock,
      trend: null, // Pending approvals don't have trend data
      trendDirection: "stable",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Overview
        </h1>
        <p className="text-sm text-[#60768D] dark:text-gray-400">
          Welcome back john, Here what happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-[#282727] rounded-xl p-4 border border-[#E1E8F1] dark:border-gray-700  transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {card.label}
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value.toLocaleString()}
                  </div>
                </div>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.trend !== null ? (
                  <>
                    <span
                      className={`flex items-center text-sm font-bold ${
                        card.trendDirection === "up"
                          ? "text-green-500"
                          : card.trendDirection === "down"
                            ? "text-red-500"
                            : "text-gray-500"
                      }`}
                    >
                      {card.trendDirection === "up" && (
                        <TrendingUp className="w-4 h-4 mr-1 stroke-[3px]" />
                      )}
                      {card.trendDirection === "down" && (
                        <TrendingDown className="w-4 h-4 mr-1 stroke-[3px]" />
                      )}
                      {card.trendDirection === "stable" && (
                        <Minus className="w-4 h-4 mr-1 stroke-[3px]" />
                      )}
                      {Math.abs(card.trend).toFixed(0)}%
                    </span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      vs last month
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    Current period
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

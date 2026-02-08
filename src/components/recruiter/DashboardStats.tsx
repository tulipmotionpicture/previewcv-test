"use client";

import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface DashboardStatsData {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  pending_applications: number;
  shortlisted_applications: number;
  rejected_applications: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData | null;
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
      value: stats.active_jobs,
      icon: Briefcase,
      trend: 12,
      trendDirection: "up",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Application",
      value: stats.total_applications, // 1,234
      icon: Users,
      trend: 8,
      trendDirection: "up",
      iconBg: "bg-purple-100/50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Interview schedule",
      value: stats.shortlisted_applications, // 42
      icon: Calendar,
      trend: 12,
      trendDirection: "up",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending Approals", // Typo in image "Approals" fixed here
      value: stats.pending_applications, // 20
      icon: Clock, // Was blue briefcase in image, using Clock for "Pending" makes sense, style matches blue
      trend: 24,
      trendDirection: "up",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Overview
        </h1>
        <p className="text-sm text-[#60768D] dark:text-gray-400">
          Welcome back john, Here what happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-[#282727] rounded-xl p-6 border border-[#E1E8F1] dark:border-gray-700  transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {card.label}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value.toLocaleString()}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-sm font-bold text-green-500">
                  <TrendingUp className="w-4 h-4 mr-1 stroke-[3px]" />
                  {card.trend}%
                </span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

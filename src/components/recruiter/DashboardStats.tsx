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
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-10">
          Dashboard Statistics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-10">
          Dashboard Statistics
        </h1>
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">
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
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Application",
      value: stats.total_applications,
      icon: Users,
      trend: 8,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Interview schedule",
      value: stats.shortlisted_applications,
      icon: Calendar,
      trend: 12,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending Approvals",
      value: stats.pending_applications,
      icon: Clock,
      trend: 24,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {card.label}
                </span>
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend}%{" "}
                  <span className="text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

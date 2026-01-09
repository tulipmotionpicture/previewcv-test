"use client";

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
      label: "Total Jobs",
      value: stats.total_jobs,
      gradient:
        "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Jobs",
      value: stats.active_jobs,
      gradient:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-800",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Applications",
      value: stats.total_applications,
      gradient:
        "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Pending",
      value: stats.pending_applications,
      gradient:
        "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted_applications,
      gradient:
        "from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
      border: "border-teal-200 dark:border-teal-800",
      textColor: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Rejected",
      value: stats.rejected_applications,
      gradient:
        "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      border: "border-red-200 dark:border-red-800",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-10">
        Dashboard Statistics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 border ${card.border}`}
          >
            <p
              className={`text-xs font-black uppercase tracking-wider ${card.textColor} mb-2`}
            >
              {card.label}
            </p>
            <p className="text-4xl font-black text-gray-900 dark:text-gray-100">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

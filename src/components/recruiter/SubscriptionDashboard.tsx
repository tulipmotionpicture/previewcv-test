"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
  History,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type {
  SubscriptionDashboard as SubscriptionDashboardType,
  SubscriptionHistory,
  CreditsBalance,
} from "@/types/api";

interface SubscriptionDashboardProps {
  onNavigateToPricing?: () => void;
}

import React from "react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  color?: "blue" | "purple" | "green" | "red";
}

const colorMap = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    button: "bg-green-600 hover:bg-green-700",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-700",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = "blue",
}: EmptyStateProps) {
  const styles = colorMap[color];

  return (
    <div className="text-center py-10 px-4">
      <div
        className={`mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-xl ${styles.bg}`}
      >
        <Icon className={`w-7 h-7 ${styles.text}`} />
      </div>

      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-xs mx-auto">
        {description}
      </p>

      <button
        onClick={onAction}
        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${styles.button}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function SubscriptionDashboard({
  onNavigateToPricing,
}: SubscriptionDashboardProps = {}) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<SubscriptionDashboardType | null>(
    null,
  );
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [credits, setCredits] = useState<CreditsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview",
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardData, historyData, creditsData] = await Promise.all([
        api.getSubscriptionDashboard(),
        api.getSubscriptionHistory(50, 0),
        api.getCreditsBalance(),
      ]);
      setDashboard(dashboardData);
      // Combine job and CV subscriptions into single array for display
      const allHistory = [
        ...historyData.job_subscriptions,
        ...historyData.cv_subscriptions,
      ];
      setHistory(allHistory);
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJobSubscription = async () => {
    const cancelImmediately = confirm(
      "Do you want to cancel your subscription immediately?\n\n" +
        "Click OK to cancel immediately (you'll lose access now)\n" +
        "Click Cancel to cancel at the end of billing period (you'll keep access until then)",
    );

    const reason = prompt(
      "Please let us know why you're canceling (optional):",
    );

    try {
      const response = await api.cancelJobSubscription({
        cancel_at_period_end: !cancelImmediately,
        cancellation_reason: reason || undefined,
      });
      alert(response.message);
      await fetchData();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Active",
        className:
          "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700",
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        text: "Cancelled",
        className:
          "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700",
      },
      expired: {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Expired",
        className:
          "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
      },
      inactive: {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Inactive",
        className:
          "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading subscriptions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Subscriptions & Credits
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your job posting and CV access subscriptions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {credits?.credits_remaining || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Credits Remaining
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard?.job_subscription?.jobs_remaining ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Job Posts Left
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {credits?.credits_used_this_month || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Credits Used (This Month)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    dashboard?.has_active_job_subscription ||
                    dashboard?.has_active_cv_subscription
                      ? "bg-green-50 dark:bg-green-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  {dashboard?.has_active_job_subscription ||
                  dashboard?.has_active_cv_subscription ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {dashboard?.has_active_job_subscription ||
                    dashboard?.has_active_cv_subscription
                      ? "Active"
                      : "Inactive"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Subscription */}
          {/* Job Posting Subscription */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Job Posting Subscription
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your job posting limits
                  </p>
                </div>
              </div>
              {dashboard?.job_subscription &&
                getStatusBadge(dashboard.job_subscription.status)}
            </div>

            <div className="p-5 pt-0">
              {dashboard?.job_subscription ? (
                <div className="space-y-5">
                  {/* Usage */}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Job Posts Used
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {dashboard.job_subscription.jobs_posted_this_period} /{" "}
                        {dashboard.job_subscription.plan_config
                          ?.job_post_limit ?? "∞"}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: dashboard.job_subscription.plan_config
                            ?.job_post_limit
                            ? `${Math.min(
                                (dashboard.job_subscription
                                  .jobs_posted_this_period /
                                  dashboard.job_subscription.plan_config
                                    .job_post_limit) *
                                  100,
                                100,
                              )}%`
                            : "100%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Plan</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {dashboard.job_subscription.plan_config?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Renews On
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(
                          dashboard.job_subscription.current_period_end,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => router.push("/recruiter/upgrade")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Change Plan
                    </button>

                    {dashboard.job_subscription.status === "active" && (
                      <button
                        onClick={handleCancelJobSubscription}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={CreditCard}
                  title="No active subscription"
                  description="Post jobs and reach more candidates by subscribing."
                  actionLabel="View Plans"
                  onAction={() => router.push("/recruiter/upgrade")}
                  color="blue"
                />
              )}
            </div>
          </div>

          {/* CV Subscription */}
          {/* CV Access Credits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    CV Access Credits
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unlock candidate resumes
                  </p>
                </div>
              </div>
              {dashboard?.cv_subscription &&
                getStatusBadge(dashboard.cv_subscription.status)}
            </div>

            <div className="p-5 pt-0">
              {dashboard?.cv_subscription ? (
                <div className="space-y-5">
                  {/* Credits Remaining */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Credits Remaining
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboard.cv_subscription.credits_remaining}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/recruiter/upgrade")}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium"
                    >
                      Buy More
                    </button>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Used
                      </span>
                      <span className="font-medium">
                        {dashboard.cv_subscription.credits_used_this_period} /{" "}
                        {
                          dashboard.cv_subscription.plan_config
                            ?.credits_per_period
                        }
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-purple-600 rounded-full"
                        style={{
                          width: `${Math.min(
                            (dashboard.cv_subscription
                              .credits_used_this_period /
                              dashboard.cv_subscription.plan_config
                                ?.credits_per_period) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expiry */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires on{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {dashboard.cv_subscription.current_period_end
                        ? new Date(
                            dashboard.cv_subscription.current_period_end,
                          ).toLocaleDateString()
                        : "Never"}
                    </span>
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={Zap}
                  title="No CV credits available"
                  description="Purchase credits to unlock candidate resumes."
                  actionLabel="Purchase Credits"
                  onAction={() => router.push("/recruiter/upgrade")}
                  color="purple"
                />
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription History
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No subscription history
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Current
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((item) => (
                    <tr
                      key={`${item.subscription_type}-${item.subscription_id}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {item.subscription_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.plan_name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.is_current ? "Current" : "Past"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(item.started_at).toLocaleDateString()} -{" "}
                          {item.ended_at
                            ? new Date(item.ended_at).toLocaleDateString()
                            : "Present"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

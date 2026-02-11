"use client";

import { useEffect, useState } from "react";
import { Check, Zap, Crown, Star, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import type { JobPlan, CvPlan, SubscriptionDashboard } from "@/types/api";
import { useToast } from "@/context/ToastContext";

export default function PricingPlans() {
  const { showToast } = useToast();
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [cvPlans, setCvPlans] = useState<CvPlan[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [jobPlansData, cvPlansData, subscriptionData] = await Promise.all([
        api.getJobPlans(),
        api.getCvPlans(),
        api.getSubscriptionDashboard().catch(() => null),
      ]);
      setJobPlans(jobPlansData);
      setCvPlans(cvPlansData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Failed to fetch pricing plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatures = (plan: JobPlan): string[] => {
    const features: string[] = [];

    if (plan.job_post_limit !== null) {
      features.push(`${plan.job_post_limit} active job listings`);
    } else {
      features.push("Unlimited active job listings");
    }

    if (plan.applicants_per_job !== null) {
      features.push(`${plan.applicants_per_job} applicant reveals per job`);
    } else {
      features.push("Unlimited applicant reveals");
    }

    features.push(`${plan.job_duration_days} days job duration`);

    if (plan.has_analytics) features.push("Advanced analytics");
    else if (plan.has_limited_analytics) features.push("Basic analytics");

    if (plan.has_featured_jobs) features.push("Featured job listings");
    if (plan.has_bulk_messaging) features.push("Bulk messaging");
    if (plan.has_priority_support) features.push("Priority support");

    return features;
  };

  const getCvFeatures = (plan: CvPlan): string[] => {
    const features: string[] = [];

    features.push(`${plan.credits_per_period} CV unlocks per month`);
    features.push("90-day access per profile");

    if (plan.has_bulk_download) features.push("Bulk download");
    if (plan.has_advanced_filters) features.push("Advanced search filters");
    if (plan.has_priority_cv_access)
      features.push("Priority access to new profiles");

    return features;
  };

  const handleJobPlanSubscribe = async (planId: number) => {
    try {
      setSubscribing(true);
      await api.createJobSubscription({
        plan_config_id: planId,
        payment_gateway: currency === "usd" ? "stripe" : "razorpay",
      });
      showToast("Successfully subscribed to job posting plan!", "success");
      await fetchPlans();
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      showToast(
        error?.message || "Failed to subscribe. Please try again.",
        "error",
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handleCvPlanPurchase = async (planId: number) => {
    try {
      setSubscribing(true);
      await api.createCvSubscription({
        plan_config_id: planId,
        payment_gateway: currency === "usd" ? "stripe" : "razorpay",
      });
      showToast("Successfully purchased CV credits!", "success");
      await fetchPlans();
    } catch (error: any) {
      console.error("Failed to purchase:", error);
      showToast(
        error?.message || "Failed to purchase. Please try again.",
        "error",
      );
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading pricing plans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Currency Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${currency === "usd"
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
            }`}
        >
          USD
        </span>
        <button
          onClick={() => setCurrency(currency === "usd" ? "inr" : "usd")}
          className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"
        >
          <div
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-blue-600 rounded-full transition-transform ${currency === "inr" ? "translate-x-7" : ""
              }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${currency === "inr"
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
            }`}
        >
          INR
        </span>
      </div>

      {/* Job Posting Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Job Posting Plans
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to post jobs and manage applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobPlans.map((plan, index) => {
            const isCurrentPlan =
              subscription?.job_subscription?.plan_config_id === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${isCurrentPlan
                    ? "border-green-500 shadow-lg"
                    : index === 1
                      ? "border-blue-600 shadow-lg"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      <Check className="w-3 h-3" />
                      Current Plan
                    </span>
                  </div>
                )}
                {!isCurrentPlan && index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currency === "usd" ? "$" : "₹"}
                    </span>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {currency === "usd" ? plan.price_usd : plan.price_inr}
                    </span>

                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {getFeatures(plan).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleJobPlanSubscribe(plan.id)}
                  disabled={subscribing || isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${subscribing || isCurrentPlan
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                      : index === 1
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                >
                  {subscribing
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : "Get Started"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CV Access Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            CV Access Credits
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Purchase credits to access candidate resumes and contact information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cvPlans.map((plan, index) => {
            const isCurrentPlan =
              subscription?.cv_subscription?.plan_config_id === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${isCurrentPlan
                    ? "border-green-500 shadow-lg"
                    : index === 1
                      ? "border-purple-600 shadow-lg"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      <Check className="w-3 h-3" />
                      Current Plan
                    </span>
                  </div>
                )}
                {!isCurrentPlan && index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                      <Star className="w-3 h-3" />
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currency === "usd" ? "$" : "₹"}
                    </span>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {currency === "usd" ? plan.price_usd : plan.price_inr}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    {plan.credits_per_period} Credits
                  </div>
                </div>

                <div className="mb-6">
                  <ul className="space-y-2">
                    {getCvFeatures(plan).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCvPlanPurchase(plan.id)}
                  disabled={subscribing || isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${subscribing || isCurrentPlan
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                      : index === 1
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                >
                  {subscribing
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : "Purchase"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

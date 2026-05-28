"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Crown, Star } from "lucide-react";
import { api } from "@/lib/api";
import { initPaddle, openCheckout, formatDisplayPrice } from "@/lib/paddle";
import type {
  JobPlan,
  CvPlan,
  SubscriptionDashboard,
  CheckoutContextResponse,
} from "@/types/api";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type CurrencyHint = "USD" | "INR";

const isFreePlan = (plan: JobPlan | CvPlan): boolean => {
  return Number(plan.price_usd) === 0 && Number(plan.price_inr) === 0;
};

const symbolFor = (currency: CurrencyHint) =>
  currency === "INR" ? "₹" : "$";

const priceFor = (
  plan: JobPlan | CvPlan,
  currency: CurrencyHint,
): string => (currency === "INR" ? plan.price_inr : plan.price_usd);

export default function PricingPlans() {
  const { showToast } = useToast();
  const router = useRouter();
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [cvPlans, setCvPlans] = useState<CvPlan[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  // Currency is auto-detected via /pricing/detect-location; no manual toggle.
  const [currency, setCurrency] = useState<CurrencyHint>("USD");
  const [countryName, setCountryName] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [busyPlanKey, setBusyPlanKey] = useState<string | null>(null);

  // CV replacement-warning modal state
  const [pendingCvCheckout, setPendingCvCheckout] = useState<{
    ctx: CheckoutContextResponse;
    planName: string;
  } | null>(null);

  useEffect(() => {
    void fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [jobPlansData, cvPlansData, subscriptionData, geo] =
        await Promise.all([
          api.getJobPlans(),
          api.getCvPlans(),
          api.getSubscriptionDashboard().catch(() => null),
          api.detectLocation().catch(() => null),
        ]);
      setJobPlans(jobPlansData);
      setCvPlans(cvPlansData);
      setSubscription(subscriptionData);
      if (geo) {
        const detected = (geo.currency || "USD").toUpperCase();
        setCurrency(detected === "INR" ? "INR" : "USD");
        setCountryName(geo.country_name || null);
      }
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

  const successUrlFor = (type: "job" | "cv"): string => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/recruiter/billing/success?type=${type}`;
  };

  /**
   * Launch the Paddle.js overlay with the backend-issued context.
   * Returns once the overlay is open; checkout.completed redirects via Paddle.
   */
  const launchOverlay = async (
    ctx: CheckoutContextResponse,
    type: "job" | "cv",
  ) => {
    const paddle = await initPaddle(ctx.client_token, ctx.environment);
    await openCheckout(
      paddle,
      ctx,
      {
        onCompleted: () => {
          router.push(`/recruiter/billing/success?type=${type}`);
        },
        onClosed: () => {
          // User dismissed without paying — no toast (avoids noise).
        },
        onError: () => {
          showToast(
            "Checkout failed. Please try again or contact support.",
            "error",
          );
        },
      },
      successUrlFor(type),
    );
  };

  const handleJobPlanSubscribe = async (plan: JobPlan) => {
    const key = `job-${plan.id}`;
    try {
      setSubscribing(true);
      setBusyPlanKey(key);

      if (isFreePlan(plan)) {
        // Free plan path — legacy endpoint still accepts free plans.
        await api.createJobSubscription({ plan_config_id: plan.id });
        showToast("Free Job plan activated.", "success");
        await fetchPlans();
        return;
      }

      const ctx = await api.paddleCheckoutJob({
        plan_config_id: plan.id,
        currency_hint: currency,
        success_url: successUrlFor("job"),
      });
      await launchOverlay(ctx, "job");
    } catch (error: unknown) {
      console.error("Failed to subscribe:", error);
      const msg =
        error instanceof Error ? error.message : "Failed to subscribe.";
      showToast(msg, "error");
    } finally {
      setSubscribing(false);
      setBusyPlanKey(null);
    }
  };

  const handleCvPlanPurchase = async (plan: CvPlan) => {
    const key = `cv-${plan.id}`;
    try {
      setSubscribing(true);
      setBusyPlanKey(key);

      if (isFreePlan(plan)) {
        await api.createCvSubscription({ plan_config_id: plan.id });
        showToast("Free CV plan activated.", "success");
        await fetchPlans();
        return;
      }

      const ctx = await api.paddleCheckoutCv({
        plan_config_id: plan.id,
        currency_hint: currency,
        success_url: successUrlFor("cv"),
      });

      // If buying this pack would replace an active pack with unused credits,
      // surface a confirmation modal before opening the Paddle overlay.
      if (ctx.will_replace_active_pack) {
        setPendingCvCheckout({ ctx, planName: plan.name });
        return;
      }

      await launchOverlay(ctx, "cv");
    } catch (error: unknown) {
      console.error("Failed to purchase:", error);
      const msg = error instanceof Error ? error.message : "Failed to purchase.";
      showToast(msg, "error");
    } finally {
      setSubscribing(false);
      setBusyPlanKey(null);
    }
  };

  const confirmCvReplacement = async () => {
    if (!pendingCvCheckout) return;
    const { ctx } = pendingCvCheckout;
    try {
      setSubscribing(true);
      await launchOverlay(ctx, "cv");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to open checkout.";
      showToast(msg, "error");
    } finally {
      setSubscribing(false);
      setPendingCvCheckout(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-primary-blue mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading pricing plans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 my-12 max-w-7xl mx-auto">

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
            const free = isFreePlan(plan);
            const busy = busyPlanKey === `job-${plan.id}`;
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${isCurrentPlan
                  ? "border-green-500 shadow-lg"
                  : index === 1
                    ? "border-primary-blue shadow-lg"
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue text-white text-xs font-semibold rounded-full">
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
                      {symbolFor(currency)}
                    </span>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {priceFor(plan, currency)}
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
                  onClick={() => void handleJobPlanSubscribe(plan)}
                  disabled={subscribing || isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${subscribing || isCurrentPlan
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    : index === 1
                      ? "bg-primary-blue hover:bg-blue-700 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                >
                  {busy
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : free
                        ? "Activate Free"
                        : "Subscribe"}
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
            const free = isFreePlan(plan);
            const busy = busyPlanKey === `cv-${plan.id}`;
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
                      {symbolFor(currency)}
                    </span>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {priceFor(plan, currency)}
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
                  onClick={() => void handleCvPlanPurchase(plan)}
                  disabled={subscribing || isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${subscribing || isCurrentPlan
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    : index === 1
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                >
                  {busy
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : free
                        ? "Activate Free"
                        : "Purchase"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CV replacement confirmation */}
      <ConfirmDialog
        isOpen={!!pendingCvCheckout}
        onClose={() => setPendingCvCheckout(null)}
        onConfirm={() => void confirmCvReplacement()}
        title={
          pendingCvCheckout
            ? `Replace your active CV pack with ${pendingCvCheckout.planName}?`
            : "Replace active CV pack?"
        }
        message={
          pendingCvCheckout
            ? `You currently have ${pendingCvCheckout.ctx.active_pack_credits_remaining ?? 0} unused credits` +
            (pendingCvCheckout.ctx.active_pack_expires_at
              ? ` (expiring ${new Date(pendingCvCheckout.ctx.active_pack_expires_at).toLocaleDateString()})`
              : "") +
            `. Purchasing a new pack will replace the active one and any unused credits will be lost.` +
            (pendingCvCheckout.ctx.display_amount_minor != null
              ? ` You'll be charged ${formatDisplayPrice(pendingCvCheckout.ctx.display_amount_minor, pendingCvCheckout.ctx.display_currency)}.`
              : "")
            : ""
        }
        confirmText="Continue to checkout"
        cancelText="Keep current pack"
        variant="danger"
        loading={subscribing}
      />
    </div>
  );
}

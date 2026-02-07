"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { JobPlan, CvPlan } from "@/types/api";
import { Check, Crown, Star, Zap } from "lucide-react";
import Header from "./Header";
import FAQSection from "./shared/FAQSection";

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [cvPlans, setCvPlans] = useState<CvPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getRecruiterPricing();
      setJobPlans(data.job_plans);
      setCvPlans(data.cv_plans);
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      // Use fallback static data if API fails
    } finally {
      setLoading(false);
    }
  };

  const getFeatures = (plan: JobPlan): string[] => {
    const features: string[] = [];

    // Add job duration
    features.push(`${plan.job_duration_days} days job duration`);

    // Add visibility
    if (plan.has_basic_visibility) features.push("Basic visibility");

    // Add analytics
    if (plan.has_analytics) features.push("Advanced analytics");
    else if (plan.has_limited_analytics) features.push("Basic analytics");

    // Add premium features
    if (plan.has_featured_jobs) features.push("Featured job listings");
    if (plan.has_bulk_messaging) features.push("Bulk messaging");
    if (plan.has_priority_support) features.push("Priority support");

    return features;
  };

  const getCvFeatures = (plan: CvPlan): string[] => {
    const features: string[] = [];
    features.push("90-day access per profile");
    if (plan.has_bulk_download) features.push("Bulk Download");
    if (plan.has_advanced_filters) features.push("Advanced Filters");
    if (plan.has_priority_cv_access) features.push("Priority CV Access");
    return features;
  };

  const PlanCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
      <div className="mb-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 mt-0.5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        ))}
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  return (
    <>
      <Header
        links={[
          { label: "Home", href: "/" },
          { label: "Jobs", href: "/jobs" },
          { label: "Blog", href: "/blog" },
        ]}
        cta={{
          label: "Get Started",
          href: "/candidate/signup",
          variant: "primary",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Simple, transparent pricing
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Choose the perfect plan
            <br />
            <span className="text-blue-600">for your hiring needs</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Whether you&apos;re looking for a job or looking for talent,
            we&apos;ve got flexible plans that scale with your business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>14-day money back</span>
            </div>
          </div>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className={`text-sm font-medium ${
              currency === "usd"
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
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-blue-600 rounded-full transition-transform ${
                currency === "inr" ? "translate-x-7" : ""
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              currency === "inr"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            INR
          </span>
        </div>

        {/* Job Posting Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Job Posting Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading ? (
              // Show skeleton loaders while loading
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : (
              jobPlans.map((plan) => {
                const getBorderColor = () => {
                  if (plan.slug === "free") return "border-blue-400";
                  if (plan.slug === "basic") return "border-yellow-400";
                  if (plan.slug === "premium") return "border-green-400";
                  return "border-gray-300";
                };

                const getButtonStyle = () => {
                  if (plan.slug === "free")
                    return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default";
                  if (plan.slug === "basic")
                    return "bg-purple-600 hover:bg-purple-700 text-white";
                  if (plan.slug === "premium")
                    return "bg-green-600 hover:bg-green-700 text-white";
                  return "bg-blue-600 hover:bg-blue-700 text-white";
                };

                const getButtonText = () => {
                  if (plan.slug === "free") return "Current Plan";
                  if (plan.slug === "basic") return "Upgrade to Basic";
                  if (plan.slug === "premium") return "Upgrade to premium";
                  return "Get Started";
                };

                return (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 ${getBorderColor()} flex flex-col relative hover:shadow-lg transition-shadow`}
                  >
                    {plan.slug === "basic" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          <Crown className="w-3 h-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                        {plan.slug === "basic" && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            save 50%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {currency === "usd" ? "$" : "₹"}
                        </span>
                        <span className="text-5xl font-bold text-gray-900 dark:text-white">
                          {currency === "usd" ? plan.price_usd : plan.price_inr}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.name}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        plan.slug !== "free" && onNavigate("recruiter/signup")
                      }
                      className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${getButtonStyle()}`}
                    >
                      {getButtonText()}
                    </button>

                    <ul className="space-y-3 flex-grow">
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.job_post_limit === null
                            ? "Unlimited"
                            : plan.job_post_limit}{" "}
                          active job listings
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.applicants_per_job === null
                            ? "Unlimited"
                            : plan.applicants_per_job}{" "}
                          applicant reveals per job
                        </span>
                      </li>
                      {getFeatures(plan).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CV Access Plans */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            CV Access Credits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading ? (
              // Show skeleton loaders while loading
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : (
              cvPlans.map((plan) => {
                const getBorderColor = () => {
                  if (plan.slug === "silver") return "border-gray-400";
                  if (plan.slug === "gold") return "border-yellow-400";
                  if (plan.slug === "platinum") return "border-purple-400";
                  return "border-gray-300";
                };

                const getButtonStyle = () => {
                  if (plan.slug === "silver")
                    return "bg-gray-600 hover:bg-gray-700 text-white";
                  if (plan.slug === "gold")
                    return "bg-purple-600 hover:bg-purple-700 text-white";
                  if (plan.slug === "platinum")
                    return "bg-purple-700 hover:bg-purple-800 text-white";
                  return "bg-blue-600 hover:bg-blue-700 text-white";
                };

                const getButtonText = () => {
                  if (plan.slug === "silver") return "Upgrade to Silver";
                  if (plan.slug === "gold") return "Upgrade to Gold";
                  if (plan.slug === "platinum") return "Upgrade to Platinum";
                  return "Purchase";
                };

                return (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 ${getBorderColor()} flex flex-col relative hover:shadow-lg transition-shadow`}
                  >
                    {plan.slug === "gold" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          <Crown className="w-3 h-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {currency === "usd" ? "$" : "₹"}
                        </span>
                        <span className="text-5xl font-bold text-gray-900 dark:text-white">
                          {currency === "usd" ? plan.price_usd : plan.price_inr}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.name}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate("recruiter/signup")}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${getButtonStyle()}`}
                    >
                      {getButtonText()}
                    </button>

                    <ul className="space-y-3 flex-grow">
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {plan.credits_per_period} CV unlocks per month
                        </span>
                      </li>
                      {getCvFeatures(plan).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="my-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Compare Plans
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            See what features are included in each plan
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Features
                  </th>
                  {jobPlans.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center p-4 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Active job listings
                  </td>
                  {jobPlans.map((plan) => (
                    <td
                      key={plan.id}
                      className="text-center p-4 text-sm text-gray-900 dark:text-white font-medium"
                    >
                      {plan.job_post_limit === null
                        ? "Unlimited"
                        : plan.job_post_limit}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Applicant reveals
                  </td>
                  {jobPlans.map((plan) => (
                    <td
                      key={plan.id}
                      className="text-center p-4 text-sm text-gray-900 dark:text-white font-medium"
                    >
                      {plan.applicants_per_job === null
                        ? "Unlimited"
                        : plan.applicants_per_job}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Job duration
                  </td>
                  {jobPlans.map((plan) => (
                    <td
                      key={plan.id}
                      className="text-center p-4 text-sm text-gray-900 dark:text-white font-medium"
                    >
                      {plan.job_duration_days} days
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Analytics
                  </td>
                  {jobPlans.map((plan) => (
                    <td key={plan.id} className="text-center p-4">
                      {plan.has_analytics ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : plan.has_limited_analytics ? (
                        <span className="text-xs text-gray-500">Basic</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Featured jobs
                  </td>
                  {jobPlans.map((plan) => (
                    <td key={plan.id} className="text-center p-4">
                      {plan.has_featured_jobs ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Bulk messaging
                  </td>
                  {jobPlans.map((plan) => (
                    <td key={plan.id} className="text-center p-4">
                      {plan.has_bulk_messaging ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Priority support
                  </td>
                  {jobPlans.map((plan) => (
                    <td key={plan.id} className="text-center p-4">
                      {plan.has_priority_support ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our pricing plans"
          faqs={[
            {
              question: "Can I switch plans at any time?",
              answer:
                "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets. All payments are processed securely through our payment partner.",
            },
            {
              question: "Do CV credits expire?",
              answer:
                "CV credits are valid for 90 days from the date of purchase. Any unused credits will expire after this period, so make sure to use them within the validity window.",
            },
            {
              question: "Is there a refund policy?",
              answer:
                "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your plan, contact us within 14 days for a full refund, no questions asked.",
            },
            {
              question: "Can I get a custom enterprise plan?",
              answer:
                "Absolutely! For organizations with unique requirements or high-volume hiring needs, we offer custom enterprise plans. Contact our sales team to discuss your specific needs.",
            },
          ]}
        />

        {/* Trust Section */}
        <div className="my-20 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by 10,000+ companies worldwide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of recruiters who have already found their perfect
              candidates through our platform
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  50K+
                </div>
                <div className="text-xs mt-1">Jobs Posted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  200K+
                </div>
                <div className="text-xs mt-1">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  95%
                </div>
                <div className="text-xs mt-1">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="my-20 text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to find your next hire?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Start posting jobs today and connect with thousands of qualified
              candidates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate("recruiter/signup")}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => onNavigate("recruiter/login")}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors border-2 border-white/20"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;

import { Metadata } from "next";
import config from "@/config";
import { api } from "@/lib/api";
import type { JobPlan, CvPlan } from "@/types/api";
import PricingContent from "./PricingContent";

// Rendered per request. Without this the route prerenders at build time and the prices are
// frozen into the deployed HTML until the next deploy — the same staleness that pinned the
// recruiter profiles and the sitemaps to old data, except here it would be advertising a
// price we may no longer charge. Crawler traffic on one page is not worth that risk.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for PreviewCV. Free for candidates; flexible plans for recruiters to post jobs and search talent.",
  alternates: config.app.siteUrl
    ? { canonical: `${config.app.siteUrl}/pricing` }
    : undefined,
  openGraph: {
    title: "Pricing | PreviewCV",
    description:
      "Free for candidates; flexible plans for recruiters to post jobs and search talent.",
    type: "website",
  },
};

// Plans are fetched on the server so the cards — names, prices, billing period and
// features — are in the initial HTML. They were previously loaded only in a useEffect, so
// crawlers saw the headings and FAQ and nothing else on a page meant to rank for pricing.
//
// Deliberately uncached. Prices are the one thing on this site that must never be served
// stale: KV-backed caching has already frozen two other surfaces in this app for days, and
// advertising a price we no longer charge is worse than a ~300ms fetch. The client still
// fetches if this fails, so the page degrades rather than breaks.
async function getPricingPlans(): Promise<{
  jobPlans: JobPlan[];
  cvPlans: CvPlan[];
}> {
  try {
    const data = await api.getRecruiterPricing();
    return { jobPlans: data.job_plans ?? [], cvPlans: data.cv_plans ?? [] };
  } catch (error) {
    console.error("Failed to fetch pricing plans", error);
    return { jobPlans: [], cvPlans: [] };
  }
}

export default async function PricingPage() {
  const { jobPlans, cvPlans } = await getPricingPlans();

  return <PricingContent initialJobPlans={jobPlans} initialCvPlans={cvPlans} />;
}

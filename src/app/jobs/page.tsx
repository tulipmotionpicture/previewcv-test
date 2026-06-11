import { Suspense } from "react";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import config from "@/config";
import JobsContent from "./JobsContent";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; country?: string }>;
}): Promise<Metadata> {
  const { keyword = "", country = "" } = await searchParams;

  const parts = ["Browse Jobs"];
  if (keyword) parts[0] = `${keyword} Jobs`;
  if (country) parts.push(`in ${country}`);
  const title = parts.join(" ");

  return {
    title,
    description:
      "Search and apply to jobs from top employers on PreviewCV. Filter by role, location, salary, and experience to find your next opportunity.",
    alternates: config.app.siteUrl
      ? { canonical: `${config.app.siteUrl}/jobs` }
      : undefined,
    openGraph: {
      title: `${title} | PreviewCV`,
      description:
        "Search and apply to jobs from top employers on PreviewCV.",
      type: "website",
    },
  };
}

// First page of results is fetched on the server so the job list is in the initial HTML.
async function getInitialJobs(
  keyword: string,
  country: string,
): Promise<{ jobs: Job[]; total: number }> {
  const params = new URLSearchParams();
  if (keyword) params.append("skill_search", keyword);
  if (country) params.append("country", country);
  params.append("limit", "10");
  params.append("offset", "0");

  try {
    const res = await api.getJobs(params);
    return { jobs: res.items || res.jobs || [], total: res.total || 0 };
  } catch {
    return { jobs: [], total: 0 };
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; country?: string }>;
}) {
  const { keyword = "", country = "" } = await searchParams;
  const { jobs, total } = await getInitialJobs(keyword, country);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        </div>
      }
    >
      <JobsContent
        initialJobs={jobs}
        initialTotal={total}
        initialKeyword={keyword}
        initialCountry={country}
      />
    </Suspense>
  );
}

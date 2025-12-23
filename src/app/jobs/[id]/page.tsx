import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import { Job } from "@/types/api";
import JobDetailsClient from "./JobDetailsClient";
import { notFound } from "next/navigation";

// Server-side data fetching function using job ID
async function getJobById(id: string): Promise<Job | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://letsmakecv.tulip-software.com";
    const response = await fetch(`${apiUrl}/api/v1/jobs/${id}`, {
      cache: "no-store", // Always fetch fresh data for job details
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch job: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Handle both response formats
    if (data.success && data.job) {
      return data.job;
    } else if (data.job) {
      return data.job;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: "Job Not Found | PreviewCV",
      description: "The job you are looking for could not be found.",
    };
  }

  const title = `${job.title} at ${job.company_name} | PreviewCV`;
  const description = job.description.substring(0, 160) + "...";
  const imageUrl = job.company_logo_url || config.app.logoUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${job.company_name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src={config.app.logoUrl}
                alt={config.app.name}
                width={120}
                height={120}
                className="h-12 w-auto"
              />
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              href="/jobs"
              className="px-6 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Company Logo */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-4xl md:text-5xl flex-shrink-0 p-3">
                {job.company_logo_url ? (
                  <Image
                    src={job.company_logo_url}
                    alt={job.company_name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span>🏢</span>
                )}
              </div>

              <div className="flex-1">
                {/* Company Name */}
                <div className="mb-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                    {job.company_name}
                  </span>
                </div>

                {/* Job Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                  {job.title}
                </h1>

                {/* Job Meta Info */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.location}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {job.job_type.replace("_", " ")}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold border border-green-200 dark:border-green-800">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {job.salary_min
                        ? formatCurrency(
                            job.salary_min,
                            job.salary_currency || "USD"
                          )
                        : ""}
                      {job.salary_max
                        ? ` - ${formatCurrency(
                            job.salary_max,
                            job.salary_currency || "USD"
                          )}`
                        : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About the Role */}
              <section className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    About the Role
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </section>

              {/* Responsibilities */}
              {job.responsibilities && (
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                      Responsibilities
                    </h2>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && (
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                      Requirements
                    </h2>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Application Form */}
            <div className="lg:col-span-1">
              <JobDetailsClient job={job} jobId={id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

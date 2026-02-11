import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import { Job } from "@/types/api";
import JobDetailsClient from "./JobDetailsClient";
import JobDetailsSidebar from "@/components/JobDetailsSidebar";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import {
  MapPin,
  Briefcase,
  Zap,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Building2,
  ChevronRight,
  ArrowLeft,
  Search,
} from "lucide-react";

// Server-side data fetching function for individual job details
async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    const response = await api.getJobBySlug(slug);
    return response.job;
  } catch (error) {
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Header
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
      />

      <div className="pt-18  px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Search Bar - Matches Job Page */}
        <div className="border border-[#E1E8F1] rounded-xl dark:border-gray-700 p-4 bg-white dark:bg-gray-900 mb-6 shadow-sm">
          <div className="mb-2">
            <form action="/jobs" className="flex flex-col lg:flex-row items-stretch gap-3">
              {/* Keyword Input */}
              <div className="flex-[2] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 hover:border-blue-400 transition-colors">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  name="keyword"
                  placeholder="Enter Skills, Destinations, or Company Name"
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 py-3"
                />
              </div>

              {/* Location Input */}
              <div className="flex-[1.5] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 hover:border-blue-400 transition-colors">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter City or County"
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 py-3"
                />
              </div>

              {/* Experience/Salary Input */}
              <div className="flex-[1.5] bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 flex items-center px-4 hover:border-blue-400 transition-colors">
                <span className="w-5 h-5 text-gray-400 mr-3 flex items-center justify-center font-bold text-lg shrink-0">₹</span>
                <input
                  type="text"
                  name="salary"
                  placeholder="Enter Salary"
                  className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm font-medium focus:ring-0 py-3"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap min-w-[140px]"
              >
                Search Job
              </button>
            </form>
          </div>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <JobDetailsSidebar currentJob={job} />
            </div>
          </div>

          {/* Main Content - Center */}
          <div className="lg:col-span-6 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 p-2">
                  {job.company_logo_url ? (
                    <Image
                      src={job.company_logo_url}
                      alt={job.company_name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={job.recruiter_profile_url || "#"}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 hover:underline"
                  >
                    {job.company_name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold text-gray-600 dark:text-gray-300 capitalize">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.job_type.replace("_", " ")}
                    </div>
                    {job.is_remote && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold uppercase">
                        Remote
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary_min
                          ? formatCurrency(job.salary_min, job.salary_currency || "USD")
                          : ""}
                        {job.salary_max
                          ? ` - ${formatCurrency(job.salary_max, job.salary_currency || "USD")}`
                          : ""}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-6 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Posted{" "}
                      {new Date(job.posted_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {job.application_count} applicants
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  About the Role
                </h2>
                <div
                  className="prose prose-sm prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>

              {job.responsibilities && (
                <section className="mb-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Responsibilities
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </section>
              )}

              {job.requirements && (
                <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Requirements
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </section>
              )}
            </div>

            {/* Skills Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
                {(!job.required_skills || job.required_skills.length === 0) && (
                  <span className="text-sm text-gray-500">No specific skills listed</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Application */}
          <div className="lg:col-span-3">
            <JobDetailsClient job={job} slug={slug} />
          </div>
        </div>
      </div>
    </div>
  );
}

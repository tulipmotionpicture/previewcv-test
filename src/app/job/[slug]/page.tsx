import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import { Job } from "@/types/api";
import JobDetailsClient from "./JobDetailsClient";
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
    <div className="min-h-screen bg-[#F0F9FF] dark:bg-gray-950 transition-colors duration-200">
      {/* Navigation - Flat Design */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="cursor-pointer">
              <Image
                src={config.app.logoUrl}
                alt={config.app.name}
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#0369A1] dark:hover:text-[#0EA5E9] transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Jobs
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Header Section - Flat Design */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Company Logo - Flat Design */}
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 p-3">
                {job.company_logo_url ? (
                  <Image
                    src={job.company_logo_url}
                    alt={job.company_name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-[#0369A1]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Company Name Badge - Flat Design */}
                <Link
                  href={job.recruiter_profile_url || "#"}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0369A1] dark:text-[#0EA5E9] text-xs font-bold rounded uppercase tracking-wider border border-[#0EA5E9]/20 dark:border-[#0EA5E9]/10 hover:bg-[#0EA5E9]/10 transition-colors duration-150 mb-3 cursor-pointer"
                >
                  {job.company_name}
                  <ChevronRight className="w-3 h-3" />
                </Link>

                {/* Job Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-4 leading-tight">
                  {job.title}
                </h1>

                {/* Primary Meta Info - Flat Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-[#0369A1]" />
                    {job.location}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                    <Briefcase className="w-4 h-4 text-[#0369A1]" />
                    {job.job_type.replace("_", " ")}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0369A1] dark:text-[#0EA5E9] rounded-lg border border-[#0EA5E9]/20 dark:border-[#0EA5E9]/10 text-sm font-bold capitalize">
                    <Zap className="w-4 h-4" />
                    {job.experience_level}
                  </div>

                  {job.is_remote && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 text-sm font-bold uppercase">
                      Remote
                    </div>
                  )}

                  {(job.salary_min || job.salary_max) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 text-sm font-bold">
                      <DollarSign className="w-4 h-4" />
                      {job.salary_min
                        ? formatCurrency(
                            job.salary_min,
                            job.salary_currency || "USD",
                          )
                        : ""}
                      {job.salary_max
                        ? ` - ${formatCurrency(job.salary_max, job.salary_currency || "USD")}`
                        : ""}
                    </div>
                  )}
                </div>

                {/* Stats Row - Flat Design */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0369A1]" />
                    Posted{" "}
                    {new Date(job.posted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0369A1]" />
                    {job.application_count} applicants
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#0369A1]" />
                    {job.view_count} views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Flat Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description Card - Flat Design */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
                {/* About the Role */}
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#0369A1] rounded-full"></div>
                    About the Role
                  </h2>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none
                      prose-headings:text-[#0C4A6E] dark:prose-headings:text-gray-100
                      prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                      prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                      prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                      prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                      prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-6"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </section>

                {/* Responsibilities */}
                {job.responsibilities && (
                  <section className="mb-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#0EA5E9] rounded-full"></div>
                      Responsibilities
                    </h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
                      {job.responsibilities}
                    </div>
                  </section>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <section className="pt-10 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#F59E0B] rounded-full"></div>
                      Requirements
                    </h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
                      {job.requirements}
                    </div>
                  </section>
                )}
              </div>

              {/* Skills & Categories Card - Flat Design */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Categories */}
                  {job.categories && job.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                        Job Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                        Key Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0369A1] dark:text-[#0EA5E9] text-xs font-bold rounded-lg border border-[#0EA5E9]/20 dark:border-[#0EA5E9]/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Application Form */}
            <div className="lg:col-span-1">
              <JobDetailsClient job={job} slug={slug} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

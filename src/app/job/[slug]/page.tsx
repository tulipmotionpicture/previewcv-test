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
  ExternalLink,
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

      <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 p-1.5 overflow-hidden">
                  {job.company_logo_url ? (
                    <Image
                      src={job.company_logo_url}
                      alt={job.company_name}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                    {job.title}
                  </h1>
                  <p className="text-base text-gray-600 dark:text-gray-400 font-medium mb-3">
                    {job.company_name}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.experience_level ? `${job.experience_level.replace("entry", "0-2").replace("mid", "2-5").replace("senior", "5+").replace("executive", "10+")} years` : "Experience not specified"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.experience_level ? `${job.experience_level.replace("entry", "0-2").replace("mid", "2-5").replace("senior", "5+").replace("executive", "10+")} years` : "Experience not specified"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.salary_min || job.salary_max) && (
                      <div className="inline-flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                        <span className="text-gray-500">₹</span>
                        {job.salary_min
                          ? formatCurrency(job.salary_min, job.salary_currency || "USD").replace("US$", "").replace("$", "")
                          : ""}
                        {job.salary_max
                          ? ` - ${formatCurrency(job.salary_max, job.salary_currency || "USD").replace("US$", "").replace("$", "")}`
                          : ""}
                      </div>
                    )}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>

                    {job.is_remote && (
                      <div className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-100 dark:border-orange-800">
                        Remote
                      </div>
                    )}
                    <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800 uppercase">
                      {job.experience_level || "Mid Level"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Posted {new Date(job.posted_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {job.application_count} applicants
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {job.view_count} views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  About the Role
                </h2>
                <div
                  className="prose prose-sm prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>

              {job.responsibilities && (
                <section className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Responsibilities
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </section>
              )}

              {job.requirements && (
                <section className="">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Requirements
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </section>
              )}
            </div>

            {/* Skills Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-1.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-900"
                  >
                    {skill}
                  </span>
                ))}
                {(!job.required_skills || job.required_skills.length === 0) && (
                  <span className="text-sm text-gray-500">No specific skills listed</span>
                )}
              </div>
            </div>

            {/* About the Company Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                About the company
              </h3>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden p-1">
                    {job.company_logo_url ? (
                      <Image
                        src={job.company_logo_url}
                        alt={job.company_name}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.company_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <Link href="#" className="flex items-center gap-1 hover:text-blue-600">
                        <ExternalLink className="w-4 h-4" />
                        visit website
                      </Link>
                      <Link href="#" className="text-blue-600 hover:text-blue-700">
                        <div className="w-5 h-5 bg-[#0077b5] text-white rounded flex items-center justify-center text-[10px] font-bold">in</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-bold text-gray-900 dark:text-gray-100">Overview</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {/* Placeholder overview text since it's not in Job object */}
                  From Strategy to Execution with {job.company_name}. Become better, leaner, and future-ready. At {job.company_name}, we work shoulder to shoulder with our clients—not just advising, but executing transformation. With deep industry and... <span className="text-blue-600 cursor-pointer">read more</span>
                </p>
              </div>

              {/* Placeholder Images for "About Company" Carousel */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80" alt="Office" fill className="object-cover" />
                </div>
                <div className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80" alt="Team" fill className="object-cover" />
                </div>
                <div className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=300&q=80" alt="Meeting" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Application */}
          <div className="lg:col-span-4">
            <JobDetailsClient job={job} slug={slug} />
          </div>
        </div>
      </div>
    </div>
  );
}

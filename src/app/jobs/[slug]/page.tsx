import { Metadata } from "next";
import { notFound } from "next/navigation";
import FloatingHeader from "@/components/FloatingHeader";
import { api } from "@/lib/api";
import type { SEOJobsResponse } from "@/types/jobs";
import SEOJobsListWithLayout from "@/components/jobs/SEOJobsListWithLayout";

// Server-side data fetching function for SEO-based job listings
// Uses /api/v1/jobs/by-slug/{path} endpoint for patterns like:
// - "jobs-in-bangalore"
// - "remote-python-developer-jobs"
// - "full-time-jobs-in-india"
async function getJobsBySEOSlug(slug: string): Promise<SEOJobsResponse | null> {
  try {
    const response = await api.getJobsBySlug(slug, { limit: 20 });
    return response;
  } catch (error) {
    // Silently return null for invalid SEO patterns
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
  const data = await getJobsBySEOSlug(slug);

  if (!data || !data.success || !data.meta) {
    return {
      title: "Jobs Not Found | PreviewCV",
      description: "The jobs you are looking for could not be found.",
    };
  }

  return {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    openGraph: {
      title: data.meta.title,
      description: data.meta.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.meta.title,
      description: data.meta.description,
    },
    alternates: {
      canonical: data.meta.canonical_url,
    },
  };
}

export default async function SEOJobsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getJobsBySEOSlug(slug);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />
      <div className="pt-18 pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        <SEOJobsListWithLayout slug={slug} limit={10} />
      </div>
    </div>
  );
}

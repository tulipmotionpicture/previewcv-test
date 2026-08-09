import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import FloatingHeader from "@/components/FloatingHeader";
import { api } from "@/lib/api";
import type { SEOJobsResponse } from "@/types/jobs";
import SEOJobsListWithLayout from "@/components/jobs/SEOJobsListWithLayout";

// ISR: cache the render in KV + revalidate every 5 min. fetchCache makes the
// server-side data fetches cacheable (they default to no-store in Next 15) so the
// page is served from cache instead of re-rendering (SSR) on every request.
export const revalidate = 300;
export const fetchCache = "default-cache";
// Defining generateStaticParams (even empty) puts this dynamic route into ISR mode:
// unknown slugs render on-demand and are then cached in KV (dynamicParams defaults to
// true), instead of SSR-ing on every request.
export async function generateStaticParams() {
  return [];
}

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
      // Build the canonical from the slug rather than trusting the backend's
      // meta.canonical_url: that value omits the `/jobs` path segment (it returns
      // e.g. "/jobs-in-dubai-united-arab-emirates"), which resolves to a 404. A
      // canonical pointing at a missing URL stops the page being indexed at all.
      canonical: `${config.app.siteUrl}/jobs/${slug}`,
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
        {/* SEOJobsListWithLayout is a client component that reads useSearchParams().
            This page is prerendered/ISR (see revalidate + generateStaticParams above),
            so without a Suspense boundary the render bails out to CSR and throws
            BAILOUT_TO_CLIENT_SIDE_RENDERING -> 500 on every /jobs/[slug] request. */}
        <Suspense
          fallback={
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          }
        >
          <SEOJobsListWithLayout slug={slug} limit={10} />
        </Suspense>
      </div>
    </div>
  );
}

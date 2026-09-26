import { Suspense } from "react";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import config from "@/config";
import FloatingHeader from "@/components/FloatingHeader";
import { api } from "@/lib/api";
import { isNotFoundError } from "@/lib/apiErrors";
import { countryQualifiedSlug, isLandingSlugShape } from "@/lib/seoPatterns";
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

// Page size shared by the server-rendered first page and the client's "load more"
// pagination (which continues from offset = PAGE_SIZE), so they must match.
const PAGE_SIZE = 10;

// Server-side data fetching function for SEO-based job listings
// Uses /api/v1/jobs/by-slug/{path} endpoint for patterns like:
// - "jobs-in-bangalore"
// - "remote-python-developer-jobs"
// - "full-time-jobs-in-india"
async function getJobsBySEOSlug(slug: string): Promise<SEOJobsResponse | null> {
  try {
    const response = await api.getJobsBySlug(slug, { limit: PAGE_SIZE });
    return response;
  } catch (error) {
    // Return null for invalid SEO patterns (404) only; rethrow outages so they
    // aren't cached as a noindex not-found page (see isNotFoundError).
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = isLandingSlugShape(slug) ? await getJobsBySEOSlug(slug) : null;

  if (!data || !data.success || !data.meta) {
    return {
      title: "Jobs Not Found | PreviewCV",
      description: "The jobs you are looking for could not be found.",
    };
  }

  // A landing page with no openings is a thin "No jobs found" page. Keep it reachable
  // for visitors (the pattern may fill up again) but out of the index until it does.
  const hasJobs = (data.pagination?.total ?? 0) > 0;

  return {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    robots: hasJobs ? undefined : { index: false, follow: true },
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
  if (!isLandingSlugShape(slug)) {
    notFound();
  }
  const data = await getJobsBySEOSlug(slug);

  if (!data || !data.success) {
    notFound();
  }

  // City-only slugs duplicate their country-qualified twin (see countryQualifiedSlug).
  // A failed pattern lookup just skips the redirect; the page itself still renders.
  if (data.pattern_type === "location_city") {
    let target: string | null = null;
    try {
      const { patterns } = await api.getSEOPatterns({ limit: 1000, minJobs: 1 });
      target = countryQualifiedSlug(slug, patterns ?? []);
    } catch (error) {
      console.error(`SEO pattern lookup failed for "${slug}"`, error);
    }
    if (target) {
      permanentRedirect(`/jobs/${target}`);
    }
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
        {/* SEOJobsListWithLayout is a client component. It no longer calls
            useSearchParams() (which on this ISR page bailed the list out to client-side
            rendering), and renders from the server-fetched first page so the job links
            are in the HTML. The Suspense boundary stays as a guard for any future
            search-param reads. */}
        <Suspense
          fallback={
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          }
        >
          <SEOJobsListWithLayout slug={slug} limit={PAGE_SIZE} initialData={data} />
        </Suspense>
      </div>
    </div>
  );
}

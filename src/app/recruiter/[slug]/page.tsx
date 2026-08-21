import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import RecruiterProfilePublic from "@/components/RecruiterProfilePublic";
import { buildOrganizationJsonLd } from "@/lib/organizationSchema";
import { toMetaDescription } from "@/lib/metaText";
import { RecruiterProfile } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";

// Server-side data fetch for the public recruiter/company profile.
//
// Wrapped in React's `cache` so generateMetadata and the page body share one result per
// request. Both call this, and now that the fetch is uncached that would otherwise be two
// round-trips to the API on every render — which is what doubled this page's TTFB.
const getRecruiterProfile = cache(async (
  slug: string,
): Promise<RecruiterProfile | null> => {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://letsmakecv.tulip-software.com";
    const response = await fetch(
      `${apiUrl}/api/v1/recruiters/profile/slug/${slug}`,
      {
        // Deliberately uncached. This used to be `next: { revalidate: 3600 }`, whose
        // entry is persisted in KV on Cloudflare (unlike a Node host, where the data
        // cache is wiped on restart). That entry stopped revalidating and pinned the
        // page to a two-day-old snapshot: an empty `bio`, a placeholder logo and an
        // empty `recent_jobs`, so profiles showed "No description provided" and no
        // open positions while the API had all of it. This page is SEO-critical, so
        // it must reflect the live profile on every crawl; the fetch costs ~300ms.
        // Caching can return via on-demand revalidation once the backend can ping a
        // revalidate hook on profile/job changes.
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RecruiterProfile;
  } catch (error) {
    console.error("Failed to fetch recruiter profile:", error);
    return null;
  }
});

/** Public display name, mirroring the logic used inside RecruiterProfilePublic. */
function profileDisplayName(profile: RecruiterProfile): string {
  return (
    (profile.recruiter_type === "company"
      ? profile.company_name || profile.display_name
      : profile.full_name || profile.display_name) ||
    profile.username
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getRecruiterProfile(slug);

  if (!profile) {
    return {
      title: "Profile Not Found | PreviewCV",
      description: "The profile you are looking for could not be found.",
    };
  }

  const name = profileDisplayName(profile);
  // The root layout applies a "%s | PreviewCV" title template — appending the
  // suffix here too rendered as "… | PreviewCV | PreviewCV".
  const title = name;
  // profile.bio is HTML from the rich-text editor, and was previously passed through whole:
  // the tags showed up in shares and the entire 2,000-character bio was dumped into a meta
  // description. The About panel still renders the original HTML untouched.
  const description =
    toMetaDescription(profile.bio) ||
    profile.specialization ||
    `View ${name}'s profile and open positions on PreviewCV.`;
  const canonical = config.app.siteUrl
    ? `${config.app.siteUrl}/recruiter/${profile.username}`
    : undefined;
  const image = profile.company_logo_url || config.app.logoUrl;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonical,
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getRecruiterProfile(slug);

  if (!profile) {
    notFound();
  }

  // schema.org Organization for the employer — these profiles are search landing pages,
  // and the page previously emitted no structured data at all.
  const organizationJsonLd = buildOrganizationJsonLd(profile, config.app.siteUrl);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {organizationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      )}
      <FloatingHeader
        links={[
          { label: "Features", href: "#features" },
          { label: "Sign Up", href: "/recruiter/signup" },
        ]}
        cta={{ label: "Login", href: "/recruiter/login", variant: "secondary" }}
        showAuthButtons={true}
      />

      {/* Jobs and Events Section (client component — handles gallery modal, tabs, etc.) */}
      <RecruiterProfilePublic profile={profile} />
    </div>
  );
}

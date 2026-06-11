import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import RecruiterProfilePublic from "@/components/RecruiterProfilePublic";
import { RecruiterProfile } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";

// Server-side data fetch for the public recruiter/company profile.
async function getRecruiterProfile(
  slug: string,
): Promise<RecruiterProfile | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://letsmakecv.tulip-software.com";
    const response = await fetch(
      `${apiUrl}/api/v1/recruiters/profile/slug/${slug}`,
      {
        next: { revalidate: 3600 }, // Cache & revalidate hourly
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
}

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
  const title = `${name} | PreviewCV`;
  const description =
    profile.bio ||
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
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

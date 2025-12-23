import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { notFound } from "next/navigation";

// Type for recruiter profile from API
interface RecruiterProfile {
  id: number;
  username: string;
  recruiter_type?: string;
  display_name?: string;
  full_name?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  bio?: string;
  location?: string;
  linkedin_url?: string;
  is_verified?: boolean;
  profile_url?: string;
  company_logo_url?: string;
  specialization?: string;
  years_experience?: number;
  created_at?: string;
}

// Server-side data fetching function
async function getRecruiterProfile(
  username: string
): Promise<RecruiterProfile | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://letsmakecv.tulip-software.com";
    const response = await fetch(
      `${apiUrl}/api/v1/recruiters/profile/${username}`,
      {
        cache: "no-store", // Always fetch fresh data
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch profile: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch recruiter profile:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getRecruiterProfile(username);

  if (!profile) {
    return {
      title: "Company Not Found | PreviewCV",
      description:
        "The company profile you are looking for could not be found.",
    };
  }

  const displayName =
    profile.recruiter_type === "company"
      ? profile.company_name || profile.display_name || username
      : profile.full_name || profile.display_name || username;

  const title = `${displayName} | Company Profile | PreviewCV`;
  const description = profile.bio
    ? profile.bio.substring(0, 160) + "..."
    : `View ${displayName}'s company profile on PreviewCV. Browse active job openings and learn more about career opportunities.`;

  const imageUrl = profile.company_logo_url || config.app.logoUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} logo`,
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

export default async function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getRecruiterProfile(username);

  if (!profile) {
    notFound();
  }

  const displayName =
    profile.recruiter_type === "company"
      ? profile.company_name || profile.display_name || username
      : profile.full_name || profile.display_name || username;

  const isCompany = profile.recruiter_type === "company";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={120}
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/candidate/login"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
            >
              Candidate Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Logo/Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-gray-800 rounded-2xl border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden flex items-center justify-center p-4">
                {profile.company_logo_url ? (
                  <Image
                    src={profile.company_logo_url}
                    alt={displayName}
                    width={160}
                    height={160}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="text-6xl">{isCompany ? "🏢" : "👤"}</div>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                    {isCompany ? "🏢 Company" : "👤 Individual Recruiter"}
                  </span>
                  {profile.is_verified && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6 whitespace-pre-line">
                  {profile.bio}
                </p>
              )}

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {profile.location && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      {profile.location}
                    </span>
                  </div>
                )}
                {isCompany && profile.company_website && (
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      Visit Website
                    </span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      LinkedIn
                    </span>
                  </a>
                )}
              </div>

              {/* Company Details */}
              {isCompany && (profile.company_size || profile.industry) && (
                <div className="flex flex-wrap gap-6">
                  {profile.industry && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Industry
                      </span>
                      <p className="text-gray-900 dark:text-gray-100 font-bold mt-1">
                        {profile.industry}
                      </p>
                    </div>
                  )}
                  {profile.company_size && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Company Size
                      </span>
                      <p className="text-gray-900 dark:text-gray-100 font-bold mt-1">
                        {profile.company_size}+ employees
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Recruiter Details */}
              {!isCompany &&
                (profile.specialization || profile.years_experience) && (
                  <div className="flex flex-wrap gap-6">
                    {profile.specialization && (
                      <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Specialization
                        </span>
                        <p className="text-gray-900 dark:text-gray-100 font-bold mt-1">
                          {profile.specialization}
                        </p>
                      </div>
                    )}
                    {profile.years_experience && (
                      <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Experience
                        </span>
                        <p className="text-gray-900 dark:text-gray-100 font-bold mt-1">
                          {profile.years_experience} years
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">
            Interested in Working Together?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Browse our open positions or get in touch to discuss opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-xl transition-all hover:scale-105 shadow-xl shadow-blue-500/25 dark:shadow-blue-500/10"
            >
              Browse All Jobs
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/candidate/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-bold text-base rounded-xl hover:border-blue-600 dark:hover:border-blue-500 transition-all hover:scale-105 shadow-lg"
            >
              Candidate Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  GitGraphIcon,
  PhoneIcon,
  RefreshCwIcon,
  ShareIcon,
} from "lucide-react";


export default function CandidateLanding() {
  return (
    <div className="min-h-screen">
      <Header
        links={[{ label: "Browse Jobs", href: "/jobs" }]}
        cta={{
          label: "Candidate Login",
          href: "/candidate/login",
          variant: "primary",
        }}
        showAuthButtons={false}
      />

      <HeroSection
        subtitle="For Job Seekers"
        title="Showcase Your Work."
        description="Already have a resume on LetsMakeCV? Share it with recruiters using your unique PreviewCV link. Same login, seamless experience."
        showImage={true}
        imageSrc="/sable-flow-o-6GhmpELnw-unsplash 2.png"
        imageAlt="Team collaboration"
        imageStyle="contain"
        showJobSearch={false}
        ctaButtons={{
          primary: { label: "Get Started", href: "/candidate/signup" },
          secondary: { label: "Explore Opportunities", href: "/jobs" },
        }}
        backgroundColor="bg-mint dark:bg-gray-900"
      />

      {/* Trending Opportunities Section */}
      <section className="my-8 py-8 bg-mint dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Trending Opportunities
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verified roles from high-growth companies. Connect your profile
                to get matched instantly.
              </p>
            </div>
            <Link
              href="/jobs"
              className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex flex-row gap-2"
            >
              Explore All Jobs <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Senior React Developer",
                company: "TechCorp",
                loc: "Remote",
                type: "Full-time",
              },
              {
                title: "UI/UX Designer",
                company: "Creative Boutique",
                loc: "ContractSF / Hybrid",
                type: "Contract",
              },
              {
                title: "Lead Frontend Engineer",
                company: "InnovateAI",
                loc: "New York",
                type: "Full-time",
              },
            ].map((job, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{job.type}</span>
                  <span>{job.loc}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {job.company}
                </p>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Sign in to unlock
                  </span>
                  <Link
                    href="/candidate/login"
                    className="w-10 h-10 bg-teal-dark dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <ArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-24 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              Why Candidates{" "}
              <span className="text-teal-dark italic">Love Us</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
              Everything you need to stand out in your job search
            </p>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: "Share Anywhere",
                text: "Add your PreviewCV link to email signatures, LinkedIn profiles, job applications, and networking messages.",
                tags: ["Email", "LinkedIn", "Portfolio"],
                color: "blue",
                icon: ShareIcon, // replace with your svg or component
              },
              {
                title: "Always Current",
                text: "Update your resume once and your preview link reflects instantly. No more resending files.",
                badge: "Real-time sync",
                color: "indigo",
                icon: RefreshCwIcon,
              },
              {
                title: "Track Engagement",
                text: "See who viewed your resume, when they viewed it, and how long they spent.",
                badge: "View analytics",
                color: "blue",
                icon: GitGraphIcon,
              },
              {
                title: "Professional Presentation",
                text: "Beautiful, mobile-optimized viewing experience on any device.",
                badge: "Mobile-ready",
                color: "indigo",
                icon: PhoneIcon,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-3xl border bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-gray-200 dark:border-gray-800 p-8 md:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-dark text-white flex items-center justify-center mb-5">
                  <item.icon />
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  {item.text}
                </p>

                {/* micro tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-mint dark:bg-teal-dark/30 text-teal-dark dark:text-mint"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* micro label */}
                {item.badge && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-dark dark:text-mint">
                    {/* <item.badge /> */}
                    {item.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF vs PreviewCV Comparison */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Why choose PreviewCV over PDFs?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A modern solution for modern professionals
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left p-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Feature
                    </th>
                    <th className="text-center p-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
                      PDF
                    </th>
                    <th className="text-center p-6 text-sm font-semibold text-teal-dark dark:text-mint">
                      PreviewCV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Easy to share", pdf: false, previewcv: true },
                    { feature: "Auto-updates", pdf: false, previewcv: true },
                    { feature: "Track views", pdf: false, previewcv: true },
                    {
                      feature: "Mobile optimized",
                      pdf: false,
                      previewcv: true,
                    },
                    {
                      feature: "Always accessible",
                      pdf: false,
                      previewcv: true,
                    },
                    {
                      feature: "No downloads needed",
                      pdf: false,
                      previewcv: true,
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-800 last:border-0"
                    >
                      <td className="p-6 text-sm text-gray-900 dark:text-gray-100">
                        {row.feature}
                      </td>
                      <td className="p-6 text-center">
                        {row.pdf ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 12 12"
                              fill="currentColor"
                            >
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400">
                            <CircleX color="red" />
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {row.previewcv ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-dark/10 text-teal-dark">
                            <CircleCheck />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400">
                            <CircleX />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/candidate/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-teal-dark text-white font-semibold rounded-lg hover:bg-teal-dark/90 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-2 bg-mint dark:bg-teal-dark/20 text-teal-dark dark:text-mint text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">
            Two Platforms, One Login
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-8 leading-tight tracking-tighter uppercase">
            Create on <span className="italic">LetsMakeCV</span>, Share on{" "}
            <span className="italic">PreviewCV</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-12">
            Build your professional resume on LetsMakeCV, then instantly share
            it with recruiters using your PreviewCV link. One account works on
            both platforms.
          </p>
          <Link
            href="https://letsmakecv.com"
            target="_blank"
            className="px-10 py-5 bg-teal-dark hover:bg-teal-dark/90 text-white font-black rounded-2xl transition-all shadow-2xl shadow-teal-dark/20 uppercase tracking-tighter"
          >
            Create Resume on LetsMakeCV →
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-mint/30 dark:bg-mint/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-dark/10 dark:bg-teal-dark/5 rounded-full blur-[120px]" />
      </section>
    </div>
  );
}

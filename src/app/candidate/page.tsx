import Link from "next/link";
import Image from "next/image";
import FloatingHeader from "@/components/FloatingHeader";
import HeroSection from "@/components/HeroSection";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
} from "lucide-react";

const ShareNodeIcon = () => (
  <svg
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-500 dark:text-gray-400"
  >
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);


export default function CandidateLanding() {
  return (
    <div className="min-h-screen">
      <FloatingHeader
        links={[{ label: "Browse Jobs", href: "/jobs" }]}
        cta={{
          label: "Candidate Login",
          href: "/candidate/login",
          variant: "primary",
        }}
        showAuthButtons={false}
      />

      {/* Custom Hero */}
      <div className="relative bg-[#E5F1EF] dark:bg-[#0a0a0a] overflow-hidden lg:h-[480px] flex items-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center relative z-10">
          <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 py-16 lg:py-0">
            <h1 className="text-[36px] lg:text-[44px] font-medium text-gray-900 dark:text-gray-100 leading-[1.2] mb-5 tracking-tight">
              Showcase Your <br /> Work.
            </h1>
            <p className="text-gray-600 dark:text-[#a1a1a1] font-medium text-[14px] lg:text-[15px] max-w-[460px] mb-8 leading-relaxed">
              Already have a resume on LetsMakeCV? Share it with recruiters using your unique PreviewCV link. Same login, seamless experience.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <Link
                href="/candidate/signup"
                className="px-6 py-3 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all text-[13px]"
              >
                Get Started
              </Link>
              <Link
                href="/jobs"
                className="px-6 py-3 bg-transparent border border-[#1F4E4F] text-[#1F4E4F] dark:border-white dark:text-white hover:bg-[#1F4E4F]/5 dark:hover:bg-white/5 rounded-full transition-all text-[13px] font-medium"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>
        </div>

        {/* Right side image constrained to medium height */}
        <div className="lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-1/2 h-[350px] lg:h-full w-full z-0 px-4 sm:px-6 lg:px-0 pb-8 lg:pb-0">
          <div className="w-full h-full relative lg:rounded-l-[40px] overflow-hidden rounded-[20px] lg:rounded-tr-none lg:rounded-br-none shadow-lg">
            <Image
              src="/sable-flow-o-6GhmpELnw-unsplash 2.png"
              alt="Team collaboration"
              fill
              className="object-cover object-center lg:object-[center_20%]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Trending Opportunities Section */}
      <section className="py-16 lg:py-20 bg-[#F8FAFC] dark:bg-gray-950 border-b border-gray-100 dark:border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[28px] font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              Trending Opportunities
            </h2>
            <p className="text-gray-500 dark:text-[#a1a1a1] text-[15px] max-w-2xl leading-relaxed">
              Verified roles from high-growth companies. Connect your profile to get matched instantly.
            </p>
          </div>

          <div className="flex justify-end mb-6">
            <Link href="/jobs" className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 hover:text-[#1F4E4F] transition-colors">
              Explore All Jobs
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
                className="bg-white dark:bg-[#0a0a0a] p-6 rounded-[16px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-[#262626] flex flex-col justify-between hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between text-[11px] font-medium">
                    <span className="bg-[#F4F4F5] dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md">{job.type}</span>
                    <span className="text-gray-500 dark:text-[#a1a1a1]">{job.loc}</span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">
                    {job.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-[#a1a1a1] mb-8">
                    {job.company}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between mt-auto">
                  <span className="text-[12px] font-medium text-gray-900 dark:text-gray-100">
                    Sign in to unlock
                  </span>
                  <Link
                    href="/candidate/login"
                    className="w-[42px] h-[32px] bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="pt-20 pb-32 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-20">
            <h2 className="text-[32px] sm:text-[36px] font-medium text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tight">
              Why Candidates Love Us
            </h2>
            <p className="text-[14px] sm:text-[15px] font-medium text-gray-500 dark:text-[#a1a1a1] max-w-xl">
              Everything you need to stand out in your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 relative">
            {/* Horizontal Divider */}
            <div className="hidden md:block absolute top-[50%] left-0 right-0 h-px bg-gray-200 dark:bg-[#262626] -translate-y-1/2"></div>
            {/* Vertical Divider */}
            <div className="hidden md:block absolute top-0 bottom-0 left-[50%] w-px bg-gray-200 dark:bg-[#262626] -translate-x-1/2"></div>

            {[
              {
                title: "Share Anywhere",
                text: "Add your PreviewCV link to email signatures, LinkedIn profiles, job applications, and networking messages. One link works everywhere.",
                tags: ["Email", "LinkedIn", "Portfolio"],
              },
              {
                title: "Always Current",
                text: "Update your resume once on LetsMakeCV and your PreviewCV link reflects changes instantly. No more sending updated versions to everyone.",
                tags: ["Real-time sync"],
              },
              {
                title: "Track Engagement",
                text: "See who viewed your resume, when they viewed it, and how long they spent. Understand recruiter interest and follow up strategically.",
                tags: ["View analytics"],
              },
              {
                title: "Professional Presentation",
                text: "Beautiful, mobile-optimized viewing experience. Your resume looks perfect on any device, making a great first impression every time.",
                tags: ["Mobile-ready"],
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group py-4 px-2 ${i % 2 === 0 ? "md:pr-12 md:pl-2" : "md:pl-12 md:pr-2"} bg-transparent transition-all`}
              >
                <div className="w-8 h-8 mb-4 text-gray-500 dark:text-[#a1a1a1]">
                  <ShareNodeIcon />
                </div>

                <h3 className="text-[18px] sm:text-[20px] font-medium text-gray-900 dark:text-gray-100 mb-2.5 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-[12px] text-gray-500 dark:text-[#a1a1a1] leading-[1.6] mb-5">
                  {item.text}
                </p>

                {/* micro tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-[10px] font-medium rounded-[6px] bg-[#F4F4F5] dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF vs PreviewCV Comparison */}
      <section className="py-24 bg-[#EFF5FC] dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-[32px] sm:text-[36px] font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              PDF vs PreviewCV
            </h2>
            <p className="text-[14px] text-gray-500 dark:text-[#a1a1a1]">
              See why thousands are making the switch
            </p>
          </div>

          <div className="bg-[#FAFDFD] dark:bg-[#0a0a0a] rounded-[16px] border border-gray-100 dark:border-[#262626] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] sm:text-[14px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#262626]">
                    <th className="text-left p-5 sm:p-6 font-semibold text-gray-900 dark:text-gray-100 w-1/2">
                      Feature
                    </th>
                    <th className="text-center p-5 sm:p-6 font-semibold text-gray-500 dark:text-gray-400 w-1/4">
                      PDF
                    </th>
                    <th className="text-center p-5 sm:p-6 font-semibold text-[#1F4E4F] dark:text-[#a0cecd] w-1/4">
                      PreviewCV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Easy to share", pdf: false, previewcv: true },
                    { feature: "Auto-updates", pdf: false, previewcv: true },
                    { feature: "Track views", pdf: false, previewcv: true },
                    { feature: "Mobile optimized", pdf: false, previewcv: true },
                    { feature: "Always accessible", pdf: false, previewcv: true },
                    { feature: "No downloads needed", pdf: false, previewcv: true },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 dark:border-[#262626] last:border-0"
                    >
                      <td className="p-5 sm:p-6 text-gray-600 dark:text-[#a1a1a1] font-medium">
                        {row.feature}
                      </td>
                      <td className="p-5 sm:p-6 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-200 bg-white text-red-500">
                          <CircleX size={14} strokeWidth={2.5} />
                        </span>
                      </td>
                      <td className="p-5 sm:p-6 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#1F4E4F] bg-white text-[#1F4E4F]">
                          <CircleCheck size={14} strokeWidth={2.5} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/candidate/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-md transition-colors text-[14px]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#FCF9F9] dark:bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle curved background lines */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none translate-x-1/4 -translate-y-1/4">
          <svg viewBox="0 0 400 400" className="w-full h-full text-white dark:text-[#141414]" fill="none">
            <path d="M 400 0 Q 150 50 150 250 T -50 450" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.6" />
            <path d="M 400 -50 Q 250 50 250 250 T 0 500" stroke="currentColor" strokeWidth="20" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-block px-3.5 py-1.5 bg-[#EAEAEA] dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-medium rounded-md mb-6">
            Two Platforms, One Login
          </div>

          <h2 className="text-[36px] sm:text-[44px] font-medium text-gray-900 dark:text-gray-100 mb-5 leading-[1.15] tracking-tight">
            Create on LetsMakeCV, Share<br />on PreviewCV
          </h2>

          <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-[#a1a1a1] max-w-[600px] mx-auto mb-10 leading-relaxed">
            Build your professional resume on LetsMakeCV, then instantly share it with recruiters using your PreviewCV link. One account works on both platforms.
          </p>

          <Link
            href="https://letsmakecv.com"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-medium rounded-full transition-colors text-[13px]"
          >
            Create Resume on LetsMakeCV <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import FloatingHeader from "@/components/FloatingHeader";
import HeroSection from "@/components/HeroSection";

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

export default function RecruiterLanding() {
  const router = useRouter();
  const { isAuthenticated, loading } = useRecruiterAuth();

  // Redirect authenticated recruiters to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/recruiter/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Show nothing while checking authentication or if already authenticated
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-100 transition-colors duration-300">
      {/* SaaS Nav */}
      <FloatingHeader
        links={[
          { label: "Features", href: "#features" },
          { label: "Sign Up", href: "/recruiter/signup" },
        ]}
        cta={{ label: "Login", href: "/recruiter/login", variant: "secondary" }}
        showAuthButtons={true}
      />

      {/* Custom Hero */}
      <div className="relative bg-[#E5F1EF] dark:bg-[#0a0a0a] overflow-hidden lg:h-[480px] mt-10 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center relative z-10">
          <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 py-16 lg:py-0">
            <h1 className="text-[36px] lg:text-[48px] font-medium text-gray-900 dark:text-gray-100 leading-[1.15] mb-5 tracking-tight">
              Hire Smarter,<br />Not Harder.
            </h1>
            <p className="text-gray-600 dark:text-[#a1a1a1] font-medium text-[14px] lg:text-[15px] max-w-[420px] mb-8 leading-relaxed">
              Find and engage with top-tier talent effortlessly. Preview live candidate resumes from LetsMakeCV and manage your hiring pipeline in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/recruiter/signup"
                className="px-6 py-3 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all text-[13px]"
              >
                Start Hiring Now
              </Link>
              <Link
                href="#demo"
                className="px-6 py-3 bg-transparent border border-[#1F4E4F] text-[#1F4E4F] dark:border-white dark:text-white hover:bg-[#1F4E4F]/5 dark:hover:bg-white/5 rounded-full transition-all text-[13px] font-medium"
              >
                Watch Demo
              </Link>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-[24px] font-semibold text-gray-900 dark:text-white mb-0.5 leading-none">500+</p>
                <p className="text-[12px] text-gray-700 dark:text-[#a1a1a1] font-medium">Companies</p>
              </div>
              <div>
                <p className="text-[24px] font-semibold text-gray-900 dark:text-white mb-0.5 leading-none">10k+</p>
                <p className="text-[12px] text-gray-700 dark:text-[#a1a1a1] font-medium">Hires Made</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side image constrained to medium height */}
        <div className="lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-0 lg:w-1/2 h-[350px] lg:h-[480px] w-full z-0 px-4 sm:px-6 lg:px-0 pb-8 lg:pb-0">
          <div className="w-full h-full relative lg:rounded-l-[40px] overflow-hidden rounded-[20px] lg:rounded-tr-none lg:rounded-br-none shadow-lg">
            <Image
              src="/sable-flow-o-6GhmpELnw-unsplash 1.png"
              alt="Professional hiring meeting"
              fill
              className="object-cover object-center lg:object-[center_30%]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Talent Preview Teaser */}
      <section className="py-16 lg:py-20 bg-[#F4F9F8] dark:bg-gray-950 border-y border-gray-100 dark:border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[28px] font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              Direct Market Pulse
            </h2>
            <p className="text-gray-500 dark:text-[#a1a1a1] text-[15px] max-w-2xl leading-relaxed">
              Browsing live performance data instead of static resumes. Source 10x faster with verified skill matrices.
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
                name: "Vihaan Aarav",
                role: "Senior React Developer",
                exp: "5+ Years",
                skills: ["React", "Go", "Kubernetes"],
                img: "/images/profile1.png",
              },
              {
                name: "Vihaan Aarav",
                role: "Product Designer",
                exp: "",
                skills: ["UX", "Go", "Kubernetes"],
                img: "/images/profile2.png",
              },
              {
                name: "Vihaan Aarav",
                role: "Senior React Developer",
                exp: "5+ Years",
                skills: ["React", "Go", "Kubernetes"],
                img: "/images/profile3.png",
              },
            ].map((can, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0a0a0a] p-6 rounded-[16px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-[#262626] flex flex-col justify-between hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-[46px] h-[46px] bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                      <Image
                        src={can.img}
                        alt={can.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="text-[11px] text-gray-500 dark:text-[#a1a1a1] font-medium mb-0.5">{can.name}</h5>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-[17px] tracking-tight">
                        {can.role}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {can.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-[#F4F4F5] dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-gray-100 dark:border-[#262626] pt-4 mt-auto">
                  <Link
                    href="/recruiter/login"
                    className="py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-[12px]"
                  >
                    View Full Profile & Resume
                  </Link>
                  {can.exp && (
                    <span className="text-[11px] text-gray-400 font-medium mb-1">
                      {can.exp}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="pt-16 pb-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0a0a] relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="max-w-[550px] mb-16 lg:mb-24">
            <h2 className="text-[32px] sm:text-[36px] font-medium mb-3 text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              Search Beyond the Post.
            </h2>
            <p className="text-[14px] sm:text-[15px] text-gray-500 font-medium leading-relaxed">
              Why wait for applications? Our Global Talent Search allows you
              to browse active resumes even if you haven&apos;t posted a job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-12 md:gap-16 items-start relative max-w-5xl">
            <div className="flex flex-col justify-center py-4">
              <ul className="space-y-6">
                <li className="flex gap-3 text-gray-900 dark:text-gray-100 font-medium text-[13px] sm:text-[14px]">
                  <span className="font-bold">•</span>
                  <span>Advanced filter by skills & experience</span>
                </li>
                <li className="flex gap-3 text-gray-900 dark:text-gray-100 font-medium text-[13px] sm:text-[14px]">
                  <span className="font-bold">•</span>
                  <span>→Real-time resume preview (No downloads)</span>
                </li>
                <li className="flex gap-3 text-gray-900 dark:text-gray-100 font-medium text-[13px] sm:text-[14px]">
                  <span className="font-bold">•</span>
                  <span>→Direct reach-out via secure messaging</span>
                </li>
              </ul>
            </div>

            <div className="hidden md:block w-px bg-gray-200 dark:bg-[#262626] self-stretch mx-auto min-h-[200px]"></div>

            <div className="flex flex-col gap-6">
              <div className="p-6 bg-[#F4F4F5] dark:bg-gray-900/50 rounded-[12px] max-w-sm">
                <div className="mb-4">
                  <ShareNodeIcon />
                </div>
                <h4 className="text-[18px] sm:text-[20px] font-medium text-gray-900 dark:text-gray-100 mb-2 leading-none tracking-tight">
                  Global Search
                </h4>
                <p className="text-[12px] text-gray-500 dark:text-[#a1a1a1] leading-relaxed">
                  Access 100k+ active job seeker profiles instantly.
                </p>
              </div>

              <div className="p-6 bg-[#F4F4F5] dark:bg-gray-900/50 rounded-[12px] max-w-sm">
                <div className="mb-4">
                  <ShareNodeIcon />
                </div>
                <h4 className="text-[18px] sm:text-[20px] font-medium text-gray-900 dark:text-gray-100 mb-2 leading-none tracking-tight">
                  Application Manager
                </h4>
                <p className="text-[12px] text-gray-500 dark:text-[#a1a1a1] leading-relaxed">
                  Review and organize candidate applications efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

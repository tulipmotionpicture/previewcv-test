"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

const MagnifyingGlassIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const ChartBarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
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
      <Header
        links={[
          { label: "Features", href: "#features" },
          { label: "Sign Up", href: "/recruiter/signup" },
        ]}
        cta={{ label: "Login", href: "/recruiter/login", variant: "secondary" }}
        showAuthButtons={true}
      />

      <HeroSection
        subtitle="For Recruiters"
        title="Hire Smarter, Not Harder."
        description="Find and engage with top-tier talent effortlessly. Preview live candidate resumes from LetsMakeCV and manage your hiring pipeline in one place."
        showImage={true}
        imageSrc="/sable-flow-o-6GhmpELnw-unsplash 1.png"
        imageAlt="Professional hiring meeting"
        imageStyle="contain"
        showJobSearch={false}
        ctaButtons={{
          primary: { label: "Start Hiring Now", href: "/recruiter/signup" },
          secondary: { label: "Watch Demo", href: "#demo" },
        }}
        stats={[
          { value: "500+", label: "Companies" },
          { value: "10k+", label: "Hires Made" },
        ]}
        backgroundColor="bg-mint dark:bg-gray-900"
      />

      {/* NEW: Talent Preview Teaser */}
      <section className="py-32 px-8 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-indigo-200">
                Active Network
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter mb-4 italic uppercase leading-none">
                Direct Market Pulse
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl text-lg leading-relaxed">
                Browsing live performance data instead of static resumes. Source
                10x faster with verified skill matrices.
              </p>
            </div>
            <Link
              href="/recruiter/signup"
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
            >
              Get Started Free
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                role: "Fullstack Engineer",
                exp: "5+ Years",
                skills: ["React", "Go", "Kubernetes"],
                badges: ["Verified", "Top 1%"],
                img: "/images/profile1.png",
              },
              {
                role: "Product Designer",
                exp: "7+ Years",
                skills: ["UX", "Figma", "Design Systems"],
                badges: ["Expert"],
                img: "/images/profile2.png",
              },
              {
                role: "Data Scientist",
                exp: "4+ Years",
                skills: ["Python", "PyTorch", "AWS"],
                badges: ["Available"],
                img: "/images/profile3.png",
              },
            ].map((can, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-[40px] hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl relative overflow-hidden border border-gray-200">
                    <Image
                      src={can.img}
                      alt={can.role}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-gray-100 rounded-full mb-2 blur-[3px]" />
                    <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight uppercase leading-none">
                      {can.role}
                    </h4>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {can.skills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100 tracking-tight uppercase"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex gap-2">
                      {can.badges.map((b) => (
                        <span
                          key={b}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter italic"
                        >
                          ● {b}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-gray-900 uppercase italic">
                      {can.exp}
                    </span>
                  </div>
                </div>

                <Link
                  href="/recruiter/login"
                  className="mt-8 w-full py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-center text-sm uppercase tracking-tighter"
                >
                  View Full Profile & Resume
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px] -z-10" />
      </section>

      <section
        id="features"
        className="py-32 px-8 bg-white dark:bg-gray-950 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-10 tracking-tighter italic text-indigo-600 uppercase">
                Search Beyond the Post.
              </h2>
              <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
                Why wait for applications? Our Global Talent Search allows you
                to browse active resumes even if you haven&apos;t posted a job.
              </p>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-gray-600 font-bold uppercase text-sm">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    →
                  </span>{" "}
                  Advanced filter by skills & experience
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-bold uppercase text-sm">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    →
                  </span>{" "}
                  Real-time resume preview (No downloads)
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-bold uppercase text-sm">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    →
                  </span>{" "}
                  Direct reach-out via secure messaging
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-sm hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                  <MagnifyingGlassIcon />
                </div>
                <h4 className="font-black mb-4 uppercase tracking-tighter leading-none">
                  Global Search
                </h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-tight">
                  Access 100k+ active job seeker profiles instantly.
                </p>
              </div>
              <div className="p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-sm hover:shadow-xl transition-all mt-8">
                <div className="w-14 h-14 bg-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                  <ChartBarIcon />
                </div>
                <h4 className="font-black mb-4 uppercase tracking-tighter leading-none">
                  Application Manager
                </h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-tight">
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

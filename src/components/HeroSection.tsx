"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  searchPlaceholder?: string;
  jobCount?: string;
  ctaButtons?: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  showJobSearch?: boolean;
  showImage?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageStyle?: "cover" | "contain";
  stats?: {
    value: string;
    label: string;
  }[];
  backgroundColor?: string;
  height?: string;
  minHeight?: string;
}

export default function HeroSection({
  title = "Share Your Resume with a Single Link.",
  subtitle,
  description = "Stop sending PDF attachments. Create your resume on LetsMakeCV, then share it instantly with recruiters using a live PreviewCV link.",
  searchPlaceholder = "Search by keywords, destinations, company",
  jobCount = "92,868",
  ctaButtons = {
    primary: { label: "Job Seeker", href: "/candidate" },
    secondary: { label: "Recruiter", href: "/recruiter" },
  },
  showJobSearch = true,
  showImage = false,
  imageSrc,
  imageAlt,
  imageStyle = "cover",
  stats,
  backgroundColor = "bg-[#EEF7F7] dark:bg-gray-900",
  height = "",
  minHeight = "min-h-[450px]",
  children
}: HeroSectionProps & { children?: React.ReactNode }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  return (

    <div className="relative mb-12">
      <div
        className={`relative pt-20 pb-20 lg:pt-24 lg:pb-32 overflow-hidden ${backgroundColor} rounded-bl-[10px] lg:rounded-bl-[100px] transition-colors duration-300`}
      >
        {/* Background Shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/hero-bg-pattern.png"
            alt="Background Pattern"
            fill
            className="object-cover object-left-top opacity-30 mr-6" // Adjust opacity/position as needed
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${height} ${minHeight}`}>
            {/* Left Side - Search */}
            <div className={showImage ? "order-1" : showJobSearch ? "order-1 lg:order-1" : ""}>
              {showJobSearch ? (
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-lg lg:text-xl font-medium text-gray-900 dark:text-gray-100 mb-1 ml-4">
                    Search through <span className="">{jobCount}</span> Jobs
                  </h2>

                  <form
                    className="flex relative w-full max-w-lg shadow-md rounded-full"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchValue.trim()) {
                        router.push(
                          `/jobs?keyword=${encodeURIComponent(searchValue.trim())}`,
                        );
                      } else {
                        router.push("/jobs");
                      }
                    }}
                  >
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full px-6 py-4 bg-white dark:bg-gray-800 rounded-full border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-[120px] text-sm shadow-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all text-xs lg:text-sm"
                    >
                      Search job
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {subtitle && (
                    <div className="inline-block px-4 py-2 bg-mint dark:bg-teal-dark/20 text-teal-dark dark:text-mint text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                      {subtitle}
                    </div>
                  )}
                  <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-gray-100 leading-[1.15]">
                    {title}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={ctaButtons.primary.href}
                      className="px-6 py-3 bg-teal-dark hover:bg-teal-dark/90 text-white font-black rounded-xl transition-all shadow-lg shadow-teal-dark/20 uppercase tracking-tighter text-xs"
                    >
                      {ctaButtons.primary.label}
                    </Link>
                    {ctaButtons.secondary && (
                      <Link
                        href={ctaButtons.secondary!.href}
                        className="px-6 py-3 bg-transparent border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 font-black rounded-xl transition-all uppercase tracking-tighter text-xs"
                      >
                        {ctaButtons.secondary!.label}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className={showImage ? "order-2" : showJobSearch ? "order-2 lg:order-2" : ""}>
              {showJobSearch ? (
                <div className="flex flex-col justify-center h-full space-y-4">
                  <h1 className="text-2xl lg:text-4xl font-medium text-gray-900 dark:text-gray-100 leading-[1.2] tracking-tight">
                    {title}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                    {description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Link
                      href={ctaButtons.primary.href}
                      className="px-8 py-3 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg text-center text-xs lg:text-sm"
                    >
                      {ctaButtons.primary.label}
                    </Link>
                    {ctaButtons.secondary && (
                      <Link
                        href={ctaButtons.secondary!.href}
                        className="px-8 py-3 bg-transparent border border-[#1F4E4F] dark:border-white text-[#1F4E4F] dark:text-white hover:bg-[#1F4E4F]/5 dark:hover:bg-white/10 font-medium rounded-full transition-all text-center text-xs lg:text-sm"
                      >
                        {ctaButtons.secondary!.label}
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                showImage && imageSrc ? (
                  <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={imageSrc!}
                      alt={imageAlt || "Hero image"}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>

      {children && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-24 pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}

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
  backgroundColor = "bg-mint dark:bg-gray-900",
  height = "",
  minHeight = "min-h-[450px]",
}: HeroSectionProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  return (
    <section
      className={`relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden ${backgroundColor} rounded-bl-[60px] lg:rounded-bl-[100px] mb-10 transition-colors duration-300`}
    >
      {/* Background Image (only for home page) */}
      {!showImage && (
        <Image
          src={"/profile-gradient-image.D-RjEL1Q 2.png"}
          alt="Background gradient image"
          fill
          className="object-cover opacity-50 dark:opacity-20"
          priority
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 ${height} ${minHeight}`}>
          {/* Left Side - Content or Search Section */}
          <div
            className={
              showImage ? "order-1" : showJobSearch ? "order-1 lg:order-1" : ""
            }
          >
            {showJobSearch ? (
              <>
                <h2 className="text-lg lg:text-xl font-medium text-gray-800 dark:text-gray-200  ml-4 leading-tight">
                  Search through{" "}
                  <span className="">
                    {jobCount}
                  </span>{" "}
                  Jobs
                </h2>

                <form
                  className="flex relative max-w-xl"
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
                    className="w-full px-6 py-5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 outline-none  dark:focus:border-mint text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500  pr-[140px] text-sm md:text-base"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1.5 bottom-1.5 px-6 md:px-8 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all text-sm"
                  >
                    Search job
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-8">
                {subtitle && (
                  <div className="inline-block px-4 py-2 bg-mint dark:bg-teal-dark/20 text-teal-dark dark:text-mint text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    {subtitle}
                  </div>
                )}
                <h1 className="text-3xl text-base/18 lg:text-4xl font-medium text-gray-900 dark:text-gray-100 leading-[1.15]">
                  {title}
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={ctaButtons.primary.href}
                    className="px-8 py-4 bg-teal-dark hover:bg-teal-dark/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-teal-dark/20 uppercase tracking-tighter text-sm"
                  >
                    {ctaButtons.primary.label}
                  </Link>
                  {ctaButtons.secondary && (
                    <Link
                      href={ctaButtons.secondary.href}
                      className="px-8 py-4 bg-transparent border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 font-black rounded-2xl transition-all uppercase tracking-tighter text-sm"
                    >
                      {ctaButtons.secondary.label}
                    </Link>
                  )}
                </div>

                {/* Stats */}
                {stats && stats.length > 0 && (
                  <div className="flex flex-wrap gap-8 pt-8">
                    {stats.map((stat, index) => (
                      <div key={index}>
                        <div className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Main Hero Content or Image */}
          <div
            className={
              showImage ? "order-2" : showJobSearch ? "order-2 lg:order-2" : ""
            }
          >
            {showImage && imageSrc ? (
              imageStyle === "contain" ? (
                <div className="relative rounded-2xl overflow-hidden w-full lg:w-[753px]">
                  <img
                    src={imageSrc}
                    alt={imageAlt || "Hero image"}
                    className="w-full h-full object-contain shadow-2xl"
                  />
                </div>
              ) : (
                <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={imageSrc}
                    alt={imageAlt || "Hero image"}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )
            ) : !showJobSearch ? (
              <div className="space-y-8">
                {subtitle && (
                  <div className="text-2xl lg:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 ml-3">
                    {subtitle}
                  </div>
                )}
                <h1 className="text-3xl text-base/18 lg:text-4xl font-medium text-gray-900 dark:text-gray-100 leading-[1.15]">
                  {title}
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={ctaButtons.primary.href}
                    className="px-8 py-4 bg-teal-dark hover:bg-teal-dark/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-teal-dark/20 uppercase tracking-tighter text-sm"
                  >
                    {ctaButtons.primary.label}
                  </Link>
                  {ctaButtons.secondary && (
                    <Link
                      href={ctaButtons.secondary.href}
                      className="px-8 py-4 bg-transparent border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 font-black rounded-2xl transition-all uppercase tracking-tighter text-sm"
                    >
                      {ctaButtons.secondary.label}
                    </Link>
                  )}
                </div>

                {/* Stats */}
                {stats && stats.length > 0 && (
                  <div className="flex flex-wrap gap-8 pt-8">
                    {stats.map((stat, index) => (
                      <div key={index}>
                        <div className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-900 dark:text-gray-100 mb-6 leading-snug tracking-tight">
                  {title}
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg">
                  {description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={ctaButtons.primary.href}
                    className="px-8 py-3 bg-[#1F4E4F] hover:bg-[#163c3d] text-white font-medium rounded-full transition-all shadow-md text-center text-sm lg:text-base"
                  >
                    {ctaButtons.primary.label}
                  </Link>
                  {ctaButtons.secondary && (
                    <Link
                      href={ctaButtons.secondary.href}
                      className="px-8 py-3 bg-transparent border border-[#1F4E4F] dark:border-mint text-[#1F4E4F] dark:text-mint hover:bg-[#1F4E4F] hover:text-white dark:hover:bg-mint/10 font-medium rounded-full transition-all text-center text-sm lg:text-base"
                    >
                      {ctaButtons.secondary.label}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section >
  );
}

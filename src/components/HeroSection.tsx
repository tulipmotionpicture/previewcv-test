"use client";
import Image from "next/image";
import Link from "next/link";
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
}: HeroSectionProps) {

  return (
    <section
      className={`relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-[#EAF6F6] dark:bg-gray-900 transition-colors duration-300 h-[400px] rounded-bl-[100px] mb-14`}
    >
      {/* Background Abstract Shapes */}
      {/* Background Graphic */}
      <div className="absolute top-28 left-28 w-[500px] h-[400px]">
        <Image
          src="/hero-bg-graphic.png"
          alt="Background graphic"
          fill
          className="object-contain object-left-top opacity-100 scale-125 -translate-x-20 -translate-y-10"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 min-h-[400px]">
          {/* Left Side - Search Section */}
          <div className="lg:col-span-6 lg:pr-8 order-1">
            <h2 className="text-2xl lg:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 ml-3">
              Search through{" "}
              <span>
                {jobCount}
              </span>{" "}
              Jobs
            </h2>

            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-6 pr-36 py-4 bg-white dark:bg-gray-800 rounded-full border-none  text-gray-600 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-teal-700/20 outline-none transition-all"
              />
              <Link
                href="/jobs"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-8 flex items-center bg-[#134E4A] hover:bg-[#0F3F3C] text-white font-medium rounded-full transition-all"
              >
                Search job
              </Link>
            </div>
          </div >

          {/* Right Side - Resume Text & CTA */}
          < div className="lg:col-span-6 order-2 lg:pl-12" >
            <div className="space-y-6">
              <h1 className="text-3xl text-base/18 lg:text-4xl font-medium text-gray-900 dark:text-gray-100 leading-[1.15]">
                {title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                {description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href={ctaButtons.primary.href}
                  className="px-8 py-3 bg-[#134E4A] hover:bg-[#0F3F3C] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  {ctaButtons.primary.label}
                </Link>
                {ctaButtons.secondary && (
                  <Link
                    href={ctaButtons.secondary.href}
                    className="px-8 py-3 bg-transparent border border-[#134E4A] text-[#134E4A] dark:text-white dark:border-white hover:bg-[#134E4A] hover:text-white dark:hover:bg-gray-800 font-medium rounded-full transition-all"
                  >
                    {ctaButtons.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div >
        </div >
      </div >
    </section >
  );
}
import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  jobCount?: string;
  ctaButtons?: {
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  showJobSearch?: boolean;
}

export default function HeroSection({
  title = "Share Your Resume with a Single Link.",
  description = "Stop sending PDF attachments. Create your resume on LetsMakeCV, then share it instantly with recruiters using a live PreviewCV link.",
  searchPlaceholder = "Search by keywords, destinations, company",
  jobCount = "92,868",
  ctaButtons = {
    primary: { label: "Job Seeker", href: "/candidate" },
    secondary: { label: "Recruiter", href: "/recruiter" },
  },
  showJobSearch = true,
}: HeroSectionProps) {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-[#E5F1EF] dark:from-gray-900 dark:to-gray-950">
      {/* Background Decorations */}
      <Image
        src={"/profile-gradient-image.D-RjEL1Q 2.png"}
        alt="Background gradient image"
        fill
        className="object-cover"
        priority
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16  min-h-[450px]">
          {/* Left Side - Search Section */}
          {showJobSearch && (
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Search through{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {jobCount}
                </span>{" "}
                Jobs
              </h2>

              <div className="flex relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 outline-none focus:border-teal-600 dark:focus:border-teal-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm p-2"
                />
                <Link
                  href="/jobs"
                  className="px-8 py-4 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-full transition-all shadow-md whitespace-nowrap absolute right-0"
                >
                  Search job
                </Link>
              </div>
            </div>
          )}

          {/* Right Side - Main Hero Content */}
          <div className={showJobSearch ? "order-1 lg:order-2" : ""}>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={ctaButtons.primary.href}
                className="px-10 py-4 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-full transition-all shadow-md text-center"
              >
                {ctaButtons.primary.label}
              </Link>
              <Link
                href={ctaButtons.secondary.href}
                className="px-10 py-4 bg-transparent border-2 border-teal-700 dark:border-teal-600 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold rounded-full transition-all text-center"
              >
                {ctaButtons.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

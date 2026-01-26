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
      className={`relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden ${backgroundColor} transition-colors duration-300`}
    >
      {/* Background Image (only for home page) */}
      {!showImage && (
        <Image
          src={"/profile-gradient-image.D-RjEL1Q 2.png"}
          alt="Background gradient image"
          fill
          className="object-cover"
          priority
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[450px]">
          {/* Left Side - Content or Search Section */}
          <div
            className={
              showImage ? "order-1" : showJobSearch ? "order-2 lg:order-1" : ""
            }
          >
            {showJobSearch ? (
              <>
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
                    className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 outline-none focus:border-teal-dark dark:focus:border-mint text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm p-2"
                  />
                  <Link
                    href="/jobs"
                    className="px-8 py-4 bg-teal-dark hover:bg-teal-dark/90 text-white font-semibold rounded-full transition-all shadow-md whitespace-nowrap absolute right-0"
                  >
                    Search job
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                {subtitle && (
                  <div className="inline-block px-4 py-2 bg-mint dark:bg-teal-dark/20 text-teal-dark dark:text-mint text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    {subtitle}
                  </div>
                )}
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-gray-100 leading-tight tracking-tighter">
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
              showImage ? "order-2" : showJobSearch ? "order-1 lg:order-2" : ""
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
                  <div className="inline-block px-4 py-2 bg-mint dark:bg-teal-dark/20 text-teal-dark dark:text-mint text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    {subtitle}
                  </div>
                )}
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-gray-100 leading-tight tracking-tighter">
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
                    className="px-10 py-4 bg-teal-dark hover:bg-teal-dark/90 text-white font-semibold rounded-full transition-all shadow-md text-center"
                  >
                    {ctaButtons.primary.label}
                  </Link>
                  {ctaButtons.secondary && (
                    <Link
                      href={ctaButtons.secondary.href}
                      className="px-10 py-4 bg-transparent border-2 border-teal-dark dark:border-mint text-teal-dark dark:text-mint hover:bg-teal-dark/10 dark:hover:bg-mint/10 font-semibold rounded-full transition-all text-center"
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
    </section>
  );
}

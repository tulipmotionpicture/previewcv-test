import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import {
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Variant = "recruiter" | "candidate";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface Branding {
  image: string;
  imageAlt: string;
  blurb: string;
  features: Feature[];
  stats: { value: string; label: string }[];
  loginHref: string;
}

const BRANDING: Record<Variant, Branding> = {
  recruiter: {
    image: "/sable-flow-o-6GhmpELnw-unsplash 1.png",
    imageAlt: "Recruitment team",
    blurb:
      "Secure your recruiter account and get back to building your dream team.",
    features: [
      {
        icon: Users,
        title: "Access Live Resumes",
        desc: "Preview candidate profiles in real-time from LetsMakeCV",
      },
      {
        icon: TrendingUp,
        title: "Track Your Pipeline",
        desc: "Manage applications and hiring progress in one place",
      },
      {
        icon: DollarSign,
        title: "Free to Start",
        desc: "No credit card required. Start hiring immediately",
      },
    ],
    stats: [
      { value: "500+", label: "Companies" },
      { value: "10k+", label: "Hires Made" },
    ],
    loginHref: "/recruiter/login",
  },
  candidate: {
    image: "/sable-flow-o-6GhmpELnw-unsplash 2.png",
    imageAlt: "Job seeker",
    blurb:
      "Secure your account and get back to connecting with top employers.",
    features: [
      {
        icon: Briefcase,
        title: "Share Your Resume",
        desc: "Create your profile and share it with a simple link",
      },
      {
        icon: Target,
        title: "Get Discovered",
        desc: "Be found by recruiters looking for talent like you",
      },
      {
        icon: Zap,
        title: "Stay Updated",
        desc: "Keep your profile current and stand out from the crowd",
      },
    ],
    stats: [
      { value: "50k+", label: "Active Users" },
      { value: "10k+", label: "Hires Made" },
    ],
    loginHref: "/candidate/login",
  },
};

/**
 * Shared split-screen auth layout matching the login/signup pages: a left
 * brand panel (logo, headline, features, stats on `bg-mint`) and a right form
 * panel. Used by the password reset/forgot pages so they stay on-brand.
 */
export default function AuthShell({
  variant,
  heading,
  subheading,
  children,
}: {
  variant: Variant;
  heading: string;
  subheading?: string;
  children: React.ReactNode;
}) {
  const brand = BRANDING[variant];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-300">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-mint dark:bg-gray-900 overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0">
          <Image
            src={brand.image}
            alt={brand.imageAlt}
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="inline-block mb-12">
              <Image
                src={config.app.logoUrl}
                alt={config.app.name}
                width={150}
                height={40}
                className="object-contain"
              />
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Reset Your
              <br />
              Password
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-md">
              {brand.blurb}
            </p>
            <div className="space-y-6">
              {brand.features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                    <f.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-12">
            {brand.stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                  {s.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[480px] my-8">
          <div className="lg:hidden mb-8">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={32}
              className="object-contain"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
              {heading}
            </h2>
            {subheading && (
              <p className="text-gray-600 dark:text-gray-400">{subheading}</p>
            )}
          </div>

          {children}

          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <Link
              href={brand.loginHref}
              className="text-teal-dark dark:text-mint font-semibold hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

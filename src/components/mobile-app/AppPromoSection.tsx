import { Check } from "lucide-react";
import { MOBILE_APPS, MobileAppId } from "@/lib/mobileApps";
import AppQr from "./AppQr";
import StoreBadges from "./StoreBadges";

const COPY: Record<MobileAppId, { title: string; text: string; points: string[] }> = {
  previewcv: {
    title: "Hire from your phone",
    text: "PreviewCV for Recruiters keeps your applicants and talent search with you.",
    points: [
      "Screen applicants with a swipe",
      "Search candidates and preview their resumes, no downloads",
      "Decide together with private team notes and recommendations",
    ],
  },
  letsmakecv: {
    title: "Take your job search with you",
    text: "Get the LetsMakeCV app and sign in with the same account you use on PreviewCV.",
    points: [
      "Build and update your resume, with AI help",
      "Find jobs and apply from your phone",
      "Follow every application, from applied to offer",
    ],
  },
};

interface AppPromoSectionProps {
  app: MobileAppId;
  from: string;
  /** Heading level: the app's own page uses h1. */
  as?: "h1" | "h2";
  className?: string;
}

export default function AppPromoSection({ app, from, as: Heading = "h2", className = "" }: AppPromoSectionProps) {
  const { name, icon, screenshots } = MOBILE_APPS[app];
  const copy = COPY[app];
  return (
    <section className={`py-16 lg:py-20 ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="w-full max-w-xl">
          <div className="mb-5 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" width={48} height={48} loading="lazy" className="rounded-xl shadow-sm" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {name} app
            </span>
          </div>
          <Heading className="mb-3 text-[32px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[36px] dark:text-gray-100">
            {copy.title}
          </Heading>
          <p className="mb-6 text-[15px] leading-relaxed text-gray-500 dark:text-[#a1a1a1]">
            {copy.text}
          </p>
          <ul className="mb-8 space-y-3">
            {copy.points.map((point) => (
              <li key={point} className="flex gap-3 text-[14px] text-gray-700 dark:text-gray-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1F4E4F] dark:text-[#a0cecd]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5">
            <AppQr app={app} from={from} size={120} className="border border-gray-200 dark:border-transparent" />
            <div>
              <p className="mb-3 hidden text-[13px] text-gray-500 md:block dark:text-[#a1a1a1]">
                Scan with your phone&rsquo;s camera to install, on iPhone or Android.
              </p>
              <StoreBadges app={app} from={from} />
            </div>
          </div>
        </div>
        <div className="flex max-w-full gap-4">
          {screenshots.map((shot, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              width={480}
              height={853}
              loading="lazy"
              className={`h-auto w-[150px] min-w-0 rounded-2xl shadow-lg sm:w-[200px] lg:w-[220px] ${i === 1 ? "mt-8" : "mb-8"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

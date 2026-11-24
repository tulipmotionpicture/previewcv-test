import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import config from "@/config";
import FloatingHeader from "@/components/FloatingHeader";
import AppPromoSection from "@/components/mobile-app/AppPromoSection";
import { MOBILE_APPS, appLink, cleanFrom, phoneStore, storeUrl } from "@/lib/mobileApps";

const TITLE = "PreviewCV for Recruiters App for iPhone and Android";
const DESCRIPTION =
  "Install the PreviewCV for Recruiters app on iPhone or Android. Screen applicants with a swipe, search candidates and hire with your team from your phone.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: config.app.siteUrl ? { canonical: `${config.app.siteUrl}/app` } : undefined,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: MOBILE_APPS.previewcv.name,
  description: DESCRIPTION,
  operatingSystem: "iOS, Android",
  applicationCategory: "BusinessApplication",
  installUrl: [MOBILE_APPS.previewcv.appStore, MOBILE_APPS.previewcv.play],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// The link in the QR codes: a phone goes straight to its own store, everything else
// (computers, tablets, search engines, link previews) gets this page.
export default async function RecruiterAppPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const from = cleanFrom((await searchParams).from);
  const store = phoneStore((await headers()).get("user-agent"));
  if (store) redirect(storeUrl("previewcv", store, from));

  return (
    <div className="min-h-screen bg-white pt-14 dark:bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FloatingHeader
        links={[{ label: "For Recruiters", href: "/recruiter" }]}
        cta={{ label: "Recruiter Login", href: "/recruiter/login", variant: "primary" }}
        showAuthButtons={true}
      />
      <AppPromoSection app="previewcv" from="app" as="h1" />
      <div className="mx-auto max-w-6xl space-y-3 px-4 pb-16 text-sm text-gray-500 sm:px-6 lg:px-8 dark:text-[#a1a1a1]">
        <p>
          New to PreviewCV? Create your account, verify your company and post jobs on
          previewcv.com, then sign in to the app.
        </p>
        <p>
          Looking for a job?{" "}
          <a
            href={appLink("letsmakecv", "pcv-app")}
            className="font-semibold text-[#1F4E4F] hover:underline dark:text-[#a0cecd]"
          >
            Get the LetsMakeCV app
          </a>
        </p>
        <p className="text-xs">
          Apple and App Store are trademarks of Apple Inc. Google Play and the Google Play logo
          are trademarks of Google LLC.
        </p>
      </div>
    </div>
  );
}

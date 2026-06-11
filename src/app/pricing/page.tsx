import { Metadata } from "next";
import config from "@/config";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for PreviewCV. Free for candidates; flexible plans for recruiters to post jobs and search talent.",
  alternates: config.app.siteUrl
    ? { canonical: `${config.app.siteUrl}/pricing` }
    : undefined,
  openGraph: {
    title: "Pricing | PreviewCV",
    description:
      "Free for candidates; flexible plans for recruiters to post jobs and search talent.",
    type: "website",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}

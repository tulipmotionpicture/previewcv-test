import { Metadata } from "next";
import config from "@/config";
import BlogListing from "./BlogListing";

export const metadata: Metadata = {
  title: { absolute: "Career Insights & Resources | PreviewCV Blog" },
  description:
    "Expert advice, tips, and insights to help you succeed in your career — resume writing, job search, interviews, and more.",
  alternates: config.app.siteUrl
    ? { canonical: `${config.app.siteUrl}/blog` }
    : undefined,
  openGraph: {
    title: "Career Insights & Resources | PreviewCV Blog",
    description:
      "Expert advice, tips, and insights to help you succeed in your career.",
    type: "website",
    url: config.app.siteUrl ? `${config.app.siteUrl}/blog` : undefined,
  },
};

export default function BlogListingPage() {
  return <BlogListing />;
}

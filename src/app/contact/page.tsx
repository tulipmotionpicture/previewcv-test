import { Metadata } from "next";
import config from "@/config";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the PreviewCV team. Questions about jobs, recruiting, or your resume link — we're here to help.",
  alternates: config.app.siteUrl
    ? { canonical: `${config.app.siteUrl}/contact` }
    : undefined,
  openGraph: {
    title: "Contact Us | PreviewCV",
    description:
      "Get in touch with the PreviewCV team about jobs, recruiting, or your resume link.",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import config from "@/config";
import "./globals.css";
import "@/styles/react-easy-crop.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: config.app.siteUrl
    ? new URL(config.app.siteUrl)
    : undefined,
  title: {
    default: "PreviewCV — Find Jobs, Hire Talent & Share Your Resume",
    template: "%s | PreviewCV",
  },
  description:
    "PreviewCV is a job board and resume-sharing platform. Browse jobs from top employers, share an always-up-to-date resume link, and connect candidates with recruiters.",
  icons: {
    icon: config.app.favIcon || "/favicon.ico",
    apple: config.app.favIcon || "/favicon.ico",
  },
  openGraph: {
    siteName: "PreviewCV",
    type: "website",
    url: config.app.siteUrl || undefined,
  },
  twitter: {
    card: "summary_large_image",
  },
};

import { Providers } from "@/components/Providers";

import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <ThemeToggle />
          <Footer />
        </Providers>

        {/* <!-- Google tag (gtag.js) --> */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9MM5ZBQ578"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9MM5ZBQ578');`}
        </Script>

        {/* Microsoft Clarity (production only; needs NEXT_PUBLIC_CLARITY_PROJECT_ID) */}
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
            <Script id="microsoft-clarity" strategy="afterInteractive">
              {`(function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");`}
            </Script>
          )}
      </body>
    </html>
  );
}

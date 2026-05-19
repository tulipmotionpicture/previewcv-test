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
  title: "PreviewCV - Resume Viewer",
  description: "Secure PDF resume viewer for shared resume links",
  icons: {
    icon: config.app.favIcon || "/favicon.ico",
    apple: config.app.favIcon || "/favicon.ico",
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
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import config from "@/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreviewCV - Resume Viewer",
  description: "Secure PDF resume viewer for shared resume links",
  icons: {
    icon: config.app.logoUrl || "/favicon.ico",
    apple: config.app.logoUrl || "/favicon.ico",
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
      </body>
    </html>
  );
}

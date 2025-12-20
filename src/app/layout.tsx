import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import config from "@/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PreviewCV - Resume Viewer",
  description: "Secure PDF resume viewer for shared resume links",
  icons: {
    icon: config.app.logoUrl || '/favicon.ico',
    apple: config.app.logoUrl || '/favicon.ico',
  },
};

import { Providers } from "@/components/Providers";

import ThemeToggle from "@/components/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  );
}

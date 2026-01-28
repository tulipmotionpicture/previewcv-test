"use client";

import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { useEffect, useState } from "react";
import { CardsSummaryResponse } from "@/types/jobs";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  Link as LinkIcon,
  FilePlus2,
  Share2,
  FileX2,
  RefreshCw,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Zap,
  Star,
  Quote,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  ScanEye,
  Sparkles
} from "lucide-react";

const LockClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

const LightningBoltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
    />
  </svg>
);

const TargetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"
    />
  </svg>
);

export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [cardsData, setCardsData] = useState<CardsSummaryResponse | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);

  // Fetch job cards data
  useEffect(() => {
    const fetchCards = async () => {
      setCardsLoading(true);
      try {
        const response = await api.getCardsSummary();
        setCardsData(response);
      } catch (err) {
        console.error("Failed to load job cards:", err);
      } finally {
        setCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  console.log(cardsData);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      {/* Navigation */}
      <Header
        links={[
          { label: "Candidate Login", href: "/candidate/login" },
          { label: "Recruiter Login", href: "/recruiter/login" },
        ]}
        cta={{
          label: "Get Started",
          href: "/candidate/signup",
          variant: "primary",
        }}
        showAuthButtons={true}
      />

      <section className="mt-16">
        {/* Hero Section */}
        <HeroSection height="auto" minHeight="min-h-[50px]" />
      </section>

      {/* Company Logos & Job Cards Section */}
      <section className="py-12 md:py-13 bg-[#EEF7F7] dark:bg-gray-900  transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">

          {/* Usage Stats Title */}
          <h2 className="text-center text-sm font-bold text-gray-500 mb-8 uppercase tracking-wider">
            Career Opportunities With Top Companies
          </h2>

          {/* Company Logos */}
          <div className="flex flex-col justify-center items-center mb-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Desktop View */}
            <div className="hidden md:block w-full">
              <Image
                src="/company-logos.png"
                alt="Company Logos"
                width={1000}
                height={100}
                className="w-full max-w-5xl h-auto object-contain mx-auto"
              />
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col gap-6 w-full px-4">
              <Image
                src="/company-logos-mobile-1.png"
                alt="Company Logos Top"
                width={500}
                height={80}
                className="w-full h-auto object-contain"
              />
              <Image
                src="/company-logos-mobile-2.png"
                alt="Company Logos Bottom"
                width={500}
                height={80}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Jobs By Location */}
            {/* Jobs By Location */}
            <div className="bg-white dark:bg-gray-800 rounded-[30px] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Jobs By Location
              </h2>

              <div className="flex flex-wrap gap-2">
                {cardsData?.cities?.slice(0, 7).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/jobs/${city.slug}`}
                    className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:border-gray-500 transition text-sm"
                  >
                    {city.city}
                  </Link>
                ))}

                {cardsData?.cities && cardsData.cities.length > 7 && (
                  <Link
                    href="/jobs"
                    className="px-5 py-1.5 border border-gray-300 rounded-full text-blue-600 font-semibold hover:border-blue-400 transition text-sm"
                  >
                    {cardsData.cities.length}+ more
                  </Link>
                )}
              </div>
            </div>

            {/* Jobs By Category */}
            <div className="bg-white dark:bg-gray-800 rounded-[30px] p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Jobs By Category
              </h3>

              <div className="flex flex-wrap gap-2">
                {cardsData?.industries?.slice(0, 5).map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/jobs/${ind.slug}`}
                    className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:border-gray-500 transition text-sm"
                  >
                    {ind.industry}
                  </Link>
                ))}

                {cardsData?.industries && cardsData.industries.length > 5 && (
                  <Link
                    href="/jobs"
                    className="px-5 py-1.5 border border-gray-300 rounded-full text-blue-600 font-semibold hover:border-blue-400 transition text-sm"
                  >
                    {cardsData.industries.length}+ more
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>




      {/* Create CV Section */}
      <section className="bg-[linear-gradient(to_right,#FBE7FF,#F6F3FF,#FFFFFF)] dark:bg-gray-900 py-6 lg:py-0 h-auto lg:h-[340px] flex items-center mt-10 lg:mt-0">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left Content */}
            <div>
              <h2 className="text-2xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Create your CV with us
              </h2>

              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6">
                It is{" "}
                <span className="text-purple-600 font-semibold">AI enabled</span> & faster!
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Choose from multiple templates
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Fill in your details & let AI assist you
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Download in PDF format
                  </span>
                </li>
              </ul>

              <Link
                href="/candidate/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg text-sm lg:text-base"
              >
                Create CV
                <Image src="/sparkle-icon.png" alt="icon" width={20} height={20} className="object-contain" />
              </Link>
            </div>

            {/* Right Resume Preview Stack */}
            <div className="hidden lg:flex relative w-full items-center justify-center lg:mt-0">

              {/* Desktop Stack View */}
              <div className="hidden lg:block relative w-[480px] h-[400px]">
                {/* Back Resume */}
                <div className="absolute left-0 top-8 rotate-[-6deg] scale-90 opacity-90 shadow-xl rounded-xl overflow-hidden z-0">
                  <Image
                    src="/resume-joshua.png"
                    alt="Resume template 1"
                    width={220}
                    height={310}
                    className="object-cover"
                  />
                </div>

                {/* Middle Resume */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 rotate-[3deg] scale-95 shadow-xl rounded-xl overflow-hidden z-10">
                  <Image
                    src="/resume-jessica.png"
                    alt="Resume template 2"
                    width={240}
                    height={335}
                    className="object-cover"
                  />
                </div>

                {/* Front Resume */}
                <div className="absolute right-0 top-0 shadow-2xl rounded-xl overflow-hidden z-20 pt-3">
                  <Image
                    src="/resume-mariana.png"
                    alt="Resume template 3"
                    width={260}
                    height={360}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Mobile Side-by-Side View */}
              <div className="lg:hidden flex flex-row justify-center gap-4 w-full">
                <div className="shadow-lg rounded-xl overflow-hidden w-[45%]">
                  <Image
                    src="/resume-jessica.png" // Using Jessica (Red) as seen in screenshot
                    alt="Resume template Left"
                    width={240}
                    height={340}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="shadow-lg rounded-xl overflow-hidden w-[45%]">
                  <Image
                    src="/resume-mariana.png" // Assuming Mariana is the dark one
                    alt="Resume template Right"
                    width={240}
                    height={340}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* Cover Letter Section */}
      <section className="bg-[linear-gradient(to_right,#F8F8F8,#E2E8FF,#B6D3EA)] dark:bg-gray-900 py-6 lg:py-0 h-auto lg:h-[340px] flex items-center mt-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: Cover Letter Mockup Stack */}
            <div className="hidden lg:flex relative w-full items-center justify-center mb-0 lg:mb-0 order-2 lg:order-1 lg:mt-0">

              {/* Desktop Stack View */}
              <div className="hidden lg:block relative w-[480px] h-[400px]">
                {/* Back Resume */}
                <div className="absolute right-0 top-8 rotate-[6deg] scale-90 opacity-90 shadow-xl rounded-xl overflow-hidden z-0">
                  <Image
                    src="/cover-letter-antonnette.png"
                    alt="Cover Letter template 1"
                    width={220}
                    height={310}
                    className="object-cover"
                  />
                </div>

                {/* Middle Resume */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 rotate-[-3deg] scale-95 shadow-xl rounded-xl overflow-hidden z-10">
                  <Image
                    src="/cover-letter-danielle.png"
                    alt="Cover Letter template 2"
                    width={240}
                    height={335}
                    className="object-cover"
                  />
                </div>

                {/* Front Resume */}
                <div className="absolute left-0 top-0 shadow-2xl rounded-xl overflow-hidden z-20 pt-10">
                  <Image
                    src="/cover-letter-lauren.png"
                    alt="Cover Letter template 3"
                    width={260}
                    height={360}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Mobile Side-by-Side View */}
              <div className="lg:hidden flex flex-row justify-center gap-4 w-full">
                <div className="shadow-lg rounded-xl overflow-hidden w-[45%]">
                  <Image
                    src="/cover-letter-danielle.png"
                    alt="Cover Letter template Left"
                    width={240}
                    height={340}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="shadow-lg rounded-xl overflow-hidden w-[45%]">
                  <Image
                    src="/cover-letter-lauren.png"
                    alt="Cover Letter template Right"
                    width={240}
                    height={340}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

            </div>

            {/* Right: Features */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Create a Professional <span className="text-blue-600">Cover Letter</span>
              </h2>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Automated Cover Letter Maker
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Integrated with your resume
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                    Hiring manager approved templates
                  </span>
                </li>
              </ul>

              <Link
                href="/candidate/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg text-sm lg:text-base"
              >
                Create Cover Letter
                <Image src="/sparkle-icon.png" alt="icon" width={20} height={20} className="object-contain" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <div className="w-full max-w-7xl mx-auto py-6 lg:py-16 animate-in fade-in duration-700 relative">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-indigo-50/50 opacity-60 rotate-12 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full border-[30px] border-purple-50/50 opacity-50 blur-3xl"></div>
        </div>

        <div className="mb-8 lg:mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight text-left mb-2 lg:mb-4">How It Works</h1>
          <p className="text-sm lg:text-base text-zinc-500 dark:text-gray-400 font-normal text-left ">Get started in minutes with our seamless workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-12 lg:mb-24 px-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-4 lg:mb-8 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <LinkIcon className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-gray-100 mb-2 lg:mb-4">Get Your Link</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-sm lg:text-[15px]">
              Receive your unique PreviewCV link automatically - same login on both platforms
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 lg:p-10 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-4 lg:mb-8 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FilePlus2 className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-gray-100 mb-2 lg:mb-4">Create Resume</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-sm lg:text-[15px]">
              Build your professional resume on LetsMakeCV.com with our easy-to-use builder
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 lg:p-10 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-100 dark:hover:border-pink-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-4 lg:mb-8 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
              <Share2 className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-gray-100 mb-2 lg:mb-4">Share & Track</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-sm lg:text-[15px]">
              Share your link anywhere - email, LinkedIn, applications. Updates automatically when you edit
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/candidate/signup" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-16 py-4 rounded-xl text-lg font-medium hover:bg-zinc-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-zinc-900/5 hover:shadow-zinc-900/10 active:scale-95 flex items-center gap-2">
            Get Started
          </Link>
        </div>
      </div>

      {/* Why PreviewCV Section */}
      {/* Why PreviewCV Section */}
      <section className="relative py-12 lg:py-24 bg-zinc-50 dark:bg-black rounded-bl-[60px] lg:rounded-bl-[100px] mb-10 overflow-hidden transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 relative z-10">

          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-zinc-200 dark:border-zinc-800 opacity-40 -rotate-12 blur-3xl"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] rounded-full border-[20px] border-blue-50/50 dark:border-blue-900/10 opacity-40 blur-3xl"></div>
          </div>

          <div className="mb-12 lg:mb-20">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-zinc-900 dark:text-gray-100 mb-6 leading-snug tracking-tight text-left">Why PreviewCV?</h1>
            <p className="text-sm lg:text-base text-zinc-600 dark:text-gray-400 font-medium max-w-2xl text-left leading-relaxed">The modern way to share your professional profile</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                icon: <FileX2 className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "No More PDFs",
                description: "Stop attaching bulky PDF files. Share a clean, professional link instead.",
                color: "text-red-600 dark:text-red-400"
              },
              {
                icon: <RefreshCw className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "Always Up-to-Date",
                description: "Edit your resume once on LetsMakeCV - your PreviewCV link updates automatically.",
                color: "text-blue-600 dark:text-blue-400"
              },
              {
                icon: <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "Track Views",
                description: "See who's viewing your resume and when they're engaging with your profile.",
                color: "text-purple-600 dark:text-purple-400"
              },
              {
                icon: <Smartphone className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "Mobile Optimized",
                description: "Perfect viewing experience on any device - desktop, tablet, or mobile.",
                color: "text-emerald-600 dark:text-emerald-400"
              },
              {
                icon: <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "Secure & Private",
                description: "Your data is encrypted and secure. Control who sees your information.",
                color: "text-indigo-600 dark:text-indigo-400"
              },
              {
                icon: <Zap className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />,
                title: "Instant Loading",
                description: "Lightning-fast preview with our optimized rendering engine. No downloads needed.",
                color: "text-amber-600 dark:text-amber-400"
              }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-start hover:translate-y-[-4px] transition-transform duration-300">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-6 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl lg:text-2xl font-medium text-zinc-900 dark:text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-gray-400 leading-relaxed text-sm lg:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Direct Market Pulse Section */}
      <section className="w-full bg-[#EEF6FF] dark:bg-gray-900 py-6 lg:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 animate-in fade-in duration-700">

          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight text-left ml-4 mb-2 lg:mb-3">Direct Market Pulse</h1>
            <p className="text-sm lg:text-base text-zinc-500 dark:text-gray-400 font-normal text-left ml-4">Live activity from our recruitment engine. Verified matching in progress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Left Column: Trending Roles */}
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-gray-100 mb-4 lg:mb-8 tracking-tight text-left ml-4 lg:ml-0">Trending Roles</h2>

              <div className="space-y-4 lg:space-y-6">
                {/* Wrapper Card for all roles */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-700">
                  {[
                    {
                      title: "Senior React Developer",
                      company: "TechCorp",
                      location: "Remote",
                      type: "Full Time"
                    },
                    {
                      title: "UI/UX Designer",
                      company: "Creative Studio",
                      location: "New York",
                      type: "On-site"
                    },
                    {
                      title: "Backend Engineer",
                      company: "FastData",
                      location: "Austin",
                      type: "Hybrid"
                    }
                  ].map((job, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between py-4 lg:py-8 border-b border-zinc-100 dark:border-zinc-700 last:border-0 last:pb-0 first:pt-0 gap-4 lg:gap-6"
                    >
                      <div className="space-y-1 lg:space-y-2">
                        <h3 className="text-base lg:text-xl font-bold text-zinc-900 dark:text-gray-100">{job.title}</h3>
                        <p className="text-zinc-500 dark:text-gray-400 font-medium text-sm lg:text-base">{job.company}</p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2 lg:gap-3 shrink-0">
                        <button className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg text-xs lg:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-gray-200 transition-all hover:gap-3 group">
                          Apply <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <span className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 lg:px-3 lg:py-1 rounded-md text-[10px] lg:text-xs font-semibold">
                          {job.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Featured Talent */}
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-gray-100 mb-4 lg:mb-8 tracking-tight text-left ml-4 lg:ml-0">Featured Talent</h2>

              <div className="space-y-4 lg:space-y-6">
                {[
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: ["React", "Java", "Python", "HTML", "SQL", "Docker"],
                    avatar: "https://i.pravatar.cc/150?u=john1"
                  },
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: ["React", "Java", "Python", "HTML", "SQL", "Docker"],
                    avatar: "https://i.pravatar.cc/150?u=john2"
                  },
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: ["React", "Java", "Python", "HTML"],
                    avatar: "https://i.pravatar.cc/150?u=john3"
                  }
                ].map((talent, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 lg:gap-5">
                      {/* Avatar */}
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-gray-100">{talent.name}</h3>
                            <p className="text-zinc-500 dark:text-gray-400 font-medium text-xs lg:text-base">{talent.role}</p>
                          </div>
                          <span className="text-xs lg:text-sm font-semibold text-zinc-900 dark:text-gray-100 shrink-0 mt-1">{talent.experience}</span>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-2 lg:mt-4">
                          {talent.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 lg:px-3 lg:py-1 rounded-md text-[10px] lg:text-xs font-semibold tracking-wide"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="w-full bg-[#164863] py-6 lg:py-16 relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 relative ">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-white/5 opacity-40 rotate-45 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full border-[30px] border-white/5 opacity-30 blur-3xl"></div>
          </div>

          <div className="mb-8 lg:mb-24 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 text-zinc-100 font-medium text-sm border border-white/10 ml-4 lg:ml-auto lg:mr-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Trusted by Professionals
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2 lg:mb-4 text-left lg:text-center ml-4 lg:ml-0">
              Join Thousands of Happy Users
            </h1>
            <p className="text-sm lg:text-base text-zinc-300 font-normal text-left lg:text-center ml-4 lg:ml-0">
              See what professionals are saying about their PreviewCV experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-indigo-100 dark:text-indigo-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "PreviewCV made sharing my resume so much easier. No more worrying about outdated PDFs! It's been a game changer for my job search."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">Sarah Chen</p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-purple-100 dark:text-purple-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "As a recruiter, I love how quickly I can view candidate profiles. It saves me so much time and the layout is always perfect."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 ring-4 ring-purple-50 dark:ring-purple-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">Michael Torres</p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">Talent Acquisition Lead</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-pink-100 dark:text-pink-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "The integration with LetsMakeCV is seamless. One account, two powerful tools! I can update my CV and it reflects instantly here."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 ring-4 ring-pink-50 dark:ring-pink-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">Priya Patel</p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Core Features Section */}
      <section className="py-12 lg:py-24 bg-zinc-900 relative overflow-hidden">
        {/* Background Noise & Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-left w-full mb-8 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-2 lg:mb-6 tracking-tight text-left">Platform Capabilities</h2>
            <p className="text-zinc-400 text-sm lg:text-lg font-light text-left">
              Engineered for speed, security, and seamless connections.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

            {/* Card 1: Secure Sharing */}
            <div className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 mb-4 lg:mb-6 text-white group-hover:scale-110 group-hover:bg-zinc-950 transition-all duration-300 shadow-lg shadow-black/20">
                <LinkIcon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">Secure Sharing</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Encrypted token-based access ensures only the right eyes see your professional profile.
              </p>
            </div>

            {/* Card 2: Live Preview */}
            <div className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 mb-4 lg:mb-6 text-white group-hover:scale-110 group-hover:bg-zinc-950 transition-all duration-300 shadow-lg shadow-black/20">
                <ScanEye size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">Live Preview</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Proprietary PDF rendering engine for a seamless, fast viewing experience on any device.
              </p>
            </div>

            {/* Card 3: Smart Matching */}
            <div className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 mb-4 lg:mb-6 text-white group-hover:scale-110 group-hover:bg-zinc-950 transition-all duration-300 shadow-lg shadow-black/20">
                <Sparkles size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">Smart Matching</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Integrated with letsmakecv.com to match candidates with their dream jobs instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-24 bg-zinc-50 dark:bg-black relative overflow-hidden">
        {/* Background Noise & Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 relative z-10">

          {/* Header */}
          <div className="mb-8 lg:mb-16">
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight text-left ml-4 lg:ml-0 mb-2 lg:mb-4">Frequently Asked Questions</h1>
            <p className="text-sm lg:text-base text-zinc-500 dark:text-zinc-400 font-normal text-left ml-4 lg:ml-0">Everything you need to know about PreviewCV.</p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {[
              {
                question: "Is PreviewCV free to use?",
                answer: "Yes! PreviewCV is completely free for candidates. Create your resume on LetsMakeCV and share your PreviewCV link at no cost. Recruiters can access basic features for free as well."
              },
              {
                question: "Do I need a LetsMakeCV account?",
                answer: "Yes, PreviewCV is the sharing platform for resumes built on LetsMakeCV. You'll need an account to create and manage your resume content, which automatically syncs here."
              },
              {
                question: "How do I get my PreviewCV link?",
                answer: "Once you publish your resume on LetsMakeCV, a unique PreviewCV link is automatically generated for you. You can find this on your dashboard or sharing settings."
              },
              {
                question: "What happens when I update my resume?",
                answer: "Any changes you make on LetsMakeCV are instantly reflected on your PreviewCV link. No need to re-upload files or send new links to recruiters."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use industry-standard encryption to protect your personal information. You also have granular control over who can view your profile."
              },
              {
                question: "Can I track who views my resume?",
                answer: "Yes, our analytics dashboard shows you when your resume was viewed, allowing you to gauge interest from recruiters and follow up effectively."
              }
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`
                  group cursor-pointer transition-all duration-300 ease-in-out border border-zinc-200 dark:border-white/5
                  ${openIndex === index
                    ? 'bg-white dark:bg-zinc-900 p-6 lg:p-8 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20'
                    : 'bg-white/50 dark:bg-zinc-900/30 py-4 lg:py-6 px-6 hover:bg-white dark:hover:bg-zinc-800 rounded-xl hover:shadow-sm'
                  }
                `}
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className={`text-base lg:text-xl font-medium transition-colors ${openIndex === index ? 'text-zinc-900 dark:text-gray-100' : 'text-zinc-800 dark:text-gray-300'}`}>
                    {item.question}
                  </h3>

                  <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    {openIndex === index ? (
                      <MinusCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600/70 dark:text-emerald-400" strokeWidth={1.5} />
                    ) : (
                      <PlusCircle className="w-5 h-5 lg:w-6 lg:h-6 text-zinc-400 dark:text-gray-500 group-hover:text-zinc-600 dark:group-hover:text-gray-300" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-2 lg:mt-4' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-zinc-600 dark:text-gray-400 leading-relaxed text-sm lg:text-base pr-4 lg:pr-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

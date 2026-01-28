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
  MinusCircle
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
        <HeroSection />
      </section>

      {/* Company Logos & Job Cards Section */}
      <section className="py-24 bg-[#EEF7F7] dark:bg-gray-900 h-[300px] transition-colors duration-300 mb-30">
        <div className="max-w-7xl mx-auto px-6">

          {/* Company Logos */}
          <div className="flex flex-wrap items-center justify-center gap-12 mb-10 opacity-60 grayscale">
            {["Google", "ORACLE", "Bloomberg", "Microsoft", "DocuSign", "Dropbox", "TWO SIGMA", "Apple"].map((company) => (
              <span
                key={company}
                className="text-2xl font-semibold text-gray-500 dark:text-gray-400"
              >
                {company}
              </span>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

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
      <section className="bg-[linear-gradient(to_right,#FBE7FF,#F6F3FF,#FFFFFF)] dark:bg-gray-900 overflow-hidden h-[340px] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Create your CV with us
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                It is{" "}
                <span className="text-purple-600 font-semibold">AI enabled</span> & faster!
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Choose from multiple templates
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Fill in your details & let AI assist you
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 w-5 h-5" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Download in PDF format
                  </span>
                </li>
              </ul>

              <Link
                href="/candidate/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg text-base"
              >
                Create CV
                <Image src="/sparkle-icon.png" alt="icon" width={20} height={20} className="object-contain" />
              </Link>
            </div>

            {/* Right Resume Preview Stack */}
            <div className="relative h-[400px] w-full flex items-center justify-center">
              <div className="relative w-[480px] h-full">
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
            </div>
          </div>
        </div>
      </section>


      {/* Cover Letter Section */}
      <section className="bg-[linear-gradient(to_right,#F8F8F8,#E2E8FF,#B6D3EA)] dark:bg-gray-900 overflow-hidden h-[340px] flex items-center mt-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: Cover Letter Mockup Stack */}
            <div className="relative h-[400px] w-full flex items-center justify-center">
              <div className="relative w-[480px] h-full">
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
            </div>

            {/* Right: Features */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Create a Professional <span className="text-blue-600">Cover Letter</span>
              </h2>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Automated Cover Letter Maker
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Integrated with your resume
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200 text-base">
                    Hiring manager approved templates
                  </span>
                </li>
              </ul>

              <Link
                href="/candidate/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg text-base"
              >
                Create Cover Letter
                <Image src="/sparkle-icon.png" alt="icon" width={20} height={20} className="object-contain" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {/* How It Works Section */}
      <div className="w-full max-w-7xl mx-auto py-12 md:py-16 animate-in fade-in duration-700 relative">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-indigo-50/50 opacity-60 rotate-12 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full border-[30px] border-purple-50/50 opacity-50 blur-3xl"></div>
        </div>

        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight mb-4">How It Works</h1>
          <p className="text-xl text-zinc-500 dark:text-gray-400 font-normal">Get started in minutes with our seamless workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 px-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-8 w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <LinkIcon size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-gray-100 mb-4">Get Your Link</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-[15px]">
              Receive your unique PreviewCV link automatically - same login on both platforms
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-8 w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FilePlus2 size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-gray-100 mb-4">Create Resume</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-[15px]">
              Build your professional resume on LetsMakeCV.com with our easy-to-use builder
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-100 dark:hover:border-pink-900 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-8 w-20 h-20 rounded-2xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
              <Share2 size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-gray-100 mb-4">Share & Track</h3>
            <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-[15px]">
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
      <div className="w-full max-w-7xl mx-auto py-12 md:py-16 animate-in fade-in duration-700 relative">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-zinc-50 dark:border-gray-800 opacity-70 -rotate-12 blur-3xl"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] rounded-full border-[20px] border-blue-50/50 dark:border-blue-900/20 opacity-60 blur-3xl"></div>
        </div>

        <div className="mb-24">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight mb-4">Why PreviewCV?</h1>
          <p className="text-xl text-zinc-500 dark:text-gray-400 font-normal max-w-2xl">The modern way to share your professional profile</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {[
            {
              icon: <FileX2 size={28} strokeWidth={1.5} />,
              title: "No More PDFs",
              description: "Stop attaching bulky PDF files. Share a clean, professional link instead.",
              color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900"
            },
            {
              icon: <RefreshCw size={28} strokeWidth={1.5} />,
              title: "Always Up-to-Date",
              description: "Edit your resume once on LetsMakeCV - your PreviewCV link updates automatically.",
              color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900"
            },
            {
              icon: <BarChart3 size={28} strokeWidth={1.5} />,
              title: "Track Views",
              description: "See who's viewing your resume and when they're engaging with your profile.",
              color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900"
            },
            {
              icon: <Smartphone size={28} strokeWidth={1.5} />,
              title: "Mobile Optimized",
              description: "Perfect viewing experience on any device - desktop, tablet, or mobile.",
              color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900"
            },
            {
              icon: <ShieldCheck size={28} strokeWidth={1.5} />,
              title: "Secure & Private",
              description: "Your data is encrypted and secure. Control who sees your information.",
              color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900"
            },
            {
              icon: <Zap size={28} strokeWidth={1.5} />,
              title: "Instant Loading",
              description: "Lightning-fast preview with our optimized rendering engine. No downloads needed.",
              color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900"
            }
          ].map((feature, index) => (
            <div key={index} className="group flex flex-col items-start">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-gray-100 mb-3 group-hover:text-black dark:group-hover:text-white">{feature.title}</h3>
              <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-[15px] group-hover:text-zinc-600 dark:group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Section */}
      <section className="w-full bg-[#164863] py-12 md:py-16 relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 relative">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-white/5 opacity-40 rotate-45 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full border-[30px] border-white/5 opacity-30 blur-3xl"></div>
          </div>

          <div className="mb-24 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 text-zinc-100 font-medium text-sm border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Trusted by Professionals
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Join Thousands of Happy Users
            </h1>
            <p className="text-xl text-zinc-300 font-normal">
              See what professionals are saying about their PreviewCV experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-indigo-100 dark:text-indigo-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-8 leading-relaxed text-lg relative z-10">
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-purple-100 dark:text-purple-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-8 leading-relaxed text-lg relative z-10">
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-pink-100 dark:text-pink-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-8 leading-relaxed text-lg relative z-10">
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

      {/* Direct Market Pulse Section */}
      <section className="w-full bg-[#EEF6FF] dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-6 animate-in fade-in duration-700">

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight mb-3">Direct Market Pulse</h1>
            <p className="text-lg text-zinc-500 dark:text-gray-400 font-normal">Live activity from our recruitment engine. Verified matching in progress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Left Column: Trending Roles */}
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-gray-100 mb-8 tracking-tight">Trending Roles</h2>

              <div className="space-y-6">
                {/* Wrapper Card for all roles */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-700">
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
                      className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-zinc-100 dark:border-zinc-700 last:border-0 last:pb-0 first:pt-0 gap-6"
                    >
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-gray-100">{job.title}</h3>
                        <p className="text-zinc-500 dark:text-gray-400 font-medium text-base">{job.company}</p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        <button className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-gray-200 transition-all hover:gap-3 group">
                          Apply <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <span className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-md text-xs font-semibold">
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
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-gray-100 mb-8 tracking-tight">Featured Talent</h2>

              <div className="space-y-6">
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
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-5">
                      {/* Avatar */}
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-gray-100">{talent.name}</h3>
                            <p className="text-zinc-500 dark:text-gray-400 font-medium text-base">{talent.role}</p>
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-gray-100 shrink-0 mt-1">{talent.experience}</span>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {talent.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-md text-xs font-semibold tracking-wide"
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

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <LockClosedIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">
                Secure Sharing
              </h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Encrypted token-based access ensures only the right eyes see
                your professional profile.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <LightningBoltIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">
                Live Preview
              </h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Proprietary PDF rendering engine for a seamless, fast viewing
                experience on any device.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <TargetIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">
                Smart Matching
              </h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Integrated with letsmakecv.com to match candidates with their
                dream jobs instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="w-full max-w-4xl mx-auto py-12 md:py-20 animate-in fade-in duration-700">

        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-zinc-500 dark:text-gray-400 font-normal">Everything you need to know about PreviewCV.</p>
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
                group cursor-pointer transition-all duration-500 ease-in-out
                ${openIndex === index
                  ? 'bg-emerald-50/60 dark:bg-emerald-900/10 p-8 rounded-2xl'
                  : 'py-6 px-4 hover:bg-white dark:hover:bg-gray-800 hover:rounded-xl'
                }
              `}
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className={`text-lg md:text-xl font-medium transition-colors ${openIndex === index ? 'text-zinc-900 dark:text-gray-100' : 'text-zinc-800 dark:text-gray-300'}`}>
                  {item.question}
                </h3>

                <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? (
                    <MinusCircle size={24} className="text-emerald-600/70 dark:text-emerald-400" strokeWidth={1.5} />
                  ) : (
                    <PlusCircle size={24} className="text-zinc-400 dark:text-gray-500 group-hover:text-zinc-600 dark:group-hover:text-gray-300" strokeWidth={1.5} />
                  )}
                </div>
              </div>

              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <p className="text-zinc-600 dark:text-gray-400 leading-relaxed text-[15px] md:text-base pr-8">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            © 2025 {config.app.name}.
          </p>
          <div className="flex gap-8 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-gray-100 dark:border-gray-800 mt-10">
          <Link
            href="/resume/view/test-token"
            className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tight"
          >
            View Sample Live Resume Profile →
          </Link>
        </div>
      </footer>
    </div>
  );
}

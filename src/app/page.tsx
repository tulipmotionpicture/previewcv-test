"use client";

import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/shared/FAQSection";
import { useEffect, useState } from "react";
import { CardsSummaryResponse } from "@/types/jobs";
import { BlogPostsResponse } from "@/types";
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
  Sparkles,
  Eye,
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
  const [blogPosts, setBlogPosts] = useState<BlogPostsResponse | null>(null);
  const [blogLoading, setBlogLoading] = useState(true);

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

  // Fetch blog posts data
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setBlogLoading(true);
      try {
        const response = await api.getBlogPosts({
          limit: 8,
          sort_by: "published_at",
          sort_order: "desc",
        });
        setBlogPosts(response);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setBlogLoading(false);
      }
    };
    fetchBlogPosts();
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

      <section>
        {/* Hero Section */}
        <HeroSection height="auto" minHeight="min-h-[300px]">
          {/* Cards */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pt-10">
            {/* Jobs By Location */}
            <div className="bg-white/60 dark:bg-[#0a0a0a] backdrop-blur-xl rounded-[24px] p-4 lg:p-5 shadow-xl border border-white/50 dark:border-gray-800/50 hover:bg-white/80 dark:hover:bg-[#0a0a0a] transition-all duration-300">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-teal-600 rounded-full"></span>
                Jobs By Location
              </h2>

              <div className="flex flex-wrap gap-2">
                {cardsData?.cities?.slice(0, 7).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/jobs/${city.slug}`}
                    className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] rounded-lg text-gray-700 dark:text-[#a1a1a1] font-semibold shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 text-[11px] border border-transparent hover:border-teal-100"
                  >
                    {city.city}
                  </Link>
                ))}

                {cardsData?.cities && cardsData.cities.length > 7 && (
                  <Link
                    href="/jobs"
                    className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all duration-300 text-[11px] shadow-sm"
                  >
                    {cardsData.cities.length}+ more
                  </Link>
                )}
              </div>
            </div>

            {/* Jobs By Category */}
            <div className="bg-white/60 dark:bg-[#0a0a0a] backdrop-blur-xl rounded-[24px] p-4 lg:p-5 shadow-xl border border-white/50 dark:border-gray-800/50 hover:bg-white/80 dark:hover:bg-[#0a0a0a] transition-all duration-300">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
                Jobs By Category
              </h3>

              <div className="flex flex-wrap gap-2">
                {cardsData?.industries?.slice(0, 5).map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/jobs/${ind.slug}`}
                    className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] rounded-lg text-gray-700 dark:text-[#a1a1a1] font-semibold shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 text-[11px] border border-transparent hover:border-purple-100"
                  >
                    {ind.industry}
                  </Link>
                ))}

                {cardsData?.industries && cardsData.industries.length > 5 && (
                  <Link
                    href="/jobs"
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300 text-[11px] shadow-sm"
                  >
                    {cardsData.industries.length}+ more
                  </Link>
                )}
              </div>
            </div>
          </div>
        </HeroSection>
      </section>

      {/* Jobs By Top Employers */}
      <section className="py-6 lg:py-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-left text-lg lg:text-xl pt-6 font-bold text-gray-900 dark:text-gray-100 mb-4">
            Jobs By Top Employers
          </h2>

          <div className="flex flex-col gap-4 overflow-hidden py-4">
            {/* Row 1 - Scroll Left */}
            <div className="relative w-full overflow-hidden h-16 md:h-20">
              <div className="absolute top-0 left-0 h-full flex animate-scroll-left w-max">
                {[
                  { name: "Imtiaz", src: "/logos/logo-1.png" },
                  { name: "Thumbay", src: "/logos/logo-2.png" },
                  { name: "Duncan & Ross", src: "/logos/logo-3.png" },
                  { name: "Raqmiyat", src: "/logos/logo-4.png" },
                  { name: "Reportage", src: "/logos/logo-1.png" },
                  { name: "UBS", src: "/logos/logo-2.png" },
                  { name: "SK Overseas", src: "/logos/logo-3.png" },
                  { name: "Ektifa", src: "/logos/logo-4.png" },
                  { name: "NMC", src: "/logos/logo-1.png" },
                  { name: "Robt Stone", src: "/logos/logo-2.png" },
                  { name: "Tarrad", src: "/logos/logo-3.png" },
                  { name: "ABC", src: "/logos/logo-4.png" },
                  // Duplicates
                  { name: "Imtiaz", src: "/logos/logo-1.png" },
                  { name: "Thumbay", src: "/logos/logo-2.png" },
                  { name: "Duncan & Ross", src: "/logos/logo-3.png" },
                  { name: "Raqmiyat", src: "/logos/logo-4.png" },
                  { name: "Reportage", src: "/logos/logo-1.png" },
                  { name: "UBS", src: "/logos/logo-2.png" },
                  { name: "SK Overseas", src: "/logos/logo-3.png" },
                  { name: "Ektifa", src: "/logos/logo-4.png" },
                  { name: "NMC", src: "/logos/logo-1.png" },
                  { name: "Robt Stone", src: "/logos/logo-2.png" },
                  { name: "Tarrad", src: "/logos/logo-3.png" },
                  { name: "ABC", src: "/logos/logo-4.png" },
                ].map((employer, i) => (
                  <div
                    key={i}
                    className="px-2 w-[120px] md:w-[160px] lg:w-[200px] h-full flex-shrink-0"
                  >
                    <div className="bg-white p-2 md:p-4 border border-gray-200 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow h-full w-full">
                      <Image
                        src={employer.src}
                        alt={employer.name}
                        width={100}
                        height={40}
                        className="object-contain max-h-12"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - Scroll Right */}
            <div className="relative w-full overflow-hidden h-16 md:h-20">
              <div className="absolute top-0 left-0 h-full flex animate-scroll-right w-max">
                {[
                  { name: "NMDC", src: "/logos/logo-1.png" },
                  { name: "BNW", src: "/logos/logo-2.png" },
                  { name: "HCLTech", src: "/logos/logo-3.png" },
                  { name: "Wipro", src: "/logos/logo-4.png" },
                  { name: "Fisher", src: "/logos/logo-1.png" },
                  { name: "KBC", src: "/logos/logo-2.png" },
                  { name: "Zulekha Hospital", src: "/logos/logo-3.png" },
                  { name: "Sundus", src: "/logos/logo-4.png" },
                  { name: "Salam", src: "/logos/logo-1.png" },
                  { name: "Sharaf Group", src: "/logos/logo-2.png" },
                  { name: "Binghatti", src: "/logos/logo-3.png" },
                  { name: "Innovations Group", src: "/logos/logo-4.png" },
                  // Duplicates
                  { name: "NMDC", src: "/logos/logo-1.png" },
                  { name: "BNW", src: "/logos/logo-2.png" },
                  { name: "HCLTech", src: "/logos/logo-3.png" },
                  { name: "Wipro", src: "/logos/logo-4.png" },
                  { name: "Fisher", src: "/logos/logo-1.png" },
                  { name: "KBC", src: "/logos/logo-2.png" },
                  { name: "Zulekha Hospital", src: "/logos/logo-3.png" },
                  { name: "Sundus", src: "/logos/logo-4.png" },
                  { name: "Salam", src: "/logos/logo-1.png" },
                  { name: "Sharaf Group", src: "/logos/logo-2.png" },
                  { name: "Binghatti", src: "/logos/logo-3.png" },
                  { name: "Innovations Group", src: "/logos/logo-4.png" },
                ].map((employer, i) => (
                  <div
                    key={i}
                    className="px-2 w-[120px] md:w-[160px] lg:w-[200px] h-full flex-shrink-0"
                  >
                    <div className="bg-white p-2 md:p-4 border border-gray-200 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow h-full w-full">
                      <Image
                        src={employer.src}
                        alt={employer.name}
                        width={100}
                        height={40}
                        className="object-contain max-h-12"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Reads Section */}
      <section className="py-6 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
              All Articles
            </h2>
            <Link
              href="/blogs"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {blogLoading ? (
            <div className="grid grid-flow-col auto-cols-[280px] lg:auto-cols-[320px] gap-6 overflow-x-auto pb-6 no-scrollbar">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 animate-pulse"
                >
                  <div className="relative h-40 w-full rounded-xl bg-gray-100 dark:bg-gray-800 mb-4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogPosts && blogPosts.posts.length > 0 ? (
            <div className="grid grid-flow-col auto-cols-[280px] lg:auto-cols-[320px] gap-6 overflow-x-auto pb-6 no-scrollbar">
              {blogPosts.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Sparkles className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
                    {post.excerpt}{" "}
                    <span className="text-blue-500 font-medium">Read More</span>
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-auto">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.view_count} Views
                    </div>
                    <span>
                      {new Date(post.published_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No blog posts available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Create CV Section */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8 mt-2">
        <div className="bg-[#FAF9FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 overflow-hidden relative border border-purple-50 dark:border-gray-700">
          {/* Left Content */}
          <div className="w-full lg:max-w-[40%] z-10">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create your CV with us
            </h2>

            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-6">
              It is{" "}
              <span className="text-purple-600 font-semibold">AI enabled</span>{" "}
              & faster!
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="text-purple-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Choose from multiple templates
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="text-purple-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Fill in your details & let AI assist you
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="text-purple-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Download in PDF format
                </span>
              </li>
            </ul>

            <Link
              href="/candidate/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0CA0E8] hover:bg-[#0b8rcd] text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl text-xs lg:text-sm"
            >
              Create CV
              <Image
                src="/sparkle-icon.png"
                alt="icon"
                width={14}
                height={14}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right Resume Row View */}
          <div className="w-full lg:w-[60%] relative flex justify-center lg:justify-end items-end h-[200px] lg:h-[260px]">
            <div className="relative w-full h-full flex items-end justify-center lg:justify-end gap-2 lg:gap-4 translate-y-6 lg:translate-x-6">
              {/* Resume 1 */}
              <div className="relative w-[120px] lg:w-[160px] h-[180px] lg:h-[240px] shadow-2xl rounded-t-xl overflow-hidden transform translate-y-4">
                <Image
                  src="/resume-joshua.png"
                  alt="Resume template 1"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Resume 2 */}
              <div className="relative w-[120px] lg:w-[160px] h-[200px] lg:h-[270px] shadow-2xl rounded-t-xl overflow-hidden z-20 -mx-6 lg:-mx-8 mb-0">
                <Image
                  src="/resume-jessica.png"
                  alt="Resume template 2"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Resume 3 */}
              <div className="relative w-[120px] lg:w-[160px] h-[180px] lg:h-[240px] shadow-2xl rounded-t-xl overflow-hidden transform translate-y-4">
                <Image
                  src="/resume-mariana.png"
                  alt="Resume template 3"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Letter Section - Redesigned to Match */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8">
        <div className="bg-[#F2F5FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 overflow-hidden relative border border-blue-50 dark:border-gray-700">
          {/* Left Content */}
          <div className="w-full lg:max-w-[40%] z-10">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create a Professional{" "}
              <span className="text-blue-600">Cover Letter</span>
            </h2>

            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-6">
              Stand out with a{" "}
              <span className="text-blue-600 font-semibold">customized</span>{" "}
              cover letter.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="text-blue-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Automated Cover Letter Maker
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="text-blue-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Integrated with your resume
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="text-blue-600 w-3 h-3" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium">
                  Hiring manager approved templates
                </span>
              </li>
            </ul>

            <Link
              href="/candidate/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl text-xs lg:text-sm"
            >
              Create Cover Letter
              <Image
                src="/sparkle-icon.png"
                alt="icon"
                width={14}
                height={14}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right Cover Letter Row View */}
          <div className="w-full lg:w-[60%] relative flex justify-center lg:justify-end items-end h-[200px] lg:h-[260px]">
            <div className="relative w-full h-full flex items-end justify-center lg:justify-end gap-2 lg:gap-4 translate-y-6 lg:translate-x-6">
              {/* CL 1 */}
              <div className="relative w-[120px] lg:w-[160px] h-[180px] lg:h-[240px] shadow-2xl rounded-t-xl overflow-hidden transform translate-y-4">
                <Image
                  src="/cover-letter-antonnette.png"
                  alt="Cover Letter 1"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* CL 2 */}
              <div className="relative w-[120px] lg:w-[160px] h-[200px] lg:h-[270px] shadow-2xl rounded-t-xl overflow-hidden z-20 -mx-6 lg:-mx-8 mb-0">
                <Image
                  src="/cover-letter-danielle.png"
                  alt="Cover Letter 2"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* CL 3 */}
              <div className="relative w-[120px] lg:w-[160px] h-[180px] lg:h-[240px] shadow-2xl rounded-t-xl overflow-hidden transform translate-y-4">
                <Image
                  src="/cover-letter-lauren.png"
                  alt="Cover Letter 3"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8">
        <div className="bg-[#FAF9FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 relative overflow-hidden border border-purple-50 dark:border-gray-700">
          <div className="mb-8 lg:mb-12 text-left w-full">
            <h1 className="text-xl lg:text-3xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight text-left mb-2 lg:mb-4">
              How It Works
            </h1>
            <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium text-left max-w-2xl">
              Get started in minutes with our seamless workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-700/50 p-5 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-600 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 lg:mb-6 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <LinkIcon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
              </div>
              <h3 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-gray-100 mb-2">
                Get Your Link
              </h3>
              <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-xs lg:text-sm">
                Receive your unique PreviewCV link automatically - same login on
                both platforms
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-700/50 p-5 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-600 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 lg:mb-6 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <FilePlus2 className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
              </div>
              <h3 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-gray-100 mb-2">
                Create Resume
              </h3>
              <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-xs lg:text-sm">
                Build your professional resume on LetsMakeCV.com with our
                easy-to-use builder
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-700/50 p-5 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-600 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-100 dark:hover:border-pink-900 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 lg:mb-6 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
                <Share2 className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
              </div>
              <h3 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-gray-100 mb-2">
                Share & Track
              </h3>
              <p className="text-zinc-500 dark:text-gray-400 leading-relaxed text-xs lg:text-sm">
                Share your link anywhere - email, LinkedIn, applications.
                Updates automatically when you edit
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/candidate/signup"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-12 py-3 rounded-xl text-sm lg:text-base font-medium hover:bg-zinc-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-zinc-900/5 hover:shadow-zinc-900/10 active:scale-95 flex items-center gap-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Why PreviewCV Section */}
      {/* Why PreviewCV Section */}
      {/* Why PreviewCV Section */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8">
        <div className="bg-[#FAF9FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 relative overflow-hidden border border-purple-50 dark:border-gray-700">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] rounded-[100px] border-[40px] border-zinc-200 dark:border-zinc-800 opacity-40 -rotate-12 blur-3xl"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] rounded-full border-[20px] border-blue-50/50 dark:border-blue-900/10 opacity-40 blur-3xl"></div>
          </div>

          <div className="mb-8 lg:mb-16">
            <h1 className="text-xl lg:text-3xl font-bold text-zinc-900 dark:text-gray-100 mb-4 leading-snug tracking-tight text-left">
              Why PreviewCV?
            </h1>
            <p className="text-sm text-zinc-600 dark:text-gray-400 font-medium max-w-2xl text-left leading-relaxed">
              The modern way to share your professional profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                icon: (
                  <FileX2 className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                ),
                title: "No More PDFs",
                description:
                  "Stop attaching bulky PDF files. Share a clean, professional link instead.",
                color: "text-red-600 dark:text-red-400",
              },
              {
                icon: (
                  <RefreshCw
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    strokeWidth={1.5}
                  />
                ),
                title: "Always Up-to-Date",
                description:
                  "Edit your resume once on LetsMakeCV - your PreviewCV link updates automatically.",
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: (
                  <BarChart3
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    strokeWidth={1.5}
                  />
                ),
                title: "Track Views",
                description:
                  "See who's viewing your resume and when they're engaging with your profile.",
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: (
                  <Smartphone
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    strokeWidth={1.5}
                  />
                ),
                title: "Mobile Optimized",
                description:
                  "Perfect viewing experience on any device - desktop, tablet, or mobile.",
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                icon: (
                  <ShieldCheck
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    strokeWidth={1.5}
                  />
                ),
                title: "Secure & Private",
                description:
                  "Your data is encrypted and secure. Control who sees your information.",
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                icon: (
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                ),
                title: "Instant Loading",
                description:
                  "Lightning-fast preview with our optimized rendering engine. No downloads needed.",
                color: "text-amber-600 dark:text-amber-400",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-start hover:translate-y-[-4px] transition-transform duration-300"
              >
                <div
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-4 lg:mb-6 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg lg:text-xl font-medium text-zinc-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-gray-400 leading-relaxed text-xs lg:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Direct Market Pulse Section */}
      {/* Direct Market Pulse Section */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8">
        <div className="bg-[#FAF9FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 relative overflow-hidden border border-purple-50 dark:border-gray-700 animate-in fade-in duration-700">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-xl lg:text-3xl font-bold text-zinc-900 dark:text-gray-100 tracking-tight text-left mb-2 lg:mb-4">
              Direct Market Pulse
            </h1>
            <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium text-left max-w-2xl">
              Live activity from our recruitment engine. Verified matching in
              progress.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column: Trending Roles */}
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-zinc-900 dark:text-gray-100 mb-4 lg:mb-6 tracking-tight text-left ml-2 lg:ml-0">
                Trending Roles
              </h2>

              <div className="space-y-4 lg:space-y-6">
                {/* Wrapper Card for all roles */}
                <div className="bg-white dark:bg-gray-700/50 rounded-2xl p-4 lg:p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-700">
                  {[
                    {
                      title: "Senior React Developer",
                      company: "TechCorp",
                      location: "Remote",
                      type: "Full Time",
                    },
                    {
                      title: "UI/UX Designer",
                      company: "Creative Studio",
                      location: "New York",
                      type: "On-site",
                    },
                    {
                      title: "Backend Engineer",
                      company: "FastData",
                      location: "Austin",
                      type: "Hybrid",
                    },
                  ].map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 first:pt-0"
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {job.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                          {job.company}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <button className="flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                          Apply <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-[10px] font-semibold">
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
              <h2 className="text-lg lg:text-xl font-semibold text-zinc-900 dark:text-gray-100 mb-4 lg:mb-6 tracking-tight text-left ml-2 lg:ml-0">
                Featured Talent
              </h2>

              <div className="space-y-3 lg:space-y-4">
                {[
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: [
                      "React",
                      "Java",
                      "Python",
                      "HTML",
                      "SQL",
                      "Docker",
                    ],
                    avatar: "https://i.pravatar.cc/150?u=john1",
                  },
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: [
                      "React",
                      "Java",
                      "Python",
                      "HTML",
                      "SQL",
                      "Docker",
                    ],
                    avatar: "https://i.pravatar.cc/150?u=john2",
                  },
                  {
                    name: "John Deo",
                    role: "Senior React Developer",
                    experience: "5 Years",
                    skills: ["React", "Java", "Python", "HTML"],
                    avatar: "https://i.pravatar.cc/150?u=john3",
                  },
                ].map((talent, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-700/50 rounded-2xl p-5 shadow-sm border border-zinc-200/60 dark:border-zinc-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                              {talent.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                              {talent.role}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                            {talent.experience}
                          </span>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {talent.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-[10px] font-bold"
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

          <div className="mb-8 lg:mb-24 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 text-zinc-100 font-medium text-sm border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Trusted by Professionals
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight mb-4 lg:mb-6 text-left">
              Join Thousands of Happy Users
            </h1>
            <p className="text-base text-zinc-300 font-medium text-left max-w-2xl">
              See what professionals are saying about their PreviewCV experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-indigo-100 dark:text-indigo-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "PreviewCV made sharing my resume so much easier. No more
                worrying about outdated PDFs! It's been a game changer for my
                job search."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">
                    Sarah Chen
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">
                    Software Engineer
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-purple-100 dark:text-purple-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "As a recruiter, I love how quickly I can view candidate
                profiles. It saves me so much time and the layout is always
                perfect."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 ring-4 ring-purple-50 dark:ring-purple-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">
                    Michael Torres
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">
                    Talent Acquisition Lead
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-gray-700 flex flex-col relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute top-8 right-8 text-pink-100 dark:text-pink-900/30 w-12 h-12" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-gray-300 font-medium mb-4 lg:mb-8 leading-relaxed text-base lg:text-lg relative z-10">
                "The integration with LetsMakeCV is seamless. One account, two
                powerful tools! I can update my CV and it reflects instantly
                here."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 ring-4 ring-pink-50 dark:ring-pink-900/20"></div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-gray-100">
                    Priya Patel
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-medium">
                    UX Designer
                  </p>
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
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 tracking-tight text-left">
              Platform Capabilities
            </h2>
            <p className="text-base text-zinc-400 font-medium text-left max-w-2xl">
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
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">
                Secure Sharing
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Encrypted token-based access ensures only the right eyes see
                your professional profile.
              </p>
            </div>

            {/* Card 2: Live Preview */}
            <div className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 mb-4 lg:mb-6 text-white group-hover:scale-110 group-hover:bg-zinc-950 transition-all duration-300 shadow-lg shadow-black/20">
                <ScanEye size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">
                Live Preview
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Proprietary PDF rendering engine for a seamless, fast viewing
                experience on any device.
              </p>
            </div>

            {/* Card 3: Smart Matching */}
            <div className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 mb-4 lg:mb-6 text-white group-hover:scale-110 group-hover:bg-zinc-950 transition-all duration-300 shadow-lg shadow-black/20">
                <Sparkles size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-3">
                Smart Matching
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Integrated with letsmakecv.com to match candidates with their
                dream jobs instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about PreviewCV."
        faqs={[
          {
            question: "Is PreviewCV free to use?",
            answer:
              "Yes! PreviewCV is completely free for candidates. Create your resume on LetsMakeCV and share your PreviewCV link at no cost. Recruiters can access basic features for free as well.",
          },
          {
            question: "Do I need a LetsMakeCV account?",
            answer:
              "Yes, PreviewCV is the sharing platform for resumes built on LetsMakeCV. You'll need an account to create and manage your resume content, which automatically syncs here.",
          },
          {
            question: "How do I get my PreviewCV link?",
            answer:
              "Once you publish your resume on LetsMakeCV, a unique PreviewCV link is automatically generated for you. You can find this on your dashboard or sharing settings.",
          },
          {
            question: "What happens when I update my resume?",
            answer:
              "Any changes you make on LetsMakeCV are instantly reflected on your PreviewCV link. No need to re-upload files or send new links to recruiters.",
          },
          {
            question: "Is my data secure?",
            answer:
              "Absolutely. We use industry-standard encryption to protect your personal information. You also have granular control over who can view your profile.",
          },
          {
            question: "Can I track who views my resume?",
            answer:
              "Yes, our analytics dashboard shows you when your resume was viewed, allowing you to gauge interest from recruiters and follow up effectively.",
          },
        ]}
      />
    </div>
  );
}

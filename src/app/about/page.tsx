import React from "react";
import { Users, Globe, Briefcase, Award } from "lucide-react";
import CardSlider from "@/components/CardSlider";
import Image from "next/image";
import FloatingHeader from "@/components/FloatingHeader";
// If you have framer-motion installed, import it for smooth animations
// import { motion } from "framer-motion";

export default function AboutUsPage() {
  return (
    <>
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />
      <div className=" max-w-7xl mx-auto">
        {/* Hero Section with SVG/Gradient */}
        <section className="relative overflow-hidden py-20 flex flex-col items-center justify-center  max-w-6xl mx-auto">

          <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 leading-tight animate-in fade-in">
            We aspire to be the{" "}
            <span className="font-bold text-primary-blue">
              advisor, advocate
            </span>{" "}
            and keeper of people's personal career journey
          </h1>
          <p className="text-lg text-muted-foreground mb-8 animate-in slide-in-from-bottom max-w-2xl mx-auto">
            Empowering job seekers worldwide with expertly crafted resumes, cover
            letters, and career tools.
          </p>
        </section>
        <section className=" text-gray-800 ">
          <div className="max-w-6xl mx-auto space-y-12">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Why We Need a Resume Builder
              </h3>
              <p className="text-gray-700 leading-relaxed">
                In today’s fast-paced and competitive job market, a well-crafted
                resume is more important than ever. It’s not just a document—it’s
                your first impression, your personal brand, and a gateway to
                countless career opportunities.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                However, creating a standout resume can be overwhelming.
                Formatting issues, choosing the right words, and presenting your
                achievements effectively often become time-consuming and
                frustrating tasks.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                That’s where <strong>letsmakecv</strong> comes in. We recognized
                the need for a smarter, simpler, and more accessible way to create
                professional resumes—and decided to build a solution that empowers
                job seekers across all industries and experience levels.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">
                How We Came Into the Picture
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our journey began with a group of passionate individuals who
                shared a common goal: to make job hunting easier and more
                accessible for everyone.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Like many others, we’ve struggled to write resumes that truly
                reflect our skills and achievements. In our conversations, we
                realized this was a widespread problem affecting new graduates,
                experienced professionals, and career switchers alike.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We brought together a dedicated team of developers, designers, and
                HR professionals to create a feature-rich platform that’s
                intuitive and career-focused.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Core Values</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                <li>
                  <strong>Accessibility:</strong> Everyone, regardless of
                  technical background, should be able to create a professional
                  resume.
                </li>
                <li>
                  <strong>Empowerment:</strong> We provide tools, templates, and
                  guidance to help users confidently showcase their skills.
                </li>
                <li>
                  <strong>Innovation:</strong> Our platform is always evolving to
                  stay ahead of trends and industry standards.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                We’re here to do more than just build resumes. We’re on a mission
                to <strong>level the playing field</strong>, giving equal
                opportunities to job seekers from all walks of life. Whether
                you’re a student, a career changer, or an experienced
                professional, <strong>letsmakecv</strong> is here to support your
                journey.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We’ll continue to grow with you—offering new templates, features,
                and resources tailored to the ever-changing job market.
              </p>
            </div>
          </div>
        </section>
        {/* SVG Section Divider */}
        <div className="w-full -mt-8">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-20"
          >
            <path
              d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z"
              fill="#f1f5f9"
            />
          </svg>
        </div>

        {/* Stats/Impact Row */}
        <section className="max-w-6xl mx-auto px-4 mb-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              icon: <Users className="h-8 w-8" />,
              value: "1M+",
              label: "Job seekers helped",
              color: "from-blue-400 to-blue-600",
            },
            {
              icon: <Briefcase className="h-8 w-8" />,
              value: "500k+",
              label: "Resumes created",
              color: "from-green-400 to-green-600",
            },
            {
              icon: <Award className="h-8 w-8" />,
              value: "24/7",
              label: "Support",
              color: "from-yellow-400 to-yellow-600",
            },
            {
              icon: <Globe className="h-8 w-8" />,
              value: "30+",
              label: "Languages supported",
              color: "from-purple-400 to-purple-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl shadow-lg bg-gradient-to-br ${stat.color} text-white flex flex-col items-center py-8 px-4 transition-transform duration-300 hover:scale-105 animate-in fade-in`}
            >
              <div className="mb-2 bg-white/20 rounded-full p-3 flex items-center justify-center animate-bounce">
                {stat.icon}
              </div>
              <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-base font-medium opacity-90">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Mission Card with Accent */}
        <section className=" mx-auto px-4 mb-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex justify-center">
            <Image
              src="/images/design.png"
              alt="Mission"
              width={320}
              height={320}
            />
          </div>
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-10 animate-in slide-in-from-right">
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg">
              Helping people reach career heights and expand their ambitions
              through expertly-crafted resumes and cover letters.
            </p>
          </div>
        </section>

        {/* Resume Writing Philosophy */}
        <section className=" mx-auto px-4 mb-20">
          <h2 className="font-heading text-2xl font-bold text-primary mb-4">
            Resume writing is an art and a science
          </h2>
          <p className="text-gray-700 mb-8 max-w-3xl">
            Resume writing is both art and science: it should show the person, not
            just the position. We combine technology, creativity, and expert
            advice to help you present your best self. Our platform is designed to
            make resume building easy, effective, and enjoyable.
          </p>
          {/* Office/Workspace Carousel */}
          <div className="">
            <CardSlider>
              {[
                <Image
                  key="1"
                  src="/images/Rectangle 14.png"
                  alt="Office 1"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="2"
                  src="/images/Rectangle 15.png"
                  alt="Office 2"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="3"
                  src="/images/Rectangle 16.png"
                  alt="Office 3"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="4"
                  src="/images/Rectangle 17.png"
                  alt="Office 4"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="5"
                  src="/images/Rectangle 18.png"
                  alt="Office 5"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="6"
                  src="/images/Rectangle 19.png"
                  alt="Office 6"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-contain"
                />,
                <Image
                  key="7"
                  src="/images/Rectangle 20.png"
                  alt="Office 7"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-68 aspect-square object-cover"
                />,
              ]}
            </CardSlider>
          </div>
        </section>

        {/* SVG Section Divider */}
        {/* <div className="w-full">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            d="M0,48 C360,0 1080,80 1440,32 L1440,80 L0,80 Z"
            fill="#f1f5f9"
          />
        </svg>
      </div> */}

        {/* Timeline/History */}
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
              A History of Growth
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From a small vision to a global platform empowering millions of job
              seekers every single day.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative border-l-2 border-blue-100 dark:border-blue-900/50 ml-4 md:ml-auto md:border-l-0">
            {/* Center line for desktop */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent dark:via-blue-800"></div>

            {[
              {
                year: "2019",
                title: "The Beginning",
                text: "Platform launched, offering intuitive resume creation and premium design tools to early adopters.",
              },
              {
                year: "2020",
                title: "Expanding Horizons",
                text: "Added highly requested features including cover letters and an extensive library of professional templates.",
              },
              {
                year: "2022",
                title: "1 Million Milestone",
                text: "Reached 1 million users globally and introduced AI-powered content suggestions to streamline writing.",
              },
              {
                year: "2024",
                title: "Global Reach",
                text: "Became a worldwide platform, fully supporting over 30+ languages, localized formats, and ATS optimizations.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative mb-12 md:mb-20 flex flex-col md:flex-row items-center justify-between w-full group animate-in slide-in-from-bottom fade-in duration-500"
                style={{ animationFillMode: "both", animationDelay: `${i * 150}ms` }}
              >
                {/* Desktop layout: alternating left/right */}
                {i % 2 === 0 ? (
                  <>
                    {/* Empty left side */}
                    <div className="hidden md:block w-5/12 order-1"></div>
                    {/* Content on right */}
                    <div className="hidden md:block w-5/12 order-3 text-left pl-12">
                      <h3 className="text-3xl font-black text-primary-blue mb-2">
                        {item.year}
                      </h3>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Content on left */}
                    <div className="hidden md:block w-5/12 order-1 text-right pr-12">
                      <h3 className="text-3xl font-black text-primary-blue mb-2">
                        {item.year}
                      </h3>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                    {/* Empty right side */}
                    <div className="hidden md:block w-5/12 order-3"></div>
                  </>
                )}

                {/* Mobile layout */}
                <div className="md:hidden w-full pl-8 relative">
                  <h3 className="text-2xl font-black text-primary-blue mb-1">
                    {item.year}
                  </h3>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>

                {/* Timeline Node (Dot) */}
                <div className="absolute left-[-9px] md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-4 border-primary-blue z-10 group-hover:scale-150 group-hover:bg-primary-blue transition-all duration-300 shadow-md"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

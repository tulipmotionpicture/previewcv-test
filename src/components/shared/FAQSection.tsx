"use client";

import { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  variant?: "default" | "compact";
  className?: string;
}

export default function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know",
  faqs,
  variant = "default",
  className = "",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (variant === "compact") {
    return (
      <div className={`my-20 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((item, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 dark:text-white">
                {item.question}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`w-full max-w-7xl mx-auto px-4 lg:px-6 mb-12 lg:mb-16 ${className}`}
    >
      <div className="bg-[#FAF9FF] dark:bg-gray-800 rounded-[32px] p-6 lg:p-10 relative overflow-hidden border border-purple-50 dark:border-gray-700">
        {/* Background Noise & Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-0 lg:px-4 relative z-10">
          {/* Header */}
          <div className="mb-8 lg:mb-12 w-full">
            <h1 className="text-xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight text-left mb-2 lg:mb-4">
              {title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium text-left max-w-2xl">
              {subtitle}
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3 lg:space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`
                  group cursor-pointer transition-all duration-300 ease-in-out border border-zinc-200 dark:border-white/5
                  ${
                    openIndex === index
                      ? "bg-white dark:bg-zinc-900 p-5 lg:p-6 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20"
                      : "bg-white/50 dark:bg-zinc-900/30 py-3 lg:py-4 px-5 lg:px-6 hover:bg-white dark:hover:bg-zinc-800 rounded-xl hover:shadow-sm"
                  }
                `}
              >
                <div className="flex justify-between items-center gap-4">
                  <h3
                    className={`text-sm lg:text-lg font-medium transition-colors ${openIndex === index ? "text-zinc-900 dark:text-gray-100" : "text-zinc-800 dark:text-gray-300"}`}
                  >
                    {item.question}
                  </h3>

                  <div
                    className={`shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                  >
                    {openIndex === index ? (
                      <MinusCircle
                        className="w-5 h-5 text-emerald-600/70 dark:text-emerald-400"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <PlusCircle
                        className="w-5 h-5 text-zinc-400 dark:text-gray-500 group-hover:text-zinc-600 dark:group-hover:text-gray-300"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${openIndex === index ? "grid-rows-[1fr] opacity-100 mt-2 lg:mt-3" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-zinc-600 dark:text-gray-400 leading-relaxed text-xs lg:text-sm pr-4 lg:pr-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

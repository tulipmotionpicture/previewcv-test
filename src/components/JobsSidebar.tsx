"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { TopHiringPartner } from "@/types/api";

export default function JobsSidebar() {
  const [partners, setPartners] = useState<TopHiringPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const response = await api.getTopHiringPartners(6);
        setPartners(response.hiring_partners);
      } catch (error) {
        console.error("Failed to load top hiring partners:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPartners();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hiring Partners Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 ">
        <div className="bg-blue-600 px-6 py-2 flex items-center justify-between">
          <h2 className="text-md font-bold text-white">
            Top Hiring Partners
          </h2>
          <svg className="w-5 h-5 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 animate-pulse"
                >
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={`/recruiter/${partner.username}`}
                  className="flex flex-col items-center bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition group h-full"
                >
                  {partner.company_logo_url ? (
                    <div className="relative h-8 w-16 mb-2 flex items-center justify-center">
                      <img
                        src={partner.company_logo_url}
                        alt={partner.company_name || "Company"}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {partner.company_name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {partner.company_name || "Unknown"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No hiring partners available
            </div>
          )}
        </div>
      </div>

      {/* Post a Job CTA */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border border-blue-100 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-lg text-blue-900 dark:text-blue-100">
          Post a Job
        </h3>
        <p className="text-sm text-blue-900 dark:text-blue-200 mb-4">
          Reach our pool of verified specialists directly. Zero agency
          commission.
        </p>
        <Link
          href="/recruiter/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

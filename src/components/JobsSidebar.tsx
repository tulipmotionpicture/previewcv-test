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
    <div className="flex flex-col gap-3">
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

      {/* Create Resume Card */}
      <Link href="/resume/build" className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-5 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div className="relative flex justify-between items-center z-10">
          <div>
            <h3 className="text-base font-bold text-blue-700 dark:text-blue-400 mb-0.5">Create Resume</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Build a new cv profile</p>
          </div>
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-none group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Create Cover Letter Card */}
      <Link href="/cover-letter/create" className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-5 border border-purple-100 dark:border-purple-900/30 hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div className="relative flex justify-between items-center z-10">
          <div>
            <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-0.5">Create Cover letter</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI-assisted drafting</p>
          </div>
          <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-purple-200 dark:shadow-none group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}

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
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Top Hiring Partners
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : partners.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {partners.map((partner) => (
              <Link
                key={partner.id}
                href={`/recruiter/${partner.username}`}
                className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition group"
              >
                {partner.company_logo_url ? (
                  <div className="relative h-10 w-10 mb-2">
                    <Image
                      src={partner.company_logo_url}
                      alt={partner.company_name || "Company"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {partner.company_name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {partner.company_name || "Unknown Company"}
                </span>
                {partner.active_jobs_count > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                    {partner.active_jobs_count}{" "}
                    {partner.active_jobs_count === 1 ? "job" : "jobs"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No hiring partners available
          </div>
        )}
      </div>
      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-2xl p-6 text-center flex flex-col items-center border border-blue-200 dark:border-blue-800">
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

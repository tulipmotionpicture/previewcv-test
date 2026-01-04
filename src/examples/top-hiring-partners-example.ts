/**
 * Example usage of the Top Hiring Partners API
 * 
 * This demonstrates how to fetch and display top hiring partners
 * (recruiters with the most active jobs)
 */

import { api } from "@/lib/api";

// Example 1: Fetch top 10 hiring partners
async function fetchTopHiringPartners() {
  try {
    const response = await api.getTopHiringPartners(10);
    
    console.log(`Total hiring partners: ${response.total}`);
    console.log(`Showing ${response.hiring_partners.length} partners`);
    
    response.hiring_partners.forEach((partner, index) => {
      console.log(`${index + 1}. ${partner.company_name}`);
      console.log(`   Username: ${partner.username}`);
      console.log(`   Active Jobs: ${partner.active_jobs_count}`);
      console.log(`   Industry: ${partner.industry || 'N/A'}`);
      console.log(`   Logo: ${partner.company_logo_url || 'No logo'}`);
      console.log('---');
    });
    
    return response;
  } catch (error) {
    console.error('Failed to fetch top hiring partners:', error);
    throw error;
  }
}

// Example 2: Use in a React component
/*
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { TopHiringPartner } from "@/types/api";

export default function TopHiringPartnersSection() {
  const [partners, setPartners] = useState<TopHiringPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const response = await api.getTopHiringPartners(6);
        setPartners(response.hiring_partners);
      } catch (error) {
        console.error('Failed to load partners:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPartners();
  }, []);

  if (loading) {
    return <div>Loading top hiring partners...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map((partner) => (
        <a
          key={partner.id}
          href={`/recruiter/${partner.username}`}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
        >
          {partner.company_logo_url && (
            <img
              src={partner.company_logo_url}
              alt={partner.company_name}
              className="w-16 h-16 object-contain mb-4"
            />
          )}
          <h3 className="font-bold text-lg mb-2">{partner.company_name}</h3>
          {partner.industry && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {partner.industry}
            </p>
          )}
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {partner.active_jobs_count} active {partner.active_jobs_count === 1 ? 'job' : 'jobs'}
          </p>
        </a>
      ))}
    </div>
  );
}
*/

export { fetchTopHiringPartners };

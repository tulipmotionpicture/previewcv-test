"use client";
import { useEffect, useState } from "react";
import JobsLayout from "@/components/JobsLayout";
import JobsFilters from "@/components/JobsFilters";
import JobList from "@/components/JobList";
import JobsSidebar from "@/components/JobsSidebar";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import { Job } from "@/types/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Store selected filters as a dynamic object
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  // State for search bar
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  // Helper to build params from selectedFilters
  function buildJobFilterParams(selected: Record<string, string[]>) {
    const params = new URLSearchParams();
    Object.entries(selected).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        params.append(key, values.join(","));
      }
    });
    params.append("limit", "20");
    return params;
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const params = buildJobFilterParams(selectedFilters);
        const response = await api.getJobs(params);
        setJobs(response.items || response.jobs || []);
      } catch {
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedFilters]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
      />
      <div className="pt-24">
        {/* Horizontal Search Bar */}
       <div className="w-full flex justify-center mb-4 px-4">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      setSelectedFilters((prev) => ({
        ...prev,
        keyword: keyword ? [keyword] : [],
        location: location ? [location] : [],
      }));
    }}
    className="w-full max-w-7xl bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-800 rounded-lg"
  >
    <div className="flex flex-col md:flex-row items-stretch">

      {/* Keyword */}
      <div className="flex-1 p-1 pl-4">
        <label
          htmlFor="job-keywords"
          className="block text-[11px] font-semibold"
        >
          KEYWORDS
        </label>
        <input
          id="job-keywords"
          type="text"
          placeholder="Job title, skills, company"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-transparent outline-none 
                     text-gray-800 dark:text-gray-100 
                     placeholder-gray-400 font-medium text-sm"
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800" />

      {/* Location */}
      <div className="flex-1 p-1">
        <label
          htmlFor="job-location"
          className="block text-[11px] font-semibold"
        >
          LOCATION
        </label>
        <input
          id="job-location"
          type="text"
          placeholder="City, state or remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent outline-none 
                     text-gray-800 dark:text-gray-100 
                     placeholder-gray-400 font-medium text-sm"
        />
      </div>

      {/* Button */}
      <div className="p-1 flex items-center">
        <button
          type="submit"
          className="w-full md:w-auto px-8 h-10
                     bg-blue-600 hover:bg-blue-700 
                     text-white font-medium text-xs
                     rounded-xl shadow-md transition-all
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Search Jobs
        </button>
      </div>
    </div>
  </form>
</div>

        <JobsLayout
          filters={
            <JobsFilters
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
          }
          jobs={<JobList jobs={jobs} loading={loading} error={error} />}
          sidebar={<JobsSidebar />}
        />
      </div>
    </div>
  );
}

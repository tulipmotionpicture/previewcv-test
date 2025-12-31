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
        <div className="w-full flex justify-center mb-8">
          <form
            className="w-full max-w-7xl flex bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-3 gap-2 md:gap-4 items-center border border-gray-100 dark:border-gray-800"
            style={{ boxShadow: "0 4px 24px 0 rgba(30, 41, 59, 0.10)" }}
            onSubmit={(e) => {
              e.preventDefault();
              setSelectedFilters((prev) => ({
                ...prev,
                keyword: keyword ? [keyword] : [],
                location: location ? [location] : [],
              }));
            }}
          >
            <div className="flex-1 flex flex-col">
              <label
                className="text-xs font-bold text-gray-400 tracking-widest mb-1 "
                htmlFor="job-keywords"
              >
                KEYWORDS
              </label>
              <input
                id="job-keywords"
                type="text"
                placeholder="Role, Company..."
                className="bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 text-base font-semibold"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="flex-1 flex flex-col border-l border-gray-100 dark:border-gray-800 pl-2">
              <label
                className="text-xs font-bold text-gray-400 tracking-widest mb-1 "
                htmlFor="job-location"
              >
                LOCATION
              </label>
              <input
                id="job-location"
                type="text"
                placeholder="City or Remote"
                className="bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 text-base font-semibold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="md:h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all text-base md:text-sm tracking-widest ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ boxShadow: "0 0 16px 2px #2563eb33" }}
            >
              SEARCH JOBS
            </button>
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

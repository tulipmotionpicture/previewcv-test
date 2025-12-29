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

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: "20" });
        const response = await api.getJobs(params);
        setJobs(response.items || response.jobs || []);
      } catch {
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
        <JobsLayout
          filters={<JobsFilters />}
          jobs={<JobList jobs={jobs} loading={loading} error={error} />}
          sidebar={<JobsSidebar />}
        />
      </div>
    </div>
  );
}

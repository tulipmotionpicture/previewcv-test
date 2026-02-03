"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Briefcase,
  Building2,
  ExternalLink,
  FileText,
  MapPin,
  DollarSign,
  Users,
  Eye,
  MessageSquare,
  X,
} from "lucide-react";
import { Application } from "@/types/api";

interface ApplicationsListProps {
  applications: Application[];
  loading: boolean;
}

export default function ApplicationsList({
  applications,
  loading,
}: ApplicationsListProps) {
  const [selectedMessage, setSelectedMessage] = useState<{
    message: string;
    jobTitle: string;
    companyName: string;
    sentAt: string | null;
  } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0369A1] border-t-transparent"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100 mb-2">
          No applications yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start applying to jobs to see your applications here
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <Briefcase className="w-5 h-5" />
          Browse Jobs
        </Link>
      </div>
    );
  }

  // Status color mapping - Flat design colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-[#0EA5E9] text-white";
      case "reviewing":
      case "in_review":
      case "under_review":
        return "bg-[#F59E0B] text-white";
      case "interview":
      case "interview_scheduled":
        return "bg-[#8B5CF6] text-white";
      case "accepted":
      case "hired":
      case "offered":
        return "bg-[#22C55E] text-white";
      case "rejected":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="group bg-white dark:bg-gray-900 rounded-lg border border-teal-600 dark:border-gray-800 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] transition-all duration-150 overflow-hidden cursor-pointer"
        >
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - Avatar and Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Company Avatar - Flat Design */}
                <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {app.company_logo_url ? (
                    <Image
                      src={app.company_logo_url}
                      alt={app.company_name || "Company"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    app.company_name?.charAt(0).toUpperCase() ||
                    app.job?.company_name?.charAt(0).toUpperCase() ||
                    "C"
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150">
                    {app.job_title || app.job?.title || `Job #${app.job_id}`}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">
                      {app.company_name || app.job?.company_name || "Company"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {app.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{app.location}</span>
                      </div>
                    )}
                    {(app.salary_min || app.salary_max) && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>
                          {app.salary_min && app.salary_max
                            ? `${app.salary_currency || "$"}${app.salary_min.toLocaleString()} - ${app.salary_currency || "$"}${app.salary_max.toLocaleString()}`
                            : app.salary_min
                              ? `From ${app.salary_currency || "$"}${app.salary_min.toLocaleString()}`
                              : `Up to ${app.salary_currency || "$"}${app.salary_max?.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                    {app.total_applicants && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{app.total_applicants} applicants</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Applied{" "}
                      {new Date(app.applied_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {app.updated_at && app.updated_at !== app.applied_at && (
                      <span className="ml-2">
                        • Updated{" "}
                        {new Date(app.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  {app.recruiter_viewed && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Viewed by recruiter</span>
                      {app.recruiter_view_count &&
                        app.recruiter_view_count > 1 && (
                          <span>({app.recruiter_view_count} times)</span>
                        )}
                      {/* Recruiter Message Button */}
                      {app.recruiter_message && (
                        <button
                          onClick={() =>
                            setSelectedMessage({
                              message: app.recruiter_message!,
                              jobTitle: app.job_title || "Job Application",
                              companyName: app.company_name || "Company",
                              sentAt: app.recruiter_message_at || "",
                            })
                          }
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 rounded transition-colors duration-150"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Status and Action */}
              <div className="flex  items-end gap-2 flex-shrink-0">
                {/* Status Badge - Flat Design */}
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(app.status)}`}
                >
                  {app.status === "applied"
                    ? "Applied"
                    : app.status === "under_review"
                      ? "Under Review"
                      : app.status === "interview_scheduled"
                        ? "Interview Scheduled"
                        : app.status.replace("_", " ")}
                </span>

                {/* Action Buttons */}

                {/* View Job Link - Flat Design */}
                <Link
                  href={`/job/${app.job_slug}`}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded transition-colors duration-150"
                >
                  View Job
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Message from Recruiter
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Job Communication
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Job Info */}
              <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedMessage.jobTitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMessage.companyName}
                </p>
              </div>

              {/* Message Box */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Timestamp */}
              {selectedMessage.sentAt && (
                <p className="text-xs text-gray-500 text-right">
                  Sent on{" "}
                  {new Date(selectedMessage.sentAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

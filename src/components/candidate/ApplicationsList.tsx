"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  FileText,
  MapPin,
  DollarSign,
  Users,
  Eye,
  MessageSquare,
  X,
  Briefcase,
} from "lucide-react";
import { Application } from "@/types/api";
import JobCard from "./JobCard";

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
        <JobCard key={app.id} application={app} />
      ))}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 dark:border-gray-700">
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

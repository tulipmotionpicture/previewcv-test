import React from "react";
import {
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Eye,
} from "lucide-react";
import { Application } from "../../types/api";

interface JobCardProps {
  application: Application;
}

const JobCard: React.FC<JobCardProps> = ({ application }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "under_review":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "interview_scheduled":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "offered":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "withdrawn":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "declined":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatSalary = () => {
    if (application.salary_min && application.salary_max) {
      return `${application.salary_currency || "$"}${application.salary_min.toLocaleString()} - ${application.salary_currency || "$"}${application.salary_max.toLocaleString()}`;
    } else if (application.salary_min) {
      return `From ${application.salary_currency || "$"}${application.salary_min.toLocaleString()}`;
    } else if (application.salary_max) {
      return `Up to ${application.salary_currency || "$"}${application.salary_max.toLocaleString()}`;
    }
    return "Salary not specified";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:border-blue-300">
      <div className="flex gap-3">
        {/* Logo */}
        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-gray-800 bg-white p-0.5 flex items-center justify-center">
          {application.company_logo_url ? (
            <img
              src={application.company_logo_url}
              alt={application.company_name || "Company"}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-slate-50 dark:bg-gray-800 flex items-center justify-center rounded">
              <span className="text-sm font-bold text-slate-400">
                {(application.company_name || "C").charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Title & Actions */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-2">
              {application.job_title ||
                application.job?.title ||
                `Job #${application.job_id}`}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
                  application.status,
                )}`}
              >
                {formatStatus(application.status)}
              </span>

              <a
                href={`/jobs/${application.job_slug || application.job?.slug}`}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:underline whitespace-nowrap"
              >
                View Job <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Company & Type Row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">
              {application.company_name || application.job?.company_name}
            </span>
            <span className="text-slate-300 dark:text-gray-600">•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-[9px] font-bold uppercase tracking-wider border border-slate-200 dark:border-gray-700">
              {application.job_type?.replace("_", " ") || "Full Time"}
            </span>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] font-medium text-slate-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>{application.location || "Remote"}</span>
            </div>

            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-slate-400" />
              <span>{formatSalary()}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users size={12} className="text-slate-400" />
              <span>
                {application.total_applicants ||
                  application.job?.application_count ||
                  0}{" "}
                applicants
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-slate-400" />
              <span>Applied {formatDate(application.applied_at)}</span>
            </div>
          </div>

          {/* Footer Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
            {application.recruiter_viewed ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
                Viewed by recruiter
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-700" />
                Not viewed yet
              </div>
            )}

            <span className="text-slate-400 dark:text-gray-500 font-medium">
              Updated {formatDate(application.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

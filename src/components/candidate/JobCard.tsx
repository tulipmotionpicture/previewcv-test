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
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all">
      <div className="flex gap-4">
        {/* Logo */}
        <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center">
          {application.company_logo_url ? (
            <img
              src={application.company_logo_url}
              alt={application.company_name || "Company"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-500">
              {(application.company_name || "C").charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {application.job_title ||
                  application.job?.title ||
                  `Job #${application.job_id}`}
              </h3>

              <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500">
                <span className="font-medium">
                  {application.company_name || application.job?.company_name}
                </span>
                <span>•</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wide font-semibold">
                  {application.job_type?.replace("_", " ") || "Full Time"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(
                  application.status,
                )}`}
              >
                {formatStatus(application.status)}
              </span>

              <a
                href={`/job/${application.job_slug}`}
                className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline"
              >
                View Job <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{application.location || "Remote"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <DollarSign size={14} />
              <span>{formatSalary()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>
                {application.total_applicants ||
                  application.job?.application_count ||
                  0}{" "}
                applicants
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Applied {formatDate(application.applied_at)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {application.recruiter_viewed ? (
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Viewed by recruiter
              </div>
            ) : (
              <span />
            )}

            <span className="text-slate-400">
              Updated {formatDate(application.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

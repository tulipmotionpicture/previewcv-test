import React, { useState } from "react";
import { Sparkles, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Job } from "../../types/jobs";
import Link from "next/link";

interface RelevantJobItemProps {
  job: Job;
}

const RelevantJobItem: React.FC<RelevantJobItemProps> = ({ job }) => {
  const [expanded, setExpanded] = useState(false);

  // Format posted date
  const getPostedAtText = () => {
    if (job.days_since_posted === undefined) return "Recently";
    if (job.days_since_posted === 0) return "Today";
    if (job.days_since_posted === 1) return "1 day ago";
    return `${job.days_since_posted} days ago`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100">
              <img
                src={job.company_logo_url || ""}
                alt={job.company_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
                  );
                }}
              />
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 ">
                <Sparkles size={16} />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 leading-tight">
                {job.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {job.company_name}
              </p>
            </div>
          </div>
          <Sparkles size={16} className="text-amber-400" />
        </div>

        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location || "Remote"}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {getPostedAtText()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                {job.job_type.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-xs">
                {Math.round(job.relevance_score || 0)}% match
              </span>
              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.round(job.relevance_score || 0)}%` }}
                />
              </div>
              {expanded ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 bg-slate-50/50 space-y-3 pt-3 animate-in fade-in slide-in-from-top-2">
          {job.why_recommended && job.why_recommended.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Key Reasons
              </p>
              {job.why_recommended.slice(0, 2).map((reason, index) => (
                <div
                  key={index}
                  className="flex gap-2 text-xs text-slate-600 leading-relaxed"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p>{reason}</p>
                </div>
              ))}
            </div>
          )}

          {job.required_skills && job.required_skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {job.required_skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] px-2 py-0.5 rounded-full border bg-white border-slate-200 text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/job/${job.slug}`}
            className="block w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm text-center"
          >
            View Details
          </Link>
        </div>
      )}
    </div>
  );
};

export default RelevantJobItem;

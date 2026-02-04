import React from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  Target,
  Award,
  MapPin,
  Briefcase,
  User,
} from "lucide-react";
import { Job } from "../../types/jobs";

interface MatchAnalysisProps {
  job: Job;
  matchingCriteria?: {
    total_skills: number;
    skills: string[];
    years_experience: number;
    experience_level: string;
    preferred_locations: string[];
    job_types: string[];
    categories: string[];
    salary_range: {
      min: number;
      max: number;
      currency: string;
    } | null;
  };
  onClose?: () => void;
}

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ job, onClose }) => {
  const { reasoning } = job;

  const MetricItem = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: number;
    icon: any;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
        <div className="flex items-center gap-1">
          <Icon size={14} className="text-slate-400" />
          <span>{label}</span>
        </div>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Target size={18} />
          </div>
          <h3 className="font-bold text-slate-800">Why You Match</h3>
        </div>
        <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-blue-100 shadow-sm">
          <span className="text-blue-700 font-bold text-sm">
            {job.matchScore}% Match Score
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MetricItem
            label="Skills Alignment"
            value={reasoning?.skillsMatch || 0}
            icon={Award}
          />
          <MetricItem
            label="Experience Match"
            value={reasoning?.experienceMatch || 0}
            icon={Target}
          />
          <MetricItem
            label="Salary Expectations"
            value={reasoning?.salaryMatch || 0}
            icon={Zap}
          />
          <MetricItem
            label="Location Fit"
            value={reasoning?.locationMatch || 0}
            icon={MapPin}
          />
        </div>

        {/* AI Highlights */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            AI Insights
          </h4>
          <div className="space-y-2">
            {reasoning?.keyHighlights?.map((highlight, idx) => (
              <div
                key={idx}
                className="flex gap-2 p-2 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-100"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <p className="text-xs">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs">
              Skills Comparison
            </h4>
            <span className="text-[9px] text-slate-400">
              Based on your Resume
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reasoning?.skillsBreakdown
              ?.filter((skill) => skill.importance === "Required")
              .map((skill, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    skill.matched
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-slate-50 text-slate-500 border-slate-200 opacity-70"
                  }`}
                >
                  {skill.matched ? (
                    <CheckCircle2 size={12} className="text-blue-500" />
                  ) : (
                    <XCircle size={12} className="text-slate-400" />
                  )}
                  {skill.name}
                  <span className="text-[10px] opacity-60 ml-1 font-bold">
                    (Required)
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Actionable Advice */}
        {reasoning?.missingSkills && reasoning.missingSkills.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
              <Zap size={14} /> Recommendation to Boost Odds
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Adding{" "}
              <span className="font-semibold">
                {reasoning.missingSkills.join(", ")}
              </span>{" "}
              to your profile would increase your match score to ~92%.
            </p>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
          >
            Apply Now{" "}
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchAnalysis;

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Award,
  MapPin,
  Briefcase,
  User,
  Sparkles,
  AlertCircle,
  DollarSign,
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper for Circular Progress
  const CircularProgress = ({
    score,
    size = 80,
    strokeWidth = 5,
  }: {
    score: number;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    // Color logic based on score
    let colorClass = "text-blue-500";
    if (score >= 80) colorClass = "text-emerald-500";
    else if (score >= 60) colorClass = "text-blue-500";
    else if (score >= 40) colorClass = "text-amber-500";
    else colorClass = "text-red-500";

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-gray-100 dark:text-gray-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-xl font-bold ${colorClass}`}>{score}%</span>
          <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">Match</span>
        </div>
      </div>
    );
  };

  const MetricItem = ({
    label,
    value,
    icon: Icon,
    color = "blue"
  }: {
    label: string;
    value: number;
    icon: any;
    color?: "blue" | "emerald" | "purple" | "amber";
  }) => {
    const colorStyles = {
      blue: "bg-blue-500",
      emerald: "bg-emerald-500",
      purple: "bg-purple-500",
      amber: "bg-amber-500",
    };
    const textStyles = {
      blue: "text-blue-600 dark:text-blue-400",
      emerald: "text-emerald-600 dark:text-emerald-400",
      purple: "text-purple-600 dark:text-purple-400",
      amber: "text-amber-600 dark:text-amber-400",
    }

    return (
      <div className="flex flex-col p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={12} className={`opacity-70 ${textStyles[color]}`} />
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{label}</span>
        </div>
        <div className="flex items-end gap-1.5 mt-auto">
          <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colorStyles[color]}`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 w-6 text-right">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-1.5 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Match Analysis</h3>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">Based on your profile & resume</p>
          </div>
        </div>
        <button
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className={`relative transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[2000px]" : "max-h-[120px] overflow-hidden"}`}>
        <div className="p-3 space-y-3">
          {/* Top Section: Score & Metrics */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Left: Score */}
            <div className="flex-shrink-0">
              <CircularProgress score={job.matchScore || 0} />
            </div>

            {/* Right: Metrics Grid */}
            <div className="flex-1 w-full grid grid-cols-2 gap-2">
              <MetricItem
                label="Skills"
                value={reasoning?.skillsMatch || 0}
                icon={Award}
                color="blue"
              />
              <MetricItem
                label="Experience"
                value={reasoning?.experienceMatch || 0}
                icon={Briefcase}
                color="purple"
              />
              <MetricItem
                label="Location"
                value={reasoning?.locationMatch || 0}
                icon={MapPin}
                color="emerald"
              />
              <MetricItem
                label="Salary"
                value={reasoning?.salaryMatch || 0}
                icon={DollarSign}
                color="amber"
              />
            </div>
          </div>

          {/* Missing Skills Alert - High Priority */}
          {reasoning?.missingSkills && reasoning.missingSkills.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-900/20">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-800 dark:text-red-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Missing Critical Skills
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {reasoning.missingSkills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-300 text-[10px] rounded font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-red-700/80 dark:text-red-400/80 flex items-center gap-1">
                <Zap size={10} className="fill-current" />
                Tip: Adding these skills could boost your match score.
              </p>
            </div>
          )}

          {/* Why You Match Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Why you fit this role
              </h4>
            </div>

            {/* Highlights List */}
            <ul className="grid grid-cols-1 gap-1.5">
              {reasoning?.keyHighlights?.map((highlight, idx) => (
                <li key={idx} className="flex gap-2 text-[11px] text-slate-600 dark:text-gray-400 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Matched Skills Cloud */}
            <div className="pt-1">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1.5">Matching Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {reasoning?.skillsBreakdown
                  ?.filter((skill) => skill.matched)
                  .slice(0, 10) // Limit display to keep it clean
                  .map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    >
                      <CheckCircle2 size={9} className="text-emerald-500" />
                      {skill.name}
                    </div>
                  ))}
                {(reasoning?.skillsBreakdown?.filter(s => s.matched).length || 0) > 10 && (
                  <span className="px-1.5 py-0.5 text-[10px] text-gray-500">+ {(reasoning?.skillsBreakdown?.filter(s => s.matched).length || 0) - 10} more</span>
                )}
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-slate-800 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group"
            >
              Apply Now{" "}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </div>

        {/* Blur Overlay when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 pointer-events-none flex items-end justify-center pb-2">
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors border-t border-slate-100 dark:border-gray-800"
      >
        {isExpanded ? (
          <>Show Less <ChevronUp size={12} /></>
        ) : (
          <>View Full Analysis <ChevronDown size={12} /></>
        )}
      </button>
    </div>
  );
};

export default MatchAnalysis;

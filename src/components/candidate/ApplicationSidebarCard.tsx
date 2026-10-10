import React from "react";
import { useLogoFallback } from "@/hooks/useLogoFallback";
import { Application } from "@/types/api";
import { CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/lib/postedDate";
import { matchTierMeta } from "./matchTier";

interface ApplicationSidebarCardProps {
    application: Application;
    isSelected: boolean;
    onClick: () => void;
}

const ApplicationSidebarCard: React.FC<ApplicationSidebarCardProps> = ({
    application,
    isSelected,
    onClick,
}) => {
    const { logoUrl, imgRef, onLogoError } = useLogoFallback(application.company_logo_url);

    // Resume match, scored the same way as the recruiter's ATS. Replaces a star rating
    // and review count that were made up from the job id.
    const match = application.match;

    // Status Badge Logic
    const getStatusBadge = () => {
        const baseClasses = "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border";

        // Priority: Recruiter Action -> Status
        if (application.recruiter_viewed && !["rejected", "declined", "withdrawn"].includes(application.status)) {
            return (
                <div className={`${baseClasses} bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300`}>
                    <CheckCircle2 size={10} /> Viewed
                </div>
            );
        }

        switch (application.status) {
            case "applied":
                return (
                    <div className={`${baseClasses} bg-blue-50 text-primary-blue border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300`}>
                        <Clock size={10} /> Applied
                    </div>
                );
            case "under_review":
                return (
                    <div className={`${baseClasses} bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300`}>
                        <Clock size={10} /> In Review
                    </div>
                );
            case "interview_scheduled":
                return (
                    <div className={`${baseClasses} bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300`}>
                        <Users size={10} /> Interview
                    </div>
                );
            case "offered":
            case "accepted":
                return (
                    <div className={`${baseClasses} bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300`}>
                        <CheckCircle2 size={10} /> {application.status}
                    </div>
                );
            case "rejected":
            case "declined":
            case "withdrawn":
                return (
                    <div className={`${baseClasses} bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300`}>
                        <AlertCircle size={10} /> {application.status}
                    </div>
                );
            default:
                return (
                    <div className={`${baseClasses} bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400`}>
                        <Clock size={10} /> {(application.status as string).replace(/_/g, " ")}
                    </div>
                );
        }
    };

    return (
        <div
            onClick={onClick}
            className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50 ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                }`}
        >
            {/* Header: Status & Date */}
            <div className="flex justify-between items-start mb-2">
                {getStatusBadge()}
                <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">
                    {/* API timestamps are UTC without a "Z"; new Date() read them as local time,
                        so in India every application looked 5h30m older than it was. */}
                    {(() => {
                        const updated = parseApiDate(application.updated_at);
                        return updated ? formatDistanceToNow(updated, { addSuffix: true }) : null;
                    })()}
                </span>
            </div>

            {/* Content: Logo & Details */}
            <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-white shrink-0 flex items-center justify-center">
                    {/* Seeded placeholder URLs never load, and a real URL can fail too —
                        either way show the initial instead of a broken-image icon. */}
                    {logoUrl ? (
                        <img
                            ref={imgRef}
                            src={logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={onLogoError}
                        />
                    ) : (
                        <span className="text-xs font-bold text-gray-400">
                            {(application.company_name || "C").charAt(0)}
                        </span>
                    )}
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate leading-snug mb-0.5">
                        {application.job_title || application.job?.title}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {application.company_name || application.job?.company_name}
                        </span>
                        {match &&
                            (match.insufficient_data ? (
                                <span className="text-[10px] text-gray-400">No match score</span>
                            ) : (
                                <span className={`text-[10px] font-semibold ${matchTierMeta(match).text}`}>
                                    {Math.round(match.score)}% match · {matchTierMeta(match).label}
                                </span>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationSidebarCard;

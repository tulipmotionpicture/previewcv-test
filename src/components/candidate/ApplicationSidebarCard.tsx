import React from "react";
import { Application } from "@/types/api";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    // Mock data for UI matching
    const rating = 3.5 + (application.job_id % 3) * 0.5; // Random-ish rating
    const reviewCount = 50 + (application.job_id % 100);

    // Status Badge Logic
    const getStatusBadge = () => {
        if (application.recruiter_viewed) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-full border border-emerald-100 dark:border-emerald-900/30 w-fit mt-2">
                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                        Resume viewed {application.recruiter_viewed_at ? formatDistanceToNow(new Date(application.recruiter_viewed_at), { addSuffix: true }) : "recently"}
                    </span>
                </div>
            );
        }

        if (application.status === "applied") {
            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-900/10 rounded-full border border-green-100 dark:border-green-900/30 w-fit mt-2">
                    <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-300">
                        Application sent {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 rounded-full border border-amber-100 dark:border-amber-900/30 w-fit mt-2">
                <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                    Status: {application.status.replace("_", " ")}
                </span>
            </div>
        );
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50 ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                }`}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {application.job_title || application.job?.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                            {application.company_name || application.job?.company_name}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-amber-500">★ {rating}</span>
                            <span className="text-[10px] text-gray-400">({reviewCount} Reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Company Logo */}
                <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 p-0.5 bg-white shrink-0 flex items-center justify-center">
                    {application.company_logo_url ? (
                        <img
                            src={application.company_logo_url}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <span className="text-xs font-bold text-gray-400">
                            {(application.company_name || "C").charAt(0)}
                        </span>
                    )}
                </div>
            </div>

            {getStatusBadge()}

            <div className="flex justify-end mt-2">
                <span className="text-[10px] text-gray-400">
                    Recruiter last active {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
};

export default ApplicationSidebarCard;

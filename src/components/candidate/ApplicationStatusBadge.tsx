import React from "react";
import { Application } from "@/types/api";
import { CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";

const EARLY_STATUSES: string[] = ["applied", "under_review", "pending"];

/** Coloured status pill for a candidate's application, shared by the list card and the
 *  detail view's "Application Status" header. */
const ApplicationStatusBadge: React.FC<{ application: Application }> = ({ application }) => {
    const baseClasses = "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border";

    // "Viewed" (the recruiter opened it) only replaces the early statuses. It used to
    // win over everything except a rejection, so an interview or offer still said
    // "Viewed" and the candidate couldn't tell what had happened.
    if (application.recruiter_viewed && EARLY_STATUSES.includes(application.status)) {
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
        case "shortlisted":
            return (
                <div className={`${baseClasses} bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300`}>
                    <CheckCircle2 size={10} /> Shortlisted
                </div>
            );
        case "interview_scheduled":
            return (
                <div className={`${baseClasses} bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300`}>
                    <Users size={10} /> Interview
                </div>
            );
        case "interviewed":
            return (
                <div className={`${baseClasses} bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300`}>
                    <Users size={10} /> Interviewed
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

export default ApplicationStatusBadge;

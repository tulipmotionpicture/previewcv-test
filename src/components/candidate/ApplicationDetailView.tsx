import React, { useState } from "react";
import { Application } from "@/types/api";
import { Job } from "@/types/jobs";
import {
    CheckCircle2,
    MapPin,
    Briefcase,
    Clock,
    Users,
    ExternalLink,
    ChevronRight,
    MessageSquare,
    FileText,
    User,
    Building2,
    Calendar,
    AlertCircle,
    XCircle,
    Eye
} from "lucide-react";
import { format } from "date-fns";
import RelevantJobItem from "./RelevantJobItem";
import Link from "next/link";

interface ApplicationDetailViewProps {
    application: Application;
    similarJobs?: Job[]; // Accepting similar jobs as prop
}

const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
    application,
    similarJobs = []
}) => {
    // Timeline Logic
    const steps = [
        {
            label: "Applied",
            date: application.applied_at,
            active: true
        },
        {
            label: "Viewed",
            date: application.recruiter_viewed_at,
            active: !!application.recruiter_viewed ||
                ["under_review", "interview_scheduled", "offered", "accepted", "rejected", "withdrawn", "declined"].includes(application.status)
        },
        {
            label: "Interview",
            date: application.interview?.scheduled_at || null,
            active: ["interview_scheduled", "offered", "accepted", "rejected", "declined"].includes(application.status)
        },
        {
            label: "Decision", // Offered, Accepted, Rejected, etc.
            date: application.updated_at,
            active: ["offered", "accepted", "rejected", "withdrawn", "declined"].includes(application.status),
            status: application.status
        }
    ];

    // Activity on this job
    const totalApplications = application.total_applicants || 0;
    const recruiterViewCount = application.recruiter_view_count || (application.recruiter_viewed ? 1 : 0);

    // Dynamic Theme Colors for Timeline
    // Dynamic Theme Colors for Timeline
    const getThemeColors = () => {
        if (["rejected", "declined", "withdrawn"].includes(application.status))
            return { bg: "bg-red-500", text: "text-red-500", border: "border-red-500", ring: "ring-red-500/20" };
        if (["offered", "accepted"].includes(application.status))
            return { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500", ring: "ring-emerald-500/20" };
        if (application.status === "interview_scheduled")
            return { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500", ring: "ring-indigo-500/20" };
        if (application.recruiter_viewed)
            return { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", ring: "ring-purple-500/20" };
        return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", ring: "ring-blue-500/20" };
    };
    const themeColors = getThemeColors();

    return (
        <div className="flex-1 h-full overflow-y-auto p-5 bg-white dark:bg-gray-900 scroll-smooth">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-1 pr-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                            {(application.job_type || application.job?.job_type || "Full Time").replace(/_/g, " ")}
                        </span>
                        {application.location && (
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <MapPin size={12} />
                                {application.location}
                            </span>
                        )}
                    </div>

                    <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                        {application.job_title || application.job?.title}
                    </h1>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {application.company_name || application.job?.company_name}
                        </span>
                        {application.job_id && (
                            <Link href={`/jobs/${application.job_slug || application.job?.slug}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-2">
                                View Job <ExternalLink size={10} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Company Logo - Right Side */}
                <div className="w-14 h-14 rounded-xl border border-gray-100 dark:border-gray-700 p-1.5 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                    {application.company_logo_url || application.job?.company_logo_url ? (
                        <img
                            src={application.company_logo_url || application.job?.company_logo_url || ""}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Building2 className="text-gray-300 w-10 h-10" />
                    )}
                </div>
            </div>

            {/* Application Status Timeline */}
            {/* Application Status Timeline */}
            <div className="mb-6 bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4 border border-slate-100 dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-6">Application Status</h3>
                <div className="relative flex items-center justify-between w-full px-2 md:px-6">
                    {/* Horizontal Line Background */}
                    <div className="absolute top-[10px] left-2 right-2 md:left-6 md:right-6 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />

                    {/* Progress Bar */}
                    <div
                        className={`absolute top-[10px] left-2 md:left-6 h-0.5 z-0 transition-all duration-500 ${themeColors.bg}`}
                        style={{
                            width: `calc(${((steps.filter(s => s.active).length - 1) / (steps.length - 1)) * 100}% - 24px)`
                        }}
                    />

                    {steps.map((step, idx) => {
                        const isRejected = step.status === "rejected" || step.status === "declined" || step.status === "withdrawn";
                        const isCompleted = step.active;
                        const isCurrent = steps.filter(s => s.active).length - 1 === idx;



                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center group">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-[2px] transition-all duration-300 bg-white dark:bg-gray-900 box-content ${isCompleted
                                    ? themeColors.border
                                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                                    } ${isCurrent ? `ring-2 ${themeColors.ring}` : ""}`}>

                                    {isCompleted ? (
                                        <div className={`w-2 h-2 rounded-full ${themeColors.bg}`} />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    )}
                                </div>
                                <div className="mt-2 text-center absolute -bottom-8 w-24 transform -translate-x-1/2 left-1/2">
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400"} whitespace-nowrap`}>
                                        {step.label}
                                    </p>
                                    {step.date && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-nowrap">
                                            {format(new Date(step.date), "MMM d")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="h-4"></div>
            </div>

            {/* Application Meta Grid */}
            {/* Application Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {/* Activity Stats - Clean Card */}
                <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <Users size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity Stats</h3>
                    </div>

                    <div className="flex items-center gap-8">
                        <div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white block tracking-tight">{totalApplications}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Applicants</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
                        <div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white block tracking-tight">{recruiterViewCount}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Views</span>
                        </div>
                    </div>
                </div>

                {/* Recruiter Message - Clean Card */}
                <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow relative overflow-hidden">
                    {application.recruiter_message ? (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                    <MessageSquare size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recruiter Message</h3>
                                <span className="ml-auto text-[10px] bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500 font-medium">
                                    {application.recruiter_message_at ? format(new Date(application.recruiter_message_at as string), "MMM d") : "New"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium relative z-10 pl-3 border-l-2 border-emerald-500/30">
                                {application.recruiter_message}
                            </p>

                            {application.job?.recruiter_profile_url && (
                                <div className="mt-4 pl-3">
                                    <a
                                        href={application.job.recruiter_profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm ring-1 ring-gray-900/5"
                                    >
                                        <User size={12} className="text-gray-500" />
                                        View Recruiter Profile
                                    </a>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center py-2">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <Building2 size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                No messages yet
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                                We'll notify you when the hiring team sends a message.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resume Info */}
            <div className="mb-2">
                <div className="flex flex-col gap-3">
                    {(application.resume || application.uploaded_resume) && (
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {application.resume?.name || application.uploaded_resume?.name || "Resume.pdf"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Submitted on {format(new Date(application.applied_at), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                            {(application.resume?.pdf_url || application.uploaded_resume?.pdf_url) && (
                                <a
                                    href={application.resume?.pdf_url || application.uploaded_resume?.pdf_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    View <Eye size={12} />
                                </a>
                            )}
                        </div>
                    )}

                    {application.cover_letter && (
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                                <FileText size={12} /> Cover Letter
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                                {application.cover_letter}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Jobs */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Similar Opportunities</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Other roles matching your profile</p>
                    </div>
                    {similarJobs.length > 0 && (
                        <Link href="/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            All Jobs <ChevronRight size={14} />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {similarJobs.length > 0 ? (
                        similarJobs.slice(0, 4).map(job => (
                            <RelevantJobItem key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="col-span-2 py-8 bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-center">
                            <Briefcase className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No similar jobs found</p>
                            <Link href="/jobs" className="mt-3 text-xs font-bold text-blue-600 hover:underline">
                                Browse all jobs
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ApplicationDetailView;

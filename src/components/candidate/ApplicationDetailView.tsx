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

    return (
        <div className="flex-1 h-full overflow-y-auto p-6 bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {application.job_title || application.job?.title || "Unknown Job Title"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-semibold">{application.company_name || application.job?.company_name || "Unknown Company"}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            {(application.location || application.job?.location) && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {application.location || application.job?.location}
                                </span>
                            )}
                            {(application.job_type || application.job?.job_type) && (
                                <>
                                    <span>•</span>
                                    <span className="capitalize">{(application.job_type || application.job?.job_type || "").replace(/_/g, " ")}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {application.job_slug ? (
                        <Link href={`/jobs/${application.job_slug}`} className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                            View full job description <ExternalLink size={10} />
                        </Link>
                    ) : application.job?.slug ? (
                        <Link href={`/jobs/${application.job.slug}`} className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                            View full job description <ExternalLink size={10} />
                        </Link>
                    ) : null}
                </div>

                <div className="w-16 h-16 border border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-white flex items-center justify-center shadow-sm">
                    {application.company_logo_url || application.job?.company_logo_url ? (
                        <img
                            src={application.company_logo_url || application.job?.company_logo_url || ""}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Building2 className="text-gray-300 w-8 h-8" />
                    )}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800 mb-8" />

            {/* Application Status Timeline */}
            <div className="mb-10 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-800/20">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-8 px-2">Application Timeline</h3>
                <div className="relative flex items-center justify-between w-full px-6 md:px-10">
                    {/* Horizontal Line Background */}
                    <div className="absolute top-[12px] left-6 right-6 md:left-10 md:right-10 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />

                    {/* Progress Bar (calculated dynamically) */}
                    <div
                        className="absolute top-[12px] left-6 md:left-10 h-0.5 bg-green-500 z-0 transition-all duration-500 rounded-full"
                        style={{
                            width: `calc(${((steps.filter(s => s.active).length - 1) / (steps.length - 1)) * 100}% - 40px)`
                        }}
                    />

                    {steps.map((step, idx) => {
                        const isRejected = step.status === "rejected" || step.status === "declined" || step.status === "withdrawn";
                        const isCompleted = step.active;

                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center group">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2.5px] transition-all duration-300 bg-white dark:bg-gray-900 ${isCompleted
                                    ? isRejected ? "border-red-500 text-red-500" : "border-green-500 text-green-500"
                                    : "border-gray-300 dark:border-gray-600 text-transparent"
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${isCompleted ? (isRejected ? "bg-red-500" : "bg-green-500") : "bg-transparent"}`} />
                                </div>
                                <div className="mt-4 text-center absolute -bottom-10 w-32 transform -translate-x-1/2 left-1/2">
                                    <p className={`text-xs font-bold ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-400"} whitespace-nowrap`}>
                                        {step.label}
                                    </p>
                                    {step.date && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
                                            {format(new Date(step.date), "dd MMM, yyyy")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="h-6"></div>
            </div>

            {/* Application Meta Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
                {/* Stats & Recruiter Combined */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Activity Stats */}
                    <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Users size={14} className="text-blue-500" />
                            Applicant Stats
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-2xl font-black text-gray-900 dark:text-white block">{totalApplications}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Applicants</span>
                            </div>
                            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800"></div>
                            <div>
                                <span className="text-2xl font-black text-gray-900 dark:text-white block">{recruiterViewCount}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Views</span>
                            </div>
                        </div>
                    </div>

                    {/* Recruiter / Message */}
                    {application.recruiter_message ? (
                        <div className="p-5 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <MessageSquare size={64} />
                            </div>
                            <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <MessageSquare size={14} />
                                Recruiter Message
                            </h3>
                            <p className="text-sm text-gray-800 dark:text-gray-200 italic mb-2 relative z-10 font-medium">
                                "{application.recruiter_message}"
                            </p>
                            {application.recruiter_message_at && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-2">
                                    {format(new Date(application.recruiter_message_at), "MMM d, h:mm a")}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {application.company_name || application.job?.company_name || "Hiring Team"}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Status: <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{application.status.replace(/_/g, " ")}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Resume Info */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Application Materials</h3>
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

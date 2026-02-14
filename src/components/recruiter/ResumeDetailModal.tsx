"use client";

import {
  X,
  Download,
  Unlock,
  Briefcase,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { CVUnlockResponse } from "@/types/api";
import { useEffect } from "react";

interface ResumeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: CVUnlockResponse | null;
  onDownloadPDF: () => Promise<void>;
  // Navigation props
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalCount?: number;
  isNavigating?: boolean;
  // Unlock props
  isLocked?: boolean;
  onUnlock?: () => Promise<void>;
  unlocking?: boolean;
  lockedResumeInfo?: {
    name?: string;
    resume_id?: number;
    created_at?: string;
    updated_at?: string;
  } | null;
}

export default function ResumeDetailModal({
  isOpen,
  onClose,
  resumeData,
  onDownloadPDF,
  onNavigateNext,
  onNavigatePrevious,
  hasNext = false,
  hasPrevious = false,
  currentIndex,
  totalCount,
  isNavigating = false,
  isLocked = false,
  onUnlock,
  unlocking = false,
  lockedResumeInfo = null,
}: ResumeDetailModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious && onNavigatePrevious) {
        onNavigatePrevious();
      } else if (e.key === "ArrowRight" && hasNext && onNavigateNext) {
        onNavigateNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNavigateNext, onNavigatePrevious, onClose]);

  if (!isOpen) return null;

  // Show locked state if resume is locked
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b bg-slate-900 rounded-t-xl flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Resume Locked
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Resume Info if available */}
            {lockedResumeInfo && (
              <div className="mb-6 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {lockedResumeInfo.name?.[0]?.toUpperCase() || "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {lockedResumeInfo.name || "Untitled Resume"}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Resume ID: {lockedResumeInfo.resume_id}
                    </p>
                  </div>
                  {(lockedResumeInfo.created_at || lockedResumeInfo.updated_at) && (
                    lockedResumeInfo.updated_at && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-500 block text-sm">Updated</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {new Date(lockedResumeInfo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )
                  )}
                </div>

              </div>
            )}

            {/* Lock Icon and Message */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                This Resume is Locked
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unlock this resume to view full details and download the PDF.
              </p>
              <button
                onClick={onUnlock}
                disabled={unlocking}
                className="px-6 py-3 rounded-lg text-sm font-semibold
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  text-white shadow-md transition
                  disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                {unlocking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Unlock Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation arrows for locked state */}
          {(hasPrevious || hasNext) && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={onNavigatePrevious}
                disabled={!hasPrevious || isNavigating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isNavigating && !hasPrevious ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                Previous
              </button>
              {currentIndex !== undefined && totalCount !== undefined && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
              <button
                onClick={onNavigateNext}
                disabled={!hasNext || isNavigating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                {isNavigating && !hasNext ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!resumeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b bg-slate-900 rounded-t-xl flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Resume Details - {resumeData.resume_name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">


          {/* Work Experience */}
          {resumeData.resume_data?.sections?.workExperience &&
            resumeData.resume_data.sections.workExperience.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  Work Experience
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.workExperience.map(
                    (exp: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {exp.position}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exp.is_current && "current"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exp.start_date} • {exp.end_date}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exp.company} • {exp.location}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Education */}
          {resumeData.resume_data?.sections?.education &&
            resumeData.resume_data.sections.education.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  Education
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.education.map(
                    (edu: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {edu.degree}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {edu.university} • {edu.field_of_study}
                        </p>
                        {edu.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {edu.location}
                          </p>
                        )}
                        {edu.start_year && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Start:- {edu.start_year} End :-{" "}
                            {edu.end_year ? edu.end_year : "Current "}
                          </p>
                        )}
                        {edu.gpa && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            GPA:- {edu.gpa}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Skills */}
          {resumeData.resume_data?.sections?.skills &&
            resumeData.resume_data.sections.skills.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.resume_data.sections.skills.map(
                    (skill: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {skill.skillName}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Languages */}
          {resumeData.resume_data?.sections?.languages &&
            resumeData.resume_data.sections.languages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Languages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumeData.resume_data.sections.languages.map(
                    (lang: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {lang.language}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {lang.proficiencyLevel}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Projects */}
          {resumeData.resume_data?.sections?.projects &&
            resumeData.resume_data.sections.projects.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Projects
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.projects.map(
                    (project: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {project.name}
                        </h5>
                        {project.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {project.description}
                          </p>
                        )}
                        {(project.projectUrl || project.githubUrl) && (
                          <div className="flex gap-4 mt-2 text-sm">
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {project.projectUrl}
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {project.githubUrl}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Certifications */}
          {resumeData.resume_data?.sections?.certifications &&
            resumeData.resume_data.sections.certifications.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Certifications
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.certifications.map(
                    (cert: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {cert.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cert.authority}
                        </p>
                        {cert.certificationDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(
                              cert.certificationDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {cert.certificationDescription && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {cert.certificationDescription}
                          </p>
                        )}
                        {cert.certificationUrl && (
                          <a
                            href={cert.certificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            {cert.certificationUrl}
                          </a>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Accomplishments */}
          {resumeData.resume_data?.sections?.accomplishments &&
            resumeData.resume_data.sections.accomplishments.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Accomplishments
                </h4>
                <div className="space-y-3">
                  {resumeData.resume_data.sections.accomplishments.map(
                    (acc: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <div className="flex justify-between">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {acc.title}
                          </h5>
                          {acc.date && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(acc.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {acc.category && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Category :- {acc.category}
                          </p>
                        )}
                        {acc.organization && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {acc.organization}
                          </p>
                        )}
                        {acc.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {acc.description}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Volunteering */}
          {resumeData.resume_data?.sections?.volunteering &&
            resumeData.resume_data.sections.volunteering.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Volunteering
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.volunteering.map(
                    (vol: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {vol.role}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vol.institutionName}
                        </p>
                        {vol.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {vol.description}
                          </p>
                        )}
                        {vol.city && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {vol.city}
                          </p>
                        )}
                        {vol.country && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {vol.country}
                          </p>
                        )}
                        {vol.startDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(vol.startDate).toLocaleDateString()}
                          </p>
                        )}
                        {vol.endDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(vol.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Internships */}
          {resumeData.resume_data?.sections?.internships &&
            resumeData.resume_data.sections.internships.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Internships
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.internships.map(
                    (intern: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {intern.role}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {intern.employerName}
                        </p>
                        {intern.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {intern.description}
                          </p>
                        )}
                        {intern.city && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {intern.city}
                          </p>
                        )}
                        {intern.country && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {intern.country}
                          </p>
                        )}
                        {intern.startDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(
                              intern.startDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {intern.endDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(intern.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Publications */}
          {resumeData.resume_data?.sections?.publications &&
            resumeData.resume_data.sections.publications.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Publications
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.publications.map(
                    (pub: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {pub.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pub.publisher}
                        </p>
                        {pub.publicationDescription && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {pub.publicationDescription}
                          </p>
                        )}
                        {pub.publicationUrl && (
                          <a
                            href={pub.publicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            {pub.publicationUrl}
                          </a>
                        )}
                        {pub.publicationDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(
                              pub.publicationDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* References */}
          {resumeData.resume_data?.sections?.references &&
            resumeData.resume_data.sections.references.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  References
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.references.map(
                    (ref: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {ref.employeeName}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ref.designation} at {ref.employer}
                        </p>
                        {ref.contactNumber && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {ref.contactNumber}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Social Media */}
          {resumeData.resume_data?.sections?.socialMedia &&
            resumeData.resume_data.sections.socialMedia.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Social Media
                </h4>
                <div className="flex flex-wrap gap-3">
                  {resumeData.resume_data.sections.socialMedia.map(
                    (social: any, idx: number) => (
                      <a
                        key={idx}
                        href={social.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {social.socialMediaName} :- {social.socialLink}
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Interests */}
          {resumeData.resume_data?.sections?.interests &&
            resumeData.resume_data.sections.interests.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.resume_data.sections.interests.map(
                    (interest: any, idx: number) => (
                      <div key={idx}>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                          {interest.interestName}
                        </span>
                        <p>{interest.category}</p>
                        <p>{interest.description}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Affiliations */}
          {resumeData.resume_data?.sections?.affiliations &&
            resumeData.resume_data.sections.affiliations.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Affiliations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.resume_data.sections.affiliations.map(
                    (aff: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                      >
                        {aff.organization}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Strengths */}
          {resumeData.resume_data?.sections?.strengths &&
            resumeData.resume_data.sections.strengths.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Strengths
                </h4>
                <div className="space-y-3">
                  {resumeData.resume_data.sections.strengths.map(
                    (strength: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"
                      >
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {strength.strengthName}
                        </h5>
                        {strength.strengthDescription && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {strength.strengthDescription}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          {/* Personal Info */}
          {resumeData.resume_data?.personalInfo && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {resumeData.resume_data.personalInfo.fullName && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.fullName}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo
                  .professionalTitle && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Professional Title
                      </span>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        {
                          resumeData.resume_data.personalInfo
                            .professionalTitle
                        }
                      </p>
                    </div>
                  )}
                {resumeData.resume_data.personalInfo.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.email}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.phone}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.dateOfBirth && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date of Birth
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {
                        resumeData.resume_data.personalInfo
                          .dateOfBirth
                      }
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.gender && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Gender
                    </span>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">
                      {resumeData.resume_data.personalInfo.gender}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.nationality && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nationality
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {
                        resumeData.resume_data.personalInfo
                          .nationality
                      }
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.country && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Country
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.country}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.state && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      State
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.state}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.city && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      City
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.city}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.address && (
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Address
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {resumeData.resume_data.personalInfo.address}
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo.streetNumber && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Street Number
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {
                        resumeData.resume_data.personalInfo
                          .streetNumber
                      }
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo
                  .postalZipCode && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Postal/ZIP Code
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {
                          resumeData.resume_data.personalInfo
                            .postalZipCode
                        }
                      </p>
                    </div>
                  )}
                {resumeData.resume_data.personalInfo.countryCode && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Country Code
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {
                        resumeData.resume_data.personalInfo
                          .countryCode
                      }
                    </p>
                  </div>
                )}
                {resumeData.resume_data.personalInfo
                  .profileDescription && (
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Profile Description
                      </span>
                      <p className="text-gray-900 dark:text-gray-100 text-sm">
                        {
                          resumeData.resume_data.personalInfo
                            .profileDescription
                        }
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
          {/* Summaries */}
          {resumeData.resume_data?.sections?.summaries &&
            resumeData.resume_data.sections.summaries.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Professional Summary
                </h4>
                <div className="space-y-3">
                  {resumeData.resume_data.sections.summaries.map(
                    (summary: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                      >
                        {summary.title && (
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {summary.title}
                          </h5>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {summary.content}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Custom Sections */}
          {resumeData.resume_data?.sections?.customSections &&
            resumeData.resume_data.sections.customSections.length >
            0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-4">
                  {resumeData.resume_data.sections.customSections.map(
                    (section: any, idx: number) =>
                      section.isActive && (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                        >
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {section.sectionTitle}
                          </h5>
                          {section.content && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                              {section.content}
                            </p>
                          )}
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

          {/* Unlock Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Unlocked:</span>{" "}
              {new Date(resumeData.unlocked_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              <span className="font-semibold">Valid Until:</span>{" "}
              {new Date(resumeData.unlocked_until).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <div className="flex items-center justify-between gap-3">
            {/* Navigation arrows */}
            <div className="flex items-center gap-2">
              {(hasPrevious || hasNext) && (
                <>
                  <button
                    onClick={onNavigatePrevious}
                    disabled={!hasPrevious || isNavigating}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isNavigating && !hasPrevious ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                    Previous
                  </button>
                  {currentIndex !== undefined && totalCount !== undefined && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                      {currentIndex + 1} / {totalCount}
                    </span>
                  )}
                  <button
                    onClick={onNavigateNext}
                    disabled={!hasNext || isNavigating}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    {isNavigating && !hasNext ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onDownloadPDF}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

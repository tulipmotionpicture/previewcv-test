"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ResumeMetadata } from "@/lib/api";
import { Job, PdfResume, Resume } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import ResumeUpload from "@/components/ResumeUpload";
import { useEffect } from "react";
import BookmarkButton from "@/components/BookmarkButton";
import ResumeReview from "@/components/ResumeReview";

interface JobDetailsClientProps {
  job: Job;
  slug: string;
}

export default function JobDetailsClient({ job, slug }: JobDetailsClientProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(job.is_bookmarked || false);
  const [isApplied, setIsApplied] = useState(job.is_applied || false);

  // Resume selection state
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [pdfResumes, setPdfResumes] = useState<PdfResume[]>([]);
  const [builderResumes, setBuilderResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [parsingResumeId, setParsingResumeId] = useState<number | null>(null);
  const [linkedEntities, setLinkedEntities] = useState<any>(null);
  const [showLinkedDataModal, setShowLinkedDataModal] = useState(false);

  // Fetch bookmark status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchJobStatus();
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchJobStatus = async () => {
    try {
      const response = await api.getJobBySlug(slug);
      if (response.job) {
        setIsBookmarked(response.job.is_bookmarked || false);
        setIsApplied(response.job.is_applied || false);
      }
    } catch (error) {
      console.error("Failed to fetch bookmark status:", error);
    }
  };

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const [pdfRes, builderRes] = await Promise.all([
        api.getPdfResumes().catch((err) => {
          console.error("Failed to fetch PDF resumes:", err);
          return { total: 0, resumes: [] };
        }),
        api.getResumes().catch((err) => {
          console.error("Failed to fetch Builder resumes:", err);
          return [];
        }),
      ]);

      // Normalize PDF resumes (can be array or { resumes: [] })
      if (Array.isArray(pdfRes)) {
        setPdfResumes(pdfRes);
      } else if (pdfRes && pdfRes.resumes) {
        setPdfResumes(pdfRes.resumes);
      } else {
        setPdfResumes([]);
      }

      // Normalize Builder resumes (usually array)
      setBuilderResumes(Array.isArray(builderRes) ? builderRes : []);

      // Try to pre-fill from local storage
      const storedResumeId = localStorage.getItem("last_uploaded_resume_id");
      if (storedResumeId) {
        const id = parseInt(storedResumeId, 10);
        const exists =
          (Array.isArray(pdfRes) ? pdfRes : (pdfRes.resumes || [])).some((r) => r.id === id) ||
          (Array.isArray(builderRes) ? builderRes : []).some((r) => r.id === id);
        if (exists) {
          setResumeId(id);
        }
      }
    } catch (error) {
      console.error("Critical error fetching resumes:", error);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/candidate/login?redirect=/jobs/${slug}`);
      return;
    }

    if (!resumeId) {
      alert("Please select or upload a resume before applying.");
      return;
    }

    setApplying(true);
    try {
      // Check if the selected resume is from LetsMakeCV or uploaded PDF
      const isBuilderResume = builderResumes.some(r => r.id === resumeId);
      const isPdfResume = pdfResumes.some(r => r.id === resumeId);

      // Prepare the application data based on resume type
      const applicationData: any = {
        cover_letter: coverLetter,
      };

      if (isBuilderResume) {
        // LetsMakeCV resume - use resume_id
        applicationData.resume_id = resumeId;
      } else if (isPdfResume) {
        // Uploaded PDF resume - use uploaded_resume_id
        applicationData.uploaded_resume_id = resumeId;
      }

      await api.applyToJob(job.id, applicationData);
      setApplySuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to apply");
      }
    } finally {
      setApplying(false);
    }
  };

  const handleResumeUploadSuccess = (id: number, metadata?: ResumeMetadata) => {
    setResumeId(id);
    localStorage.setItem("last_uploaded_resume_id", id.toString());

    // Log parsed metadata for debugging (can be used for auto-fill features later)
    if (metadata) {
      console.log("Parsed resume metadata:", metadata);
    }

    fetchResumes(); // Refresh list to include new upload
  };

  return (
    <>
      <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
              Apply for this Job
            </h3>
          </div>
          <BookmarkButton
            jobId={job.id}
            jobSlug={job.slug}
            isBookmarked={isBookmarked}
            onBookmarkChange={setIsBookmarked}
            size="md"
          />
        </div>

        {isApplied ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 p-8 rounded-2xl text-center border border-green-200 dark:border-green-800">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-bold text-lg mb-2">Already Applied</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              You have already applied for this job.
            </p>
          </div>
        ) : applySuccess ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 p-8 rounded-2xl text-center border border-green-200 dark:border-green-800">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-bold text-lg mb-2">Application Sent!</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              The recruiter will review your profile shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter{" "}
                <span className="text-gray-400 dark:text-gray-500 font-normal">
                  (Optional)
                </span>
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Tell them why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Resume <span className="text-red-500">*</span>
              </label>

              {loadingResumes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(pdfResumes.length > 0 || builderResumes.length > 0) && (
                    <div className="space-y-3">
                      <select
                        value={resumeId || ""}
                        onChange={(e) => setResumeId(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none text-sm text-gray-900 dark:text-gray-100 font-medium"
                      >
                        <option value="" disabled>
                          Select a resume
                        </option>
                        {pdfResumes.length > 0 && (
                          <optgroup label="Uploaded Resumes">
                            {pdfResumes.map((r) => (
                              <option key={`pdf-${r.id}`} value={r.id}>
                                {r.resume_name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {builderResumes.length > 0 && (
                          <optgroup label="LetsMakeCV Resumes">
                            {builderResumes.map((r) => (
                              <option key={`builder-${r.id}`} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  )}
                  {/* Upload New */}
                  {!resumeId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                        Or upload a new resume:
                      </p>
                      <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                    </div>
                  )}
                  {resumeId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg gap-3">
                        {/* Left Info */}
                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Resume selected
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setResumeId(null)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            Change
                          </button>
                          {(() => {
                            const selectedResume = pdfResumes.find(r => r.id === resumeId);
                            if (selectedResume?.permanent_link?.share_url) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => window.open(selectedResume.permanent_link!.share_url, '_blank')}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                                >
                                  View
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      {/* Parse Resume Button for Selected Resume */}
                      {pdfResumes.some(r => r.id === resumeId) && (
                        <div className="flex gap-3 items-center">

                          {/* Parse Resume */}
                          <button
                            type="button"
                            onClick={() => {
                              const selectedResume = pdfResumes.find(r => r.id === resumeId);
                              if (selectedResume) setParsingResumeId(resumeId);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md transition w-full border-1 border-purple-600 dark:border-purple-400"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Parse
                          </button>

                          {/* View Saved Data */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { api } = await import('@/lib/api');
                                const data = await api.getLinkedEntities(resumeId);
                                setLinkedEntities(data);
                                setShowLinkedDataModal(true);
                              } catch (err) {
                                console.error('Failed to fetch linked entities:', err);
                                alert('Failed to load saved data. Please try again.');
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition w-full"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Saved Data
                          </button>

                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isAuthenticated ? (
              <a
                href={`/candidate/login?redirect=/jobs/${slug}`}
                className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-center transform hover:-translate-y-0.5"
              >
                Login to Apply
              </a>
            ) : (
              <button
                type="submit"
                disabled={applying || !resumeId}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:transform-none flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                {applying ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </>
                )}
              </button>
            )}

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your PreviewCV profile and resume will be securely shared with{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {job.company_name}
              </span>
            </p>
          </form>
        )}

        {/* Linked Data Modal */}
        {showLinkedDataModal && linkedEntities && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-gray-900/90 backdrop-blur-md"
              onClick={() => setShowLinkedDataModal(false)}
            />
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-500 border border-white/20 dark:border-gray-800/50">
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">
                    Profile Data
                  </h2>
                </div>
                <button
                  onClick={() => setShowLinkedDataModal(false)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => {
                      // Close the view modal and trigger parsing to edit
                      setShowLinkedDataModal(false);
                      setParsingResumeId(linkedEntities.resume_id);
                    }}
                    className="flex items-center justify-end gap-2 "
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Data
                  </button>
                </div>
                <div className="space-y-8">
                  {linkedEntities.linked_entities?.work_experiences && linkedEntities.linked_entities.work_experiences.length > 0 && (
                    <section>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Experience ({linkedEntities.linked_entities.work_experiences.length})
                      </h3>
                      <div className="space-y-3">
                        {linkedEntities.linked_entities.work_experiences.map((exp: any, idx: number) => (
                          <div key={idx} className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <div className="font-bold text-gray-900 dark:text-gray-100">{exp.position}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">{exp.company}</div>
                            <div className="text-xs text-gray-500 mt-1">{exp.start_date} - {exp.end_date || 'Present'}</div>
                            {exp.city && <div className="text-xs text-gray-400 mt-1">{exp.city}{exp.country ? `, ${exp.country}` : ''}</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {linkedEntities.linked_entities?.education && linkedEntities.linked_entities.education.length > 0 && (
                    <section>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        Education ({linkedEntities.linked_entities.education.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {linkedEntities.linked_entities.education.map((edu: any, idx: number) => (
                          <div key={idx} className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{edu.degree}</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">{edu.university}</div>
                            <div className="text-xs text-gray-500 mt-1">{edu.start_year} - {edu.end_year || 'Present'}</div>
                            {edu.gpa && <div className="text-xs text-gray-400 mt-1">{edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {linkedEntities.linked_entities?.skills && linkedEntities.linked_entities.skills.length > 0 && (
                    <section>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                        Skills ({linkedEntities.linked_entities.skills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {linkedEntities.linked_entities.skills.map((skill: any, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                            {skill.skill_name} • {skill.proficiency_level}/10
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {linkedEntities.linked_entities?.languages && linkedEntities.linked_entities.languages.length > 0 && (
                    <section>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Languages ({linkedEntities.linked_entities.languages.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {linkedEntities.linked_entities.languages.map((lang: any, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 uppercase">
                            {lang.language_name} • {lang.proficiency_level}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Review Modal - Rendered outside sidebar */}
      {parsingResumeId && (
        <div className="fixed inset-0 z-[300] bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => setParsingResumeId(null)}
                className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-bold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Application
              </button>
              <ResumeReview
                resumeId={parsingResumeId}
                onSaveComplete={() => {
                  setParsingResumeId(null);
                  fetchResumes();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ResumeMetadata } from "@/lib/api";
import { Job, PdfResume, Resume } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import ResumeUpload from "@/components/ResumeUpload";
import BookmarkButton from "@/components/BookmarkButton";
import ResumeReview from "@/components/ResumeReview";
import { Check, Send, Plus, ExternalLink, Zap, Eye, X, Briefcase, GraduationCap, Wrench, Languages, Building2, MapPin, Calendar, LogIn } from "lucide-react";

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
        api.getPdfResumes().catch(() => ({ total: 0, resumes: [] })),
        api.getResumes().catch(() => []),
      ]);

      if (Array.isArray(pdfRes)) {
        setPdfResumes(pdfRes);
      } else if (pdfRes && pdfRes.resumes) {
        setPdfResumes(pdfRes.resumes);
      } else {
        setPdfResumes([]);
      }

      setBuilderResumes(Array.isArray(builderRes) ? builderRes : []);

      const storedResumeId = localStorage.getItem("last_uploaded_resume_id");
      if (storedResumeId) {
        const id = parseInt(storedResumeId, 10);
        const exists =
          (Array.isArray(pdfRes) ? pdfRes : pdfRes.resumes || []).some((r) => r.id === id) ||
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
      const isBuilderResume = builderResumes.some((r) => r.id === resumeId);
      const isPdfResume = pdfResumes.some((r) => r.id === resumeId);

      const applicationData: any = {
        cover_letter: coverLetter,
      };

      if (isBuilderResume) {
        applicationData.resume_id = resumeId;
      } else if (isPdfResume) {
        applicationData.uploaded_resume_id = resumeId;
      }

      await api.applyToJob(job.id, applicationData);
      setApplySuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (metadata) {
      console.log("Parsed resume metadata:", metadata);
    }
    fetchResumes();
  };

  return (
    <>
      {/* Sticky Application Card - Flat Design */}
      <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 transition-all duration-150">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0F9FF] dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-[#0EA5E9]/20">
              <Plus className="w-5 h-5 text-[#0369A1] dark:text-[#0EA5E9]" />
            </div>
            <h3 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100">
              Application
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
          <div className="bg-[#DCFCE7] dark:bg-green-900/20 text-[#166534] dark:text-green-400 p-8 rounded-lg text-center border border-[#BBF7D0] dark:border-green-800">
            <div className="w-16 h-16 bg-white dark:bg-green-800/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#BBF7D0] dark:border-green-700">
              <Check className="w-8 h-8 text-[#166534] dark:text-green-400" />
            </div>
            <p className="font-bold text-lg mb-2">Application Sent</p>
            <p className="text-sm opacity-80">
              You've already applied for this position.
            </p>
          </div>
        ) : applySuccess ? (
          <div className="bg-[#DCFCE7] dark:bg-green-900/20 text-[#166534] dark:text-green-400 p-8 rounded-lg text-center border border-[#BBF7D0] dark:border-green-800 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-white dark:bg-green-800/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#BBF7D0] dark:border-green-700">
              <Check className="w-8 h-8 text-[#166534] dark:text-green-400" />
            </div>
            <p className="font-bold text-lg mb-2">Awesome!</p>
            <p className="text-sm opacity-80">
              Your application has been received.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Cover Letter <span className="font-normal opacity-60">(Optional)</span>
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#0369A1] focus:border-[#0369A1] outline-none transition-all duration-150 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Tell the recruiter why you're a good fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Resume <span className="text-red-500">*</span>
              </label>

              {loadingResumes ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0369A1] border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(pdfResumes.length > 0 || builderResumes.length > 0) && (
                    <select
                      value={resumeId || ""}
                      onChange={(e) => setResumeId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm font-bold cursor-pointer transition-colors duration-150 focus:border-[#0369A1]"
                    >
                      <option value="" disabled>Select from your resumes</option>
                      {pdfResumes.length > 0 && (
                        <optgroup label="Uploaded PDF Resumes">
                          {pdfResumes.map((r) => (
                            <option key={`pdf-${r.id}`} value={r.id}>{r.resume_name}</option>
                          ))}
                        </optgroup>
                      )}
                      {builderResumes.length > 0 && (
                        <optgroup label="Resume Builder CVs">
                          {builderResumes.map((r) => (
                            <option key={`builder-${r.id}`} value={r.id}>{r.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  )}

                  {!resumeId && (
                    <div className="p-1">
                      <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                    </div>
                  )}

                  {resumeId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-[#F0F9FF] dark:bg-blue-900/20 border border-[#0EA5E9]/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#0369A1] dark:text-[#0EA5E9] font-bold">
                          <Check className="w-4 h-4" />
                          Resume Ready
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setResumeId(null)}
                            className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors duration-150 cursor-pointer"
                          >
                            Change
                          </button>
                          {(() => {
                            const res = pdfResumes.find(r => r.id === resumeId);
                            if (res?.permanent_link?.share_url) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => window.open(res.permanent_link!.share_url, "_blank")}
                                  className="text-xs font-bold text-[#0369A1] hover:text-[#0EA5E9] flex items-center gap-1 cursor-pointer"
                                >
                                  View <ExternalLink className="w-3 h-3" />
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {pdfResumes.some(r => r.id === resumeId) && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (pdfResumes.find(r => r.id === resumeId)) setParsingResumeId(resumeId);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            <Zap className="w-4 h-4" />
                            Revise with AI
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const data = await api.getLinkedEntities(resumeId);
                                setLinkedEntities(data);
                                setShowLinkedDataModal(true);
                              } catch (err) {
                                alert("Failed to load saved data.");
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border-2 border-[#8B5CF6] text-[#8B5CF6] dark:text-purple-400 text-xs font-bold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            Stored Info
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isAuthenticated ? (
              <button
                onClick={() => router.push(`/candidate/login?redirect=/job/${slug}`)}
                className="w-full py-4 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                Login to Apply
              </button>
            ) : (
              <button
                type="submit"
                disabled={applying || !resumeId}
                className="w-full py-4 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale cursor-pointer"
              >
                {applying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Submit Application
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            )}

            <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
              Shared securely with {job.company_name}
            </p>
          </form>
        )}
      </div>

      {/* Linked Data Modal - Flat Design */}
      {showLinkedDataModal && linkedEntities && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkedDataModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#F0F9FF] dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100">
                  Stored Profile Data
                </h2>
              </div>
              <button onClick={() => setShowLinkedDataModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150 cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => {
                    setShowLinkedDataModal(false);
                    setParsingResumeId(resumeId);
                  }}
                  className="flex items-center gap-2 text-[#0369A1] dark:text-[#0EA5E9] font-bold text-sm hover:underline cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  Edit with AI Refiner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Work Experience */}
                {linkedEntities.linked_entities?.work_experiences?.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                      <Briefcase className="w-4 h-4 text-[#0369A1]" />
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {linkedEntities.linked_entities.work_experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{exp.position}</div>
                          <div className="text-sm text-[#0369A1] dark:text-[#0EA5E9] font-bold">{exp.company}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exp.start_date} - {exp.end_date || "Present"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {linkedEntities.linked_entities?.education?.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-[#22C55E]" />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {linkedEntities.linked_entities.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{edu.degree}</div>
                          <div className="text-sm text-[#22C55E] dark:text-green-400 font-bold">{edu.university}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {edu.start_year} - {edu.end_year || "Present"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Skills and Languages */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {linkedEntities.linked_entities?.skills?.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                      <Wrench className="w-4 h-4 text-[#F59E0B]" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {linkedEntities.linked_entities.skills.map((skill: any, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-[#FFFBEB] dark:bg-amber-900/20 text-[#D97706] dark:text-amber-400 rounded-lg text-xs font-bold border border-[#FEF3C7] dark:border-amber-800">
                          {skill.skill_name} • {skill.proficiency_level}/10
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {linkedEntities.linked_entities?.languages?.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                      <Languages className="w-4 h-4 text-[#8B5CF6]" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {linkedEntities.linked_entities.languages.map((lang: any, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-[#F5F3FF] dark:bg-purple-900/20 text-[#7C3AED] dark:text-purple-400 rounded-lg text-xs font-bold border border-[#EDE9FE] dark:border-purple-800 uppercase">
                          {lang.language_name || lang.language} • {lang.proficiency_level}
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

      {/* AI Refiner Modal - Full View */}
      {parsingResumeId && (
        <div className="fixed inset-0 z-[200] bg-[#F0F9FF] dark:bg-gray-950 overflow-hidden flex flex-col animate-in fade-in duration-200">
          <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Resume Refiner</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Optimize your data for this application</p>
              </div>
            </div>
            <button onClick={() => setParsingResumeId(null)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 cursor-pointer bg-white dark:bg-gray-800">
              <X className="w-5 h-5" />
              Discard Changes
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <ResumeReview
                resumeId={parsingResumeId}
                onSaveComplete={() => {
                  setParsingResumeId(null);
                  fetchResumes();
                }}
                onClose={() => setParsingResumeId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

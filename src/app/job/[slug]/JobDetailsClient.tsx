"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ResumeMetadata } from "@/lib/api";
import { Job, PdfResume, Resume } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import ResumeUpload from "@/components/ResumeUpload";
import BookmarkButton from "@/components/BookmarkButton";
import ResumeReview from "@/components/ResumeReview";
import {
  Check,
  Send,
  Plus,
  ExternalLink,
  Zap,
  Eye,
  X,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Sparkles,
  UploadCloud,
  Calendar,
  LogIn,
  MapPin,
  Users
} from "lucide-react";

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

  // Similar jobs state
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);

  // Fetch bookmark status and similar jobs when authenticated or mounted
  useEffect(() => {
    if (isAuthenticated) {
      fetchJobStatus();
      fetchResumes();
    }
    fetchSimilarJobs();

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



  const fetchSimilarJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (job.categories && job.categories.length > 0) {
        params.append('category', job.categories[0]);
      }
      params.append('limit', '3');
      const response = await api.getJobs(params);
      if (response.data) {
        // Filter out current job
        setSimilarJobs(response.data.filter(j => j.id !== job.id).slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch similar jobs", error);
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
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <div className="space-y-8">
      {/* Sticky Application Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm sticky top-24  ">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Apply for this Job</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{job.company_name}</p>
            </div>
          </div>
          <BookmarkButton
            jobId={job.id}
            jobSlug={job.slug}
            isBookmarked={isBookmarked}
            onBookmarkChange={setIsBookmarked}
            size="sm"
          />
        </div>

        {isApplied ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg text-center border border-green-200 dark:border-green-800">
            <div className="w-10 h-10 bg-white dark:bg-green-800/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-200 dark:border-green-700">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-bold mb-1 text-sm">Application Sent</p>
            <p className="text-xs opacity-90">
              You've already applied for this position.
            </p>
          </div>
        ) : applySuccess ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg text-center border border-green-200 dark:border-green-800 animate-in fade-in zoom-in duration-200">
            <div className="w-10 h-10 bg-white dark:bg-green-800/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-200 dark:border-green-700">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-bold mb-1 text-sm">Success!</p>
            <p className="text-xs opacity-90">
              Your application has been received.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Cover Letter <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                placeholder="Tell us why you are perfect fit....."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Resume <span className="text-red-500">*</span>
              </label>

              {loadingResumes ? (
                <div className="flex items-center justify-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={resumeId || ""}
                    onChange={(e) => setResumeId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm font-medium cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select Resume</option>
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

                  {!resumeId && (
                    <div className="pt-1">
                      <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} variant="minimal" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (resumeId) setParsingResumeId(resumeId);
                  else alert("Please select a resume first");
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-purple-200 dark:shadow-none"
              >
                <Zap className="w-3.5 h-3.5" />
                AI Parse
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (resumeId) {
                    try {
                      const data = await api.getLinkedEntities(resumeId);
                      setLinkedEntities(data);
                      setShowLinkedDataModal(true);
                    } catch (err) {
                      alert("Failed to load saved data.");
                    }
                  } else {
                    alert("Please select a resume first");
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                View Data
              </button>
            </div>

            {!isAuthenticated ? (
              <button
                onClick={() => router.push(`/candidate/login?redirect=/job/${slug}`)}
                className="w-full py-3 bg-[#0077b5] hover:bg-[#006097] text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                Login to Apply
              </button>
            ) : (
              <button
                type="submit"
                disabled={applying || !resumeId}
                className="w-full py-3 bg-[#0077b5] hover:bg-[#006097] text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale text-sm"
              >
                {applying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Submit Application
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            )}
          </form>
        )}
      </div>

      {/* Similar Jobs Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Similar jobs</h3>
        <div className="space-y-3">
          {similarJobs.map(similarJob => (
            <div key={similarJob.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4">
                <BookmarkButton jobId={similarJob.id} jobSlug={similarJob.slug} isBookmarked={similarJob.is_bookmarked || false} onBookmarkChange={() => { }} size="sm" />
              </div>

              <div className="mb-2 pr-8">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors text-base line-clamp-1">
                  <Link href={`/job/${similarJob.slug}`}>{similarJob.title}</Link>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{similarJob.company_name}</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  {similarJob.experience_level ? `${similarJob.experience_level.replace("entry", "0-2").replace("mid", "2-5").replace("senior", "5+").replace("executive", "10+")} years` : 'Exp N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 font-normal mr-0.5">₹</span>
                    {similarJob.salary_min ? formatCurrency(similarJob.salary_min, similarJob.salary_currency || 'USD').replace(/[^0-9,]/g, '') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {similarJob.location}
                </div>
                {similarJob.is_remote && (
                  <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-[10px] uppercase font-bold">Remote</span>
                )}
                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] uppercase font-bold">
                  {similarJob.experience_level || 'Mid Level'}
                </span>
              </div>

              <div className="text-xs text-gray-500 font-medium mb-3 line-clamp-2">
                Build cloud-native applications with <span className="font-bold text-gray-900 italic">AWS</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {similarJob.required_skills?.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[10px] border border-blue-200 text-blue-600 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>Posted {new Date(similarJob.posted_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                <Link href={`/job/${similarJob.slug}`} className="px-4 py-1.5 bg-[#0077b5] text-white text-xs font-bold rounded-lg hover:bg-[#006097] transition-colors">
                  Apply
                </Link>
              </div>
            </div>
          ))}
          {similarJobs.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No similar jobs found at the moment.
            </div>
          )}
        </div>
      </div>
      {showLinkedDataModal && linkedEntities && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkedDataModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200">
            {/* ... Modal content similar to previous implementation ... */}
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
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px]">
                {JSON.stringify(linkedEntities, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AI Refiner Modal - reused from before */}
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
    </div>
  );
}

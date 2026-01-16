"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ResumeMetadata } from "@/lib/api";
import { Job, PdfResume, Resume } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import ResumeUpload from "@/components/ResumeUpload";
import { useEffect } from "react";
import BookmarkButton from "@/components/BookmarkButton";

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
      setPdfResumes(pdfRes.resumes || []);
      setBuilderResumes(builderRes || []);

      // Try to pre-fill from local storage
      const storedResumeId = localStorage.getItem("last_uploaded_resume_id");
      if (storedResumeId) {
        const id = parseInt(storedResumeId, 10);
        // Check if it exists in either list
        const exists =
          (pdfRes.resumes || []).some((r) => r.id === id) ||
          (builderRes || []).some((r) => r.id === id);
        if (exists) {
          setResumeId(id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
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
      await api.applyToJob(job.id, {
        resume_id: resumeId,
        cover_letter: coverLetter,
      });
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
        <form onSubmit={handleApply} className="space-y-6">
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
                {/* Resume Selection */}
                {(pdfResumes.length > 0 || builderResumes.length > 0) && (
                  <div className="space-y-3">
                    <select
                      value={resumeId || ""}
                      onChange={(e) => setResumeId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 outline-none text-sm text-gray-900 dark:text-gray-100 font-medium"
                    >
                      <option value="" disabled>
                        📄 Select a resume
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
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 font-medium">
                      <svg
                        className="w-4 h-4"
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
                      Resume selected
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeId(null)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold underline"
                    >
                      Change
                    </button>
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
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:transform-none flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
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
                  Submit Application
                </>
              )}
            </button>
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            🔒 Your PreviewCV profile and resume will be securely shared with{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {job.company_name}
            </span>
          </p>
        </form>
      )}
    </div>
  );
}

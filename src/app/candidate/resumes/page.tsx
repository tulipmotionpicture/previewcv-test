"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { PdfResume } from "@/types/api";
import Button from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Image from "next/image";

export default function ResumesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();

  const [resumes, setResumes] = useState<PdfResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareLinks, setShareLinks] = useState<
    Record<number, { link: string; qr: string }>
  >({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchResumes = async () => {
    try {
      setError(null);
      const data = await api.getPdfResumes();
      setResumes(data.resumes || []);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load resumes";
      setError(errorMsg);
      setResumes([]); // Set empty array on error
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGetShareLink = async (resumeId: number) => {
    try {
      const data = await api.getPdfResumeShareLink(resumeId);
      setShareLinks((prev) => ({
        ...prev,
        [resumeId]: { link: data.permanent_link, qr: data.qr_code_url },
      }));
      toast.success("Share link generated!");
    } catch {
      toast.error("Failed to generate share link");
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = async (resumeId: number) => {
    try {
      const data = await api.getPdfResumeDownloadUrl(resumeId);
      window.open(data.download_url, "_blank");
    } catch {
      toast.error("Failed to download resume");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      await api.deletePdfResume(deleteId);
      setResumes((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Resume deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to load resumes
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchResumes}>Try Again</Button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first resume to get started
            </p>
            <Button onClick={() => router.push("/candidate/dashboard")}>
              Upload Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                shareLink={shareLinks[resume.id]}
                onGetShareLink={() => handleGetShareLink(resume.id)}
                onCopyLink={handleCopyLink}
                onDownload={() => handleDownload(resume.id)}
                onDelete={() => setDeleteId(resume.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

interface ResumeCardProps {
  resume: PdfResume;
  shareLink?: { link: string; qr: string };
  onGetShareLink: () => void;
  onCopyLink: (link: string) => void;
  onDownload: () => void;
  onDelete: () => void;
}

function ResumeCard({
  resume,
  shareLink,
  onGetShareLink,
  onCopyLink,
  onDownload,
  onDelete,
}: ResumeCardProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
      {/* Resume Icon/Preview */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-4">
        <svg
          className="w-20 h-20 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Resume Info */}
      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
        {resume.resume_name}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Uploaded {new Date(resume.created_at).toLocaleDateString()}
      </p>

      {/* Share Link Section */}
      {shareLink && (
        <div className="mb-4 p-4 bg-blue-50 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase">
              Share Link
            </span>
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showQR ? "Hide QR" : "Show QR"}
            </button>
          </div>
          {showQR && shareLink.qr && (
            <div className="mb-3 flex justify-center">
              <Image
                src={shareLink.qr}
                alt="QR Code"
                width={150}
                height={150}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink.link}
              readOnly
              className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-mono border border-blue-200"
            />
            <button
              onClick={() => onCopyLink(shareLink.link)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {!shareLink ? (
          <Button size="sm" fullWidth onClick={onGetShareLink}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </Button>
        ) : (
          <Button size="sm" fullWidth variant="secondary" onClick={onDownload}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </Button>
        )}
        <Button size="sm" fullWidth variant="danger" onClick={onDelete}>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </Button>
      </div>
    </div>
  );
}

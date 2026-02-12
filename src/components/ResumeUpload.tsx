"use client";

import { useState } from "react";
import { useResumeParser } from "@/hooks/useResumeParser";
import ResumeParsingProgress from "./ResumeParsingProgress";
import ResumeReview from "./ResumeReview";
import { Upload, FileText, AlertCircle, Sparkles, X, Shield } from "lucide-react";
import { ResumeMetadata } from "@/lib/api";

type Step = "idle" | "parsing" | "review";

interface ResumeUploadProps {
  onUploadSuccess: (resumeId: number, metadata?: ResumeMetadata) => void;
  existingResumeId?: number;
  variant?: "default" | "minimal";
}

export default function ResumeUpload({ onUploadSuccess, existingResumeId, variant = "default" }: ResumeUploadProps) {
  const [step, setStep] = useState<Step>(existingResumeId ? "parsing" : "idle");
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(existingResumeId || null);
  const [isDragging, setIsDragging] = useState(false);

  const { uploadResume, uploading, error } = useResumeParser();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    try {
      const result = await uploadResume(file, file.name);
      if (result.success) {
        setCurrentResumeId(result.resume_id);
        setStep("parsing");
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleCancel = () => {
    setStep("idle");
    setCurrentResumeId(null);
  };

  const isMinimal = variant === "minimal";

  return (
    <div className="w-full">
      {/* Upload Zone - Flat Design */}
      {step === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative group overflow-hidden rounded-lg border-2 border-dashed transition-all duration-150 cursor-pointer ${isDragging
            ? "border-[#0369A1] bg-[#F0F9FF] dark:bg-blue-900/10"
            : "border-gray-300 dark:border-gray-700 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] bg-white dark:bg-gray-900"
            }`}
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <label
            htmlFor="resume-upload"
            className={`cursor-pointer flex flex-col items-center justify-center ${isMinimal ? "py-6 px-4" : "py-12 px-8"}`}
          >
            {/* Icon - Flat Design */}
            <div className={`relative ${isMinimal ? "mb-3" : "mb-6"}`}>
              <div className={`${isMinimal ? "w-10 h-10" : "w-16 h-16"} rounded-lg flex items-center justify-center transition-all duration-150 ${isDragging ? "bg-[#0369A1] scale-105" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-[#0369A1]/10"
                }`}>
                {uploading ? (
                  <div className={`animate-spin rounded-full border-2 border-[#0369A1] border-t-transparent ${isMinimal ? "h-5 w-5" : "h-8 w-8"}`} />
                ) : (
                  <Upload className={`${isMinimal ? "w-5 h-5" : "w-8 h-8"} transition-colors duration-150 ${isDragging ? "text-white" : "text-gray-400 group-hover:text-[#0369A1]"}`} />
                )}
              </div>
              {!uploading && !isMinimal && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-all duration-150">
                  <FileText className="w-4 h-4 text-[#0369A1]" />
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="text-center space-y-1">
              <h3 className={`${isMinimal ? "text-sm" : "text-xl"} font-bold text-[#0C4A6E] dark:text-gray-100`}>
                {uploading ? "Uploading..." : "Drop your Resume here"}
              </h3>
              {!isMinimal && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  We'll use AI to extract your experience
                </p>
              )}
            </div>

            {/* Features - Flat Design */}
            {!isMinimal && (
              <div className="mt-8 flex items-center gap-6 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0369A1]" />
                  PDF Only
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
                  Max 5MB
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  AI Powered
                </div>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Modal - Flat Design */}
      {(step === "parsing" || step === "review") && currentResumeId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm -z-10"
          />

          <div
            className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Flat Design */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#F0F9FF] dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0369A1] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#0C4A6E] dark:text-gray-100">
                  {step === "parsing" ? "AI Extraction Progress" : "Confirm Extracted Data"}
                </h2>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150 group cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {step === "parsing" ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <ResumeParsingProgress
                    resumeId={currentResumeId}
                    onComplete={() => setStep("review")}
                    onError={handleCancel}
                  />
                </div>
              ) : (
                <div className="p-6">
                  <ResumeReview
                    resumeId={currentResumeId}
                    onSaveComplete={(result) => {
                      setStep("idle");
                      onUploadSuccess(currentResumeId!, result as any);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Flat Design */}
      {error && step === "idle" && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 font-medium text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Privacy Notice - Flat Design */}
      {step === "idle" && !isMinimal && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-[#F0F9FF] dark:bg-blue-900/10 rounded-lg border border-[#0EA5E9]/20 dark:border-blue-900/20">
          <Shield className="w-4 h-4 text-[#0369A1] dark:text-[#0EA5E9] flex-shrink-0" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-snug">
            Your data is processed with privacy-first principles. We only extract what you approve.
          </p>
        </div>
      )}
    </div>
  );
}

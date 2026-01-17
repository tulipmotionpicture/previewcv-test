"use client";

import { useState } from "react";
import { useResumeParser } from "@/hooks/useResumeParser";
import ResumeParsingProgress from "./ResumeParsingProgress";
import ResumeReview from "./ResumeReview";
import { Upload, FileText, AlertCircle, Sparkles, X } from "lucide-react";
import { ResumeMetadata } from "@/lib/api";

type Step = "idle" | "parsing" | "review";

interface ResumeUploadProps {
  onUploadSuccess: (resumeId: number, metadata?: ResumeMetadata) => void;
  existingResumeId?: number; // Optional: if provided, parse this resume instead of uploading
}

export default function ResumeUpload({ onUploadSuccess, existingResumeId }: ResumeUploadProps) {
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

  return (
    <div className="w-full">
      {/* Upload Zone (Always visible in idle step) */}
      {step === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative group overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
              : "border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-900"
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
            className="cursor-pointer flex flex-col items-center justify-center py-12 px-8"
          >
            <div className="relative mb-6">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${
                isDragging ? "bg-blue-600 rotate-12 scale-110" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:-rotate-6"
              }`}>
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-white" />
                ) : (
                  <Upload className={`w-8 h-8 transition-colors ${isDragging ? "text-white" : "text-gray-400 group-hover:text-blue-600"}`} />
                )}
              </div>
              {!uploading && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-all">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 italic">
                {uploading ? "Uploading Resume..." : "Drop your Resume here"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                We'll use AI to magically extract your experience
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 PDF Only
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 Max 5MB
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                 AI Powered
               </div>
            </div>
          </label>
        </div>
      )}

      {/* Modal / Overlay for Parsing and Review */}
      {(step === "parsing" || step === "review") && currentResumeId && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md -z-10" 
          />
          
          <div 
            className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-500 border border-white/20 dark:border-gray-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">
                  {step === "parsing" ? "AI Extraction Progress" : "Confirm Extracted Data"}
                </h2>
              </div>
              <button 
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
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
                <div className="p-8">
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

      {error && step === "idle" && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-sm animate-shake">
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <p>{error}</p>
        </div>
      )}

      {step === "idle" && (
        <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
           <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
           <p className="text-xs font-bold text-gray-600 dark:text-gray-400 italic leading-snug">
             Your data is processed using local-first privacy. We only extract what you approve.
           </p>
        </div>
      )}
    </div>
  );
}

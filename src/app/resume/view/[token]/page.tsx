"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ResumeApiService, ResumeApiError } from "@/services/resumeApi";
import { ResumeApiResponse } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import PDFViewer from "@/components/PDFViewer";
import ResponsiveLayout, { useResponsive } from "@/components/ResponsiveLayout";
import ResumeReview from "@/components/ResumeReview";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import {
  FileText,
  Download,
  Share2,
  Printer,
  Eye,
  Clock,
  Users,
  Mail,
  Calendar,
  Zap,
  Brain,
  TrendingUp,
  Lock,
  ChevronRight,
  X,
  BarChart3,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ""}`}
  >
    {children}
  </span>
);

const LockedFeature = ({
  children,
  label = "Login to Unlock",
}: {
  children: React.ReactNode;
  label?: string;
}) => (
  <div className="relative group">
    <div className="blur-[2px] pointer-events-none opacity-60 transition-all group-hover:blur-[3px]">
      {children}
    </div>
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
        <Lock size={14} className="text-blue-600" />
        <span className="text-xs font-semibold text-slate-900">{label}</span>
      </div>
    </div>
  </div>
);

function ResumeViewerButton({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  icon?: React.ElementType;
}) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    gradient:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg font-medium",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className || ""}`}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

export default function ResumePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { breakpoint, isMobile } = useResponsive();
  const { isAuthenticated } = useRecruiterAuth();

  const [resumeData, setResumeData] = useState<ResumeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchResumeData = useCallback(
    async (permanentToken: string) => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          `Fetching resume data for token: ${permanentToken.substring(0, 8)}...`,
        );

        const data = await ResumeApiService.fetchResume(permanentToken, {
          timeout: 10000,
          retries: 2,
        });

        console.log("Resume data received:", {
          success: data.success,
          resumeName: data.resume_name,
          hasPdfUrl: !!data.pdf_signed_url,
        });

        setResumeData(data);

        // Check if PDF is accessible
        if (data.pdf_signed_url) {
          checkPdfAccessibility(data.pdf_signed_url);
        }
      } catch (fetchError) {
        console.error("Failed to fetch resume:", fetchError);

        const errorMessage =
          ResumeApiService.getDisplayErrorMessage(fetchError);
        setError(errorMessage);

        // Handle specific error types
        if (fetchError instanceof ResumeApiError) {
          if (fetchError.status === 404) {
            // Resume not found - could redirect to a 404 page
            setTimeout(() => {
              router.push("/404");
            }, 3000);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!token) {
      setError("No resume token provided");
      setLoading(false);
      return;
    }

    if (typeof token !== "string" || token.length < 10) {
      setError("Invalid resume token format");
      setLoading(false);
      return;
    }

    fetchResumeData(token);
  }, [token, fetchResumeData]);

  const checkPdfAccessibility = async (pdfUrl: string) => {
    try {
      const isAccessible = await ResumeApiService.checkPdfAccessibility(pdfUrl);
      setPdfAccessible(isAccessible);

      if (!isAccessible) {
        console.warn("PDF may not be accessible:", pdfUrl);
      }
    } catch {
      setPdfAccessible(false);
    }
  };

  const handleReloadForNewLink = () => {
    fetchResumeData(token);
  };

  const handleRetry = () => {
    if (token) {
      fetchResumeData(token);
    }
  };

  const handleDownloadPDF = async () => {
    if (resumeData?.pdf_signed_url) {
      try {
        // Fetch the PDF file
        const response = await fetch(resumeData.pdf_signed_url);
        if (!response.ok) throw new Error("Failed to download PDF");

        // Convert response to blob
        const blob = await response.blob();

        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${resumeData.candidate?.full_name || resumeData.resume_name || "resume"}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download PDF. Please try again.");
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow && resumeData?.pdf_signed_url) {
      printWindow.document.write(
        `<iframe src="${resumeData.pdf_signed_url}" style="width:100%;height:100%;border:none;" /><script>window.print();</script>`,
      );
    }
  };

  const handleShare = async () => {
    const cleanUrl = window.location.origin + window.location.pathname;

    if (navigator.share && resumeData) {
      try {
        await navigator.share({
          title: `${resumeData.candidate?.full_name || "Resume"} - ${resumeData.candidate?.headline || "Professional Resume"}`,
          url: cleanUrl,
        });
      } catch (error) {
        console.log("Share failed or cancelled:", error);
      }
    } else {
      navigator.clipboard.writeText(cleanUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handleCopyEmail = () => {
    const email = resumeData?.candidate?.email || "contact@example.com";
    navigator.clipboard.writeText(email);
    alert(`Email copied: ${email}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={isMobile ? "medium" : "large"} />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading resume...
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Token: {token?.substring(0, 8)}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header showAuthButtons={true} />
        <div className="flex-1 flex items-center justify-center p-4 mt-16">
          <ErrorDisplay
            title="Unable to Load Resume"
            message={error}
            onRetry={handleRetry}
            showRetry={
              !error.includes("not found") && !error.includes("Invalid")
            }
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Success state - render modern resume viewer
  if (resumeData && resumeData.success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {/* Header */}
        <Header showAuthButtons={true} />

        <main className="max-w-7xl mx-auto px-4 py-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Resume */}
          <div className="lg:col-span-8 space-y-6">
            {/* Resume Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                {/* Left: Profile Info */}
                <div className="flex gap-6 items-start flex-1">
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-300 shadow-sm">
                    <img
                      src="https://picsum.photos/seed/resume/200/200"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-3 flex-1 pt-1">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">
                        {resumeData.candidate?.full_name ||
                          resumeData.resume_name ||
                          "Resume"}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-600 font-medium">
                          {resumeData.candidate?.headline ||
                            "Professional Resume"}
                        </p>
                        {resumeData.job_preferences?.employment_type && (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            Actively Looking
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Location and Links */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      {resumeData.candidate?.location && (
                        <div className="flex items-center gap-1.5">
                          <Globe size={16} className="text-slate-400" />
                          <span>
                            {resumeData.candidate.location.city &&
                              `${resumeData.candidate.location.city}, `}
                            {resumeData.candidate.location.state &&
                              `${resumeData.candidate.location.state}, `}
                            {resumeData.candidate.location.country}
                          </span>
                        </div>
                      )}
                      {resumeData.candidate?.contact?.website && (
                        <a
                          href={resumeData.candidate.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-blue-600"
                        >
                          <Globe size={16} className="text-slate-400" />
                          <span>{resumeData.candidate.contact.website}</span>
                        </a>
                      )}
                      {resumeData.candidate?.contact?.linkedin && (
                        <a
                          href={resumeData.candidate.contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-blue-600"
                        >
                          <Linkedin size={16} className="text-slate-400" />
                          <span>{resumeData.candidate.contact.linkedin}</span>
                        </a>
                      )}
                      {resumeData.candidate?.contact?.github && (
                        <a
                          href={resumeData.candidate.contact.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-blue-600"
                        >
                          <Github size={16} className="text-slate-400" />
                          <span>{resumeData.candidate.contact.github}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                  {/* <ResumeViewerButton
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </ResumeViewerButton> */}
                  <ResumeViewerButton
                    variant="outline"
                    size="sm"
                    icon={Share2}
                    onClick={handleShare}
                  >
                    Share
                  </ResumeViewerButton>
                  {/* <ResumeViewerButton
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={handlePrint}
                  >
                    Print
                  </ResumeViewerButton> */}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Profile Views",
                  value: resumeData.view_count || "0",
                  icon: Eye,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Avg. View Time",
                  value: "2m 45s",
                  icon: Clock,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  label: "Recruiters Viewed",
                  value: "12",
                  icon: Users,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "PDF Downloads",
                  value: "3",
                  icon: Download,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}
                  >
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* PDF Viewer Container */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col h-[900px]">
              {/* PDF Toolbar */}
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {resumeData.candidate?.full_name ||
                      resumeData.resume_name ||
                      "Resume"}
                    .pdf
                  </span>
                  {resumeData.source_type && (
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">
                      {resumeData.source_type.charAt(0).toUpperCase() +
                        resumeData.source_type.slice(1)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ResumeViewerButton
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700"
                    icon={Download}
                    onClick={handleDownloadPDF}
                  >
                    Download
                  </ResumeViewerButton>
                  <ResumeViewerButton
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700"
                    icon={Printer}
                    onClick={handlePrint}
                  >
                    Print
                  </ResumeViewerButton>
                </div>
              </div>

              {/* PDF Content Area */}
              <div className="flex-1 bg-slate-700 overflow-auto p-8 flex justify-center">
                <div className="w-full max-w-[800px]">
                  <PDFViewer
                    pdfUrl={resumeData.pdf_signed_url!}
                    resumeName={
                      resumeData.candidate?.full_name ||
                      resumeData.resume_name ||
                      "Resume"
                    }
                    onError={(error) =>
                      setError(`PDF loading failed: ${error}`)
                    }
                    className="rounded-lg shadow-2xl"
                    expiresIn={resumeData.expires_in}
                    onReloadRequired={handleReloadForNewLink}
                    viewCount={resumeData.access_count}
                  />
                </div>
              </div>

              {/* PDF Footer */}
              <div className="bg-slate-900 px-6 py-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span>
                  Document:{" "}
                  {resumeData.candidate?.full_name || resumeData.resume_name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Secure Viewer Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recruiter Tools */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Recruiter Tools Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Zap size={18} className="text-blue-400" />
                      Recruiter Tools
                    </h3>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      PRO
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Manage this candidate and streamline your hiring process.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    {/* Email */}
                    {resumeData?.candidate?.contact?.email && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <Mail size={14} /> Email
                        </p>
                        <p className="text-sm font-medium text-slate-900 break-all">
                          {resumeData.candidate.contact.email}
                        </p>
                      </div>
                    )}

                    {/* Phone */}
                    {resumeData?.candidate?.contact?.phone && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                          Phone
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {resumeData.candidate.contact.phone}
                        </p>
                      </div>
                    )}

                    {/* Address */}
                    {resumeData?.candidate?.contact?.address && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                          Address
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {resumeData.candidate.contact.address}
                        </p>
                      </div>
                    )}

                    {/* Website */}
                    {resumeData?.candidate?.contact?.website && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <Globe size={14} /> Website
                        </p>
                        <a
                          href={resumeData.candidate.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
                        >
                          {resumeData.candidate.contact.website}
                        </a>
                      </div>
                    )}

                    {/* LinkedIn */}
                    {resumeData?.candidate?.contact?.linkedin && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <Linkedin size={14} /> LinkedIn
                        </p>
                        <a
                          href={resumeData.candidate.contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
                        >
                          {resumeData.candidate.contact.linkedin}
                        </a>
                      </div>
                    )}

                    {/* GitHub */}
                    {resumeData?.candidate?.contact?.github && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <Github size={14} /> GitHub
                        </p>
                        <a
                          href={resumeData.candidate.contact.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
                        >
                          {resumeData.candidate.contact.github}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-200">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={handleCopyEmail}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        >
                          <Mail size={16} />
                          Copy Email
                        </button>
                        <ResumeViewerButton
                          variant="outline"
                          className="w-full"
                          size="sm"
                          icon={Calendar}
                        >
                          Invite to Interview
                        </ResumeViewerButton>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">
                            Want to reach out to this candidate?
                          </p>
                          <p className="text-xs text-slate-600 mb-3">
                            Sign in as a recruiter to send interview invitations
                            and manage candidates.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push("/recruiter/login")}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          Sign In as Recruiter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Additional Actions - Always show for authenticated users */}
                  {isAuthenticated && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-emerald-700">
                          Send to Hiring Board
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-emerald-700">
                          Add to Pipeline
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-emerald-700">
                          Add Phone Details
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Review Mode */}
        {isReviewMode && (
          <ResumeReview
            permanentToken={token}
            onClose={() => setIsReviewMode(false)}
          />
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header showAuthButtons={true} />
      <div className="flex-1 flex items-center justify-center p-4 mt-16">
        <ErrorDisplay
          title="No Resume Data"
          message="No valid resume data received from the server."
          onRetry={handleRetry}
          showRetry={true}
        />
      </div>
      <Footer />
    </div>
  );
}

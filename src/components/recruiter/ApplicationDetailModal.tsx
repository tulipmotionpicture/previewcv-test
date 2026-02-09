"use client";

import { useState } from "react";
import { ApplicationDetailResponse } from "@/types/api";
import { api } from "@/lib/api";
import {
  X,
  Copy,
  Maximize2,
  Eye,
  Download,
  MessageSquare,
  Send,
} from "lucide-react";

interface ApplicationDetailModalProps {
  applicationDetail: ApplicationDetailResponse | null;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
}

export default function ApplicationDetailModal({
  applicationDetail,
  isOpen,
  loading,
  onClose,
  onMessageSent,
}: ApplicationDetailModalProps) {
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);

  const handleViewResume = async () => {
    if (!applicationDetail?.application?.id) return;
    setViewLoading(true);
    try {
      const response = await api.getApplicationResumeDownloadUrl(
        applicationDetail.application.id,
        "url",
        false,
      );
      if (response.download_url) {
        window.open(response.download_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to get resume URL:", error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!applicationDetail?.application?.id) return;
    setDownloadLoading(true);
    try {
      const response = await api.getApplicationResumeDownloadUrl(
        applicationDetail.application.id,
        "url",
        true,
      );
      if (response.download_url) {
        // Fetch the PDF as a blob to force download
        const pdfResponse = await fetch(response.download_url);
        const blob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download =
          applicationDetail.resume?.name ||
          applicationDetail.uploaded_resume?.name ||
          "resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Failed to download resume:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!applicationDetail?.application?.id || !message.trim()) return;
    setSendingMessage(true);
    setMessageSuccess(false);
    try {
      await api.sendMessageToApplicant(
        applicationDetail.application.id,
        message.trim(),
      );
      setMessageSuccess(true);
      setMessage("");
      setTimeout(() => {
        setMessageSuccess(false);
        setShowMessageBox(false);
      }, 2000);
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "offered":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B172B] shrink-0">
          <h2 className="text-lg font-medium text-white">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : applicationDetail ? (
            <>
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src={
                        applicationDetail?.candidate?.profile_image_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(applicationDetail.candidate.full_name)}&background=random`
                      }
                      alt={applicationDetail.candidate.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {applicationDetail.candidate.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                      <span className="text-sm underline decoration-gray-300 underline-offset-2">
                        {applicationDetail.candidate.email}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            applicationDetail.candidate.email,
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${getStatusBadgeColor(
                      applicationDetail.application.status,
                    )}`}
                  >
                    {applicationDetail.application.status.replace("_", " ")}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"></button>
                </div>
              </div>

              {/* Applied For */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Applied For
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {applicationDetail.job.title}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Company Details
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Company Name
                      </p>
                      <p className="text-sm text-gray-500">
                        {applicationDetail.job.company_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Location
                      </p>
                      <p className="text-sm text-gray-500">
                        {applicationDetail.job.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Application ID
                  </p>
                  <p className="text-sm text-gray-500">
                    #{applicationDetail.application.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Application Date
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      applicationDetail.application.applied_at,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Last Update
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      applicationDetail.application.updated_at,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />

              {/* Candidate Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Candidate Information
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicationDetail.candidate.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Phone Number <Copy className="w-5 h-5 rotate-90" />
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicationDetail.candidate.phone_code}{" "}
                      {applicationDetail.candidate.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Gender
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {applicationDetail.candidate.gender || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Date of Birth
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicationDetail.candidate.date_of_birth ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Location
                    </p>
                    <p className="text-sm text-gray-500">
                      {[
                        applicationDetail.candidate.city,
                        applicationDetail.candidate.state,
                        applicationDetail.candidate.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Address
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicationDetail.candidate.address
                        ? `${applicationDetail.candidate.address}, ${[applicationDetail.candidate.city, applicationDetail.candidate.state, applicationDetail.candidate.country].filter(Boolean).join(", ")}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Candidate Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Contact Candidate
                  </h4>
                  {!showMessageBox && (
                    <button
                      onClick={() => setShowMessageBox(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </button>
                  )}
                </div>

                {showMessageBox && (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message to the candidate..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !message.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {sendingMessage ? "Sending..." : "Send Message"}
                      </button>
                      <button
                        onClick={() => {
                          setShowMessageBox(false);
                          setMessage("");
                          setMessageSuccess(false);
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      {messageSuccess && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium ml-2">
                          ✓ Message sent successfully!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Resume
                </h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleViewResume}
                    disabled={viewLoading}
                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {viewLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                    View
                  </button>

                  <button
                    onClick={handleDownloadResume}
                    disabled={downloadLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0B172B] text-white rounded-lg font-medium hover:bg-[#0B172B]/90 transition-colors disabled:opacity-50"
                  >
                    {downloadLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    Download
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No application details available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

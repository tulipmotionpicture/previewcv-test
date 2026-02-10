"use client";

import React, { useEffect, useState, useCallback, Fragment } from "react";
import { useToast } from "@/context/ToastContext";
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  AlertCircle,
  Eye,
  Pencil,
  ShieldCheck,
  BadgeCheck,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import type { KycDocument, KycStatus, KycRequirement } from "@/types/api";

export default function KYCVerification() {
  const { showToast } = useToast();
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [requirements, setRequirements] = useState<KycRequirement[]>([]);
  const [countryCode, setCountryCode] = useState<string>("IND");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [issuingCountry, setIssuingCountry] = useState<string>("IN");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [issuingAuthority, setIssuingAuthority] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, docsRes, reqRes] = await Promise.all([
        api.getKycStatus(),
        api.getKycDocuments(),
        api.getKycRequirements(countryCode),
      ]);

      setKycStatus(statusRes);
      setDocuments(docsRes);
      setRequirements(reqRes.requirements);
    } catch (error) {
      console.error("Failed to fetch KYC data:", error);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType || !issuingCountry) return;

    try {
      setUploading(true);

      // If editing, delete the old document first
      if (editingDocId) {
        await api.deleteKycDocument(editingDocId);
      }

      const response = await api.uploadKycDocument(
        selectedFile,
        selectedDocType,
        issuingCountry,
        documentNumber || undefined,
        issuingAuthority || undefined,
        issueDate || undefined,
        expiryDate || undefined,
      );

      if (response) {
        setSelectedFile(null);
        setSelectedDocType("");
        setDocumentNumber("");
        setIssuingAuthority("");
        setIssueDate("");
        setExpiryDate("");
        setEditingDocId(null);
        setIsUploadModalOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    setDocToDelete(docId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;

    try {
      await api.deleteKycDocument(docToDelete);
      await fetchData();
      showToast("Document deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete document", "error");
    } finally {
      setShowDeleteConfirm(false);
      setDocToDelete(null);
    }
  };

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const blob = await api.downloadKycDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleViewDocument = async (docId: number) => {
    try {
      const blob = await api.downloadKycDocument(docId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up after a delay to ensure the new tab can load the blob
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("View failed:", error);
    }
  };

  const handleEditDocument = (doc: KycDocument) => {
    setEditingDocId(doc.id);
    setSelectedDocType(doc.document_type);
    setIssuingCountry(doc.issuing_country);
    setDocumentNumber(doc.document_number || "");
    setIssuingAuthority(doc.issuing_authority || "");
    setIssueDate(doc.issue_date || "");
    setExpiryDate(doc.expiry_date || "");
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setEditingDocId(null);
    setSelectedFile(null);
    setSelectedDocType("");
    setDocumentNumber("");
    setIssuingAuthority("");
    setIssueDate("");
    setExpiryDate("");
  };

  const handleSubmitForReview = async () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmitForReview = async () => {
    try {
      const response = await api.submitKycForReview();
      if (response) {
        await fetchData();
        showToast("KYC documents submitted for review", "success");
      }
    } catch (error) {
      console.error("Submit failed:", error);
      showToast("Failed to submit documents for review", "error");
    } finally {
      setShowSubmitConfirm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploaded: {
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        text: "Uploaded",
        className:
          "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
      },
      pending_review: {
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "Under Review",
        className:
          "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
      },
      approved: {
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        text: "Approved",
        className:
          "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
      },
      rejected: {
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Rejected",
        className:
          "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
      },
      expired: {
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: "Expired",
        className:
          "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.uploaded;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              KYC Verification
            </h1>
          </div>
          {kycStatus?.kyc_status === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your identity verification to unlock all platform features
        </p>
      </div>

      {/* Status Overview */}
      {kycStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    kycStatus.kyc_status === "approved"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : kycStatus.kyc_status === "pending_review"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : kycStatus.kyc_status === "rejected"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      kycStatus.kyc_status === "approved"
                        ? "text-green-600 dark:text-green-400"
                        : kycStatus.kyc_status === "pending_review"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : kycStatus.kyc_status === "rejected"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {kycStatus.kyc_status_display}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {kycStatus.kyc_status === "approved" &&
                      "Your account is verified"}
                    {kycStatus.kyc_status === "pending_review" &&
                      "Documents under review"}
                    {kycStatus.kyc_status === "rejected" && "Action required"}
                    {kycStatus.kyc_status === "not_submitted" &&
                      "Get started with verification"}
                  </p>
                </div>
              </div>

              {kycStatus.kyc_status === "not_submitted" &&
                documents.length > 0 && (
                  <button
                    onClick={handleSubmitForReview}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Submit for Review
                  </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <div className="text-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {kycStatus.uploaded_documents_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Uploaded
                </p>
              </div>

              <div className="text-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {kycStatus.pending_documents_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pending
                </p>
              </div>

              <div className="text-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {kycStatus.approved_documents_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Approved
                </p>
              </div>

              <div className="text-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {kycStatus.rejected_documents_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rejected
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingDocId ? "Update Document" : "Upload Document"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {editingDocId
                    ? "Modify document details"
                    : "Add a verification document"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IND">India</option>
                  <option value="USA">United States</option>
                  <option value="GBR">United Kingdom</option>
                  <option value="CAN">Canada</option>
                  <option value="AUS">Australia</option>
                </select>
              </div>

              {/* Document Type & Issuing Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {requirements.map((req) => (
                      <option key={req.document_type} value={req.document_type}>
                        {req.display_name} {req.is_required && "*"}
                      </option>
                    ))}
                  </select>
                  {selectedDocType &&
                    requirements.find(
                      (r) => r.document_type === selectedDocType,
                    )?.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {
                          requirements.find(
                            (r) => r.document_type === selectedDocType,
                          )?.description
                        }
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Issuing Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issuingCountry}
                    onChange={(e) =>
                      setIssuingCountry(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., IN, US, GB"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  />
                </div>
              </div>

              {/* Document Number & Authority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="ID/Number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    placeholder="Authority"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dates */}
              {selectedDocType &&
                requirements.find((r) => r.document_type === selectedDocType)
                  ?.accepts_expiry_date && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  File <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium block">
                      {selectedFile ? selectedFile.name : "Click to upload"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      PDF, JPG, JPEG, PNG (Max 10MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  !selectedFile ||
                  !selectedDocType ||
                  !issuingCountry ||
                  uploading
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {uploading
                  ? editingDocId
                    ? "Updating..."
                    : "Uploading..."
                  : editingDocId
                    ? "Update"
                    : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Documents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"} uploaded
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No documents yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload your first document to get started
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    File
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <Fragment key={doc.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {requirements.find(
                            (r) => r.document_type === doc.document_type,
                          )?.display_name || doc.document_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                            {doc.original_filename}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {doc.file_size_mb.toFixed(2)} MB
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(doc.status)}
                          {doc.is_expired && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Expired
                            </p>
                          )}
                          {doc.needs_renewal_warning &&
                            doc.days_until_expiry !== null && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                Expires in {doc.days_until_expiry}d
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.reviewed_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            Reviewed{" "}
                            {new Date(doc.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDocument(doc.id)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(doc.id, doc.original_filename)
                            }
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditDocument(doc)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Rejection Reason Row */}
                    {doc.status === "rejected" && doc.rejection_reason && (
                      <tr key={`${doc.id}-rejection`}>
                        <td colSpan={5} className="py-0">
                          <div className="px-4 pb-3">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                                    Rejection Reason:
                                  </p>
                                  <p className="text-xs text-red-700 dark:text-red-300">
                                    {doc.rejection_reason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Delete Document
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this document? This action
                cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDocToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit for Review Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                Submit for Review
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to submit your KYC documents for review?
                Once submitted, you won&apos;t be able to modify them until the
                review is complete.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitForReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

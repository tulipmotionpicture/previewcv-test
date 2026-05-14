/**
 * PDF Viewer Component
 * Renders PDF files with react-pdf for better cross-browser compatibility
 */

"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/pdf-viewer.css";

interface PDFViewerProps {
  pdfUrl: string;
  resumeName: string;
  onError?: (error: string) => void;
  className?: string;
  expiresIn?: number; // Time in seconds until PDF URL expires
  onReloadRequired?: () => void; // Callback when user needs to reload
  viewCount?: number; // Add view count prop
}

export default function PDFViewer({
  pdfUrl,
  resumeName,
  className = "",
  expiresIn,
  onReloadRequired,
  viewCount,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(
    expiresIn || null,
  );
  const [isExpired, setIsExpired] = useState(false);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const hasValidPdfUrl = typeof pdfUrl === "string" && pdfUrl.trim().length > 0;

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Reset states when PDF URL changes
    setLoading(true);
    setError(null);
    setIsExpired(false);
    setShowExpirationWarning(false);
    setTimeUntilExpiry(expiresIn || null);
  }, [pdfUrl, expiresIn]);

  // Handle expiration countdown
  useEffect(() => {
    if (!timeUntilExpiry || timeUntilExpiry <= 0) return;

    const interval = setInterval(() => {
      setTimeUntilExpiry((prev) => {
        if (!prev || prev <= 1) {
          setIsExpired(true);
          setShowExpirationWarning(false);
          return 0;
        }

        const newTime = prev - 1;

        // Show warning when 1 minutes (60 seconds) or less remaining
        if (newTime <= 60 && !showExpirationWarning) {
          setShowExpirationWarning(true);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilExpiry, showExpirationWarning]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setLoading(false);
    setError(null);
  };

  const downloadPdf = () => {
    if (isExpired) {
      onReloadRequired?.();
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${resumeName}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Expired";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleReload = () => {
    onReloadRequired?.();
  };

  const handleDownloadClick = () => {
    downloadPdf();
  };

  const handleReloadClick = () => {
    handleReload();
  };

  const handleDismissWarning = () => {
    setShowExpirationWarning(false);
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  const handleViewDirectly = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 ${className}`}>
      {/* Custom PDF Viewer Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">PDF</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {resumeName}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>PDF Document</span>
                {viewCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>{viewCount} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Expiration Timer and Download Button */}
          <div className="flex items-center space-x-2">
            {timeUntilExpiry !== null && (
              <div
                className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-md ${
                  isExpired
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : timeUntilExpiry <= 300
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}
              >
                <span>{isExpired ? "🔒" : "⏰"}</span>
                <span className="font-medium">
                  {isExpired ? "Expired" : formatTimeRemaining(timeUntilExpiry)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadClick}
              title={isExpired ? "Reload page to download" : "Download PDF"}
              className={`p-2 rounded-lg transition-colors ${
                isExpired
                  ? "text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isExpired ? "↻" : "⤓"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading PDF...</p>
            <p className="mt-1 text-sm text-gray-500">{resumeName}</p>
          </div>
        </div>
      )}

      {/* PDF Viewer Content */}
      <div
        className="flex-1 relative"
        style={{ height: "calc(100vh - 160px)" }}
      >
        {isExpired ? (
          <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🔒</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  PDF Link Expired
                </h3>

                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  The PDF link has expired for security reasons. Please reload
                  the page to generate a new link.
                </p>

                <button
                  type="button"
                  onClick={handleReloadClick}
                  className="w-full bg-primary-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>↻</span>
                  <span>Reload Page</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full h-full overflow-hidden flex justify-center bg-gray-100">
              {!hasValidPdfUrl ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center p-8 max-w-md">
                    <div className="text-red-500 mb-4">❌</div>
                    <p className="text-gray-600 mb-2 font-medium">
                      No PDF URL available
                    </p>
                    <p className="text-sm text-gray-500">
                      The resume record did not include a valid PDF link.
                    </p>
                  </div>
                </div>
              ) : isMounted ? (
                <iframe
                  src={pdfUrl}
                  title={resumeName}
                  className="w-full h-full border-0 bg-white"
                  onLoad={() => setLoading(false)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <LoadingSpinner size="large" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expiration Warning Banner */}
      {showExpirationWarning && !isExpired && (
        <div className="absolute top-16 left-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-4 z-30 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="shrink-0">
              <span className="text-amber-500 text-lg">⚠</span>
            </div>
            <div className="flex-1">
              <h4 className="text-amber-800 font-medium text-sm">
                PDF Link Expiring Soon
              </h4>
              <p className="text-amber-700 text-sm mt-1">
                This PDF link will expire in{" "}
                {formatTimeRemaining(timeUntilExpiry!)}. Download now or reload
                the page to get a fresh link.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  Download Now
                </button>
                <button
                  type="button"
                  onClick={handleReloadClick}
                  className="bg-white hover:bg-gray-50 text-amber-700 border border-amber-300 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  Reload Page
                </button>
                <button
                  type="button"
                  onClick={handleDismissWarning}
                  className="text-amber-600 hover:text-amber-800 text-xs px-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-3 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-amber-500">⚠</span>
            <p className="text-amber-800 text-sm flex-1">{error}</p>
            <button
              type="button"
              onClick={handleErrorDismiss}
              className="text-amber-600 hover:text-amber-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple PDF Viewer Component (without external dependencies)
 */
export function SimplePDFViewer({
  pdfUrl,
  resumeName,
  className = "",
}: Omit<PDFViewerProps, "onError">) {
  return (
    <div className={`w-full h-full ${className}`}>
      <iframe
        src={pdfUrl}
        title={`Resume: ${resumeName}`}
        className="w-full h-screen border-0"
        style={{ minHeight: "calc(100vh - 120px)" }}
        loading="lazy"
      />
    </div>
  );
}

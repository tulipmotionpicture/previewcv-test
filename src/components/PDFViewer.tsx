/**
 * PDF Viewer Component
 * Renders PDF files with react-pdf for better cross-browser compatibility
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from './LoadingSpinner';
import '../styles/pdf-viewer.css';

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

// Set up PDF.js worker only on client side with multiple fallback options
if (typeof window !== 'undefined') {
  import('react-pdf').then((pdfjs) => {
    // Set up worker with proper configuration
    const setupWorker = () => {
      try {
        // Primary: Use local worker file
        pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        
        // Test if worker loads, if not, try CDN fallbacks
        const testWorker = new Worker('/pdf.worker.min.js');
        testWorker.terminate();
      } catch (error) {
        console.warn('Local worker failed, trying CDN:', error);
        // Fallback to CDN sources
        const workerSources = [
          `https://unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.mjs`,
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.pdfjs.version}/pdf.worker.min.js`,
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.mjs`
        ];
        
        let workerIndex = 0;
        const tryNextWorker = () => {
          if (workerIndex < workerSources.length) {
            pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = workerSources[workerIndex];
            workerIndex++;
          }
        };
        
        tryNextWorker();
      }
    };
    
    setupWorker();
  }).catch((error) => {
    console.warn('Failed to load react-pdf:', error);
  });
}

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
  className = '',
  expiresIn,
  onReloadRequired,
  viewCount
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(expiresIn || null);
  const [isExpired, setIsExpired] = useState(false);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isMounted, setIsMounted] = useState(false);
  const [showAllPages, setShowAllPages] = useState(true); // Show all pages by default

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
    setNumPages(null);
    setPageNumber(1);
  }, [pdfUrl, expiresIn]);

  // Handle expiration countdown
  useEffect(() => {
    if (!timeUntilExpiry || timeUntilExpiry <= 0) return;

    const interval = setInterval(() => {
      setTimeUntilExpiry(prev => {
        if (!prev || prev <= 1) {
          setIsExpired(true);
          setShowExpirationWarning(false);
          return 0;
        }
        
        const newTime = prev - 1;
        
        // Show warning when 5 minutes (300 seconds) or less remaining
        if (newTime <= 300 && !showExpirationWarning) {
          setShowExpirationWarning(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilExpiry, showExpirationWarning]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setLoading(false);
    console.error('PDF load error:', error);
    
    // Check if it's a worker-related error
    if (error.message.includes('worker') || error.message.includes('fetch')) {
      setError('PDF worker failed to load. Please refresh the page or try opening the PDF directly.');
    } else {
      setError('Failed to load PDF document');
    }
  };

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const toggleViewMode = () => {
    setShowAllPages(!showAllPages);
  };

  const downloadPdf = () => {
    if (isExpired) {
      onReloadRequired?.();
      return;
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${resumeName}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
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
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 ${className}`}>
      {/* Custom PDF Viewer Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
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
          {/* PDF Controls */}
          {numPages && (
            <div className="flex items-center space-x-2">
              {!showAllPages && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    ◀
                  </button>
                  <span className="text-xs text-gray-600">
                    {pageNumber} / {numPages}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    ▶
                  </button>
                  
                  <div className="mx-2 h-4 w-px bg-gray-300"></div>
                </>
              )}
              
              <button
                type="button"
                onClick={toggleViewMode}
                className="p-1 text-gray-500 hover:text-gray-700"
                title={showAllPages ? "Single page view" : "Continuous view"}
              >
                {showAllPages ? '📄' : '📋'}
              </button>
              
              <div className="mx-2 h-4 w-px bg-gray-300"></div>
              
              <button
                type="button"
                onClick={zoomOut}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Zoom out"
              >
                ➖
              </button>
              <span className="text-xs text-gray-600">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Zoom in"
              >
                ➕
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="p-1 text-xs text-gray-500 hover:text-gray-700"
                title="Reset zoom"
              >
                100%
              </button>
            </div>
          )}
          
          {/* Expiration Timer and Download Button */}
          <div className="flex items-center space-x-2">
            {timeUntilExpiry !== null && (
              <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-md ${
                isExpired 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : timeUntilExpiry <= 300 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}>
                <span>{isExpired ? '🔒' : '⏰'}</span>
                <span className="font-medium">
                  {isExpired 
                    ? 'Expired' 
                    : formatTimeRemaining(timeUntilExpiry)
                  }
                </span>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleDownloadClick}
              title={isExpired ? "Reload page to download" : "Download PDF"}
              className={`p-2 rounded-lg transition-colors ${
                isExpired 
                  ? 'text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isExpired ? '↻' : '⤓'}
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
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 160px)' }}>
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
                  The PDF link has expired for security reasons. Please reload the page to generate a new link.
                </p>

                <button
                  type="button"
                  onClick={handleReloadClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>↻</span>
                  <span>Reload Page</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full h-full overflow-auto flex justify-center bg-gray-100">
              {isMounted ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<LoadingSpinner size="large" />}
                  error={
                    <div className="text-center p-8">
                      <div className="text-red-500 mb-4">❌</div>
                      <p className="text-gray-600 mb-4">Failed to load PDF</p>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleViewDirectly}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Open PDF Directly
                        </button>
                        <button
                          type="button"
                          onClick={handleRefreshPage}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  }
                >
                  {showAllPages ? (
                    // Render all pages continuously
                    Array.from(new Array(numPages), (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg mb-4"
                      />
                    ))
                  ) : (
                    // Render single page
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                    />
                  )}
                </Document>
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
            <div className="flex-shrink-0">
              <span className="text-amber-500 text-lg">⚠</span>
            </div>
            <div className="flex-1">
              <h4 className="text-amber-800 font-medium text-sm">
                PDF Link Expiring Soon
              </h4>
              <p className="text-amber-700 text-sm mt-1">
                This PDF link will expire in {formatTimeRemaining(timeUntilExpiry!)}. 
                Download now or reload the page to get a fresh link.
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
  className = ''
}: Omit<PDFViewerProps, 'onError'>) {
  return (
    <div className={`w-full h-full ${className}`}>
      <iframe
        src={pdfUrl}
        title={`Resume: ${resumeName}`}
        className="w-full h-screen border-0"
        style={{ minHeight: 'calc(100vh - 120px)' }}
        loading="lazy"
      />
    </div>
  );
}
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ResumeApiService, ResumeApiError } from '@/services/resumeApi';
import { ResumeApiResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import PDFViewer from '@/components/PDFViewer';
import ResponsiveLayout, { useResponsive } from '@/components/ResponsiveLayout';

export default function ResumePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { breakpoint, isMobile } = useResponsive();

  const [resumeData, setResumeData] = useState<ResumeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfAccessible, setPdfAccessible] = useState<boolean | null>(null);

  const fetchResumeData = useCallback(async (permanentToken: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching resume data for token: ${permanentToken.substring(0, 8)}...`);

      const data = await ResumeApiService.fetchResume(permanentToken, {
        timeout: 10000,
        retries: 2
      });

      console.log('Resume data received:', {
        success: data.success,
        resumeName: data.resume_name,
        hasPdfUrl: !!data.pdf_signed_url
      });

      setResumeData(data);

      // Check if PDF is accessible
      if (data.pdf_signed_url) {
        checkPdfAccessibility(data.pdf_signed_url);
      }

    } catch (fetchError) {
      console.error('Failed to fetch resume:', fetchError);
      
      const errorMessage = ResumeApiService.getDisplayErrorMessage(fetchError);
      setError(errorMessage);

      // Handle specific error types
      if (fetchError instanceof ResumeApiError) {
        if (fetchError.status === 404) {
          // Resume not found - could redirect to a 404 page
          setTimeout(() => {
            router.push('/404');
          }, 3000);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setError('No resume token provided');
      setLoading(false);
      return;
    }

    if (typeof token !== 'string' || token.length < 10) {
      setError('Invalid resume token format');
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
        console.warn('PDF may not be accessible:', pdfUrl);
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

  // Loading state
  if (loading) {
    return (
      <ResponsiveLayout title="Loading Resume..." showFooter={false}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size={isMobile ? "medium" : "large"} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading resume...</p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Token: {token?.substring(0, 8)}...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Screen: {breakpoint}
            </p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ResponsiveLayout title="Error Loading Resume" showFooter={true}>
        <div className="flex items-center justify-center min-h-96 p-4">
          <ErrorDisplay
            title="Unable to Load Resume"
            message={error}
            onRetry={handleRetry}
            showRetry={!error.includes('not found') && !error.includes('Invalid')}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  // Success state - render PDF viewer
  if (resumeData && resumeData.success) {
    return (
      <ResponsiveLayout 
        title={resumeData.resume_name || 'Resume'}
        showHeader={true}
        showFooter={!isMobile} // Hide footer on mobile for more space
      >
        {/* Mobile-specific controls */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {resumeData.resume_name}
                </p>
              </div>
              
              <div className="ml-4 flex space-x-2">
                {pdfAccessible === false && (
                  <span className="text-amber-500 text-xs">⚠️</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop-specific header info */}
        {!isMobile && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {pdfAccessible === false && (
                    <span className="text-amber-600 text-sm bg-amber-50 px-2 py-1 rounded">
                      ⚠️ PDF may not load properly
                    </span>
                  )}
                  
                  {resumeData.last_accessed_at && (
                    <span className="text-gray-500 text-sm">
                      Last accessed: {new Date(resumeData.last_accessed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1">
          <PDFViewer
            pdfUrl={resumeData.pdf_signed_url!}
            resumeName={resumeData.resume_name || 'Resume'}
            onError={(error) => setError(`PDF loading failed: ${error}`)}
            className={isMobile ? "h-screen" : "h-full"}
            expiresIn={resumeData.expires_in}
            onReloadRequired={handleReloadForNewLink}
            viewCount={resumeData.access_count}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  // Fallback
  return (
    <ResponsiveLayout title="No Resume Data">
      <div className="flex items-center justify-center min-h-96 p-4">
        <ErrorDisplay
          title="No Resume Data"
          message="No valid resume data received from the server."
          onRetry={handleRetry}
          showRetry={true}
        />
      </div>
    </ResponsiveLayout>
  );
}
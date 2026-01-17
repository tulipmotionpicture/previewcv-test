import { useState } from 'react';
import { api } from '@/lib/api';
import type {
  UploadResumeResponse,
  TransformedMetadata,
  SaveReviewedMetadataRequest,
  SaveReviewedMetadataResponse,
} from '@/types/resume-parser';

export function useResumeParser() {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Upload PDF
  const uploadResume = async (file: File, resumeName: string) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resume_name', resumeName);

      // We use the existing api.uploadResume logic but adapted to the guide's types
      const response = await api.uploadResume(file, resumeName);
      
      // Adapt the response to UploadResumeResponse if needed
      // api.uploadResume returns a more complex object.
      // The guide expects: success, resume_id, resume_name, file_url, uploaded_at, parse_stream_url, message
      
      const data: UploadResumeResponse = {
        success: response.success,
        resume_id: response.resume_id,
        resume_name: response.resume_name,
        file_url: response.bunny_cdn_url,
        uploaded_at: response.created_at,
        parse_stream_url: `${process.env.NEXT_PUBLIC_API_URL || 'https://letsmakecv.tulip-software.com'}/api/v1/pdf-resumes/${response.resume_id}/parse-stream`,
        message: response.message
      };
      
      return data;
    } catch (err: any) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // 2. Poll for parse status (Replacement for SSE to support headers)
  const connectToParseStream = (
    resumeId: number,
    onEvent: (event: any) => void,
    onComplete: (metadata: any) => void,
    onError: (error: string) => void
  ) => {
    setParsing(true);
    
    // Initial "connected" event to match UI expectations
    onEvent({
      event: 'connected',
      data: { resume_id: resumeId, message: 'Connected to parse service' }
    });

    let isStopped = false;
    let retryCount = 0;
    const MAX_RETRIES = 60; // 2 minutes with 2s interval

    const poll = async () => {
      if (isStopped) return;

      try {
        const response = await api.getParseStatus(resumeId);
        
        // Map status to SSE-like events for the UI
        if (response.status === 'completed') {
          onEvent({
            event: 'completed',
            data: { 
              resume_id: resumeId, 
              message: 'Parsing completed successfully',
              metadata: response.metadata 
            }
          });
          setParsing(false);
          onComplete(response.metadata);
          isStopped = true;
        } else if (response.status === 'failed') {
          const errorMsg = response.error || 'Parsing failed';
          onEvent({
            event: 'failed',
            data: { resume_id: resumeId, message: errorMsg }
          });
          setParsing(false);
          onError(errorMsg);
          isStopped = true;
        } else {
          // processing or pending
          onEvent({
            event: 'progress',
            data: { 
              resume_id: resumeId, 
              message: response.status === 'processing' ? 'AI is analyzing your resume...' : 'Queued for parsing...' 
            }
          });
          
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
             throw new Error('Parsing timed out');
          }
          
          // Poll again in 2 seconds
          setTimeout(poll, 2000);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        const errorMsg = err.message || 'Error checking parse status';
        onEvent({
          event: 'failed',
          data: { resume_id: resumeId, message: errorMsg }
        });
        setParsing(false);
        onError(errorMsg);
        isStopped = true;
      }
    };

    // Start polling
    poll();

    // Return a mock eventSource with a close method to maintain compatibility
    return {
      close: () => {
        isStopped = true;
      }
    };
  };

  // 3. Get transformed metadata
  const getTransformedMetadata = async (resumeId: number) => {
    setTransforming(true);
    setError(null);

    try {
      // Use the existing api method
      const data = await api.transformMetadataForGraphQL(resumeId);
      return data as unknown as TransformedMetadata;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setTransforming(false);
    }
  };

  // 4. Save reviewed metadata
  const saveReviewedMetadata = async (
    resumeId: number,
    request: SaveReviewedMetadataRequest
  ) => {
    setSaving(true);
    setError(null);

    try {
      // Use api.request directly to match the expected response type if api.saveReviewedMetadata differs
      const data = await api.saveReviewedMetadata(resumeId, request as any);
      return data as unknown as SaveReviewedMetadataResponse;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    uploading,
    parsing,
    transforming,
    saving,
    error,
    uploadResume,
    connectToParseStream,
    getTransformedMetadata,
    saveReviewedMetadata,
  };
}

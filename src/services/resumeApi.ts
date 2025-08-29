/**
 * Resume API Service
 * Handles client-side API calls for fetching resume data
 */

import { ResumeApiResponse, ErrorResponse } from '@/types';

interface FetchResumeOptions {
  timeout?: number;
  retries?: number;
}

export class ResumeApiService {
  private static readonly DEFAULT_TIMEOUT = 8000; // 8 seconds
  private static readonly DEFAULT_RETRIES = 5;

  /**
   * Fetch resume data by permanent token
   */
  static async fetchResume(
    permanentToken: string, 
    options: FetchResumeOptions = {}
  ): Promise<ResumeApiResponse> {
    const { timeout = this.DEFAULT_TIMEOUT, retries = this.DEFAULT_RETRIES } = options;

    if (!permanentToken || permanentToken.length < 10) {
      throw new Error('Invalid permanent token provided');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`/api/resume/${permanentToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new ResumeApiError(
            errorData.error || 'Failed to fetch resume',
            response.status,
            errorData.code
          );
        }

        const data: ResumeApiResponse = await response.json();
        
        // Validate response structure
        this.validateResumeResponse(data);
        
        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        
        // Don't retry on client errors (4xx) or validation errors
        if (error instanceof ResumeApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Resume fetch attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Validate the structure of the resume API response
   */
  private static validateResumeResponse(data: ResumeApiResponse): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: not an object');
    }

    if (data.success !== true) {
      throw new Error('Response indicates failure');
    }

    // Check for required fields
    const requiredFields = ['pdf_signed_url', 'resume_name'];
    for (const field of requiredFields) {
      if (!data[field as keyof ResumeApiResponse]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate PDF URL format
    if (typeof data.pdf_signed_url !== 'string' || !this.isValidUrl(data.pdf_signed_url)) {
      throw new Error('Invalid PDF URL format');
    }
  }

  /**
   * Check if a string is a valid URL
   */
  private static isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Check if a PDF URL is accessible
   */
  static async checkPdfAccessibility(pdfUrl: string): Promise<boolean> {
    try {
      const response = await fetch(pdfUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get appropriate error message for display
   */
  static getDisplayErrorMessage(error: unknown): string {
    if (error instanceof ResumeApiError) {
      switch (error.code) {
        case 'RESUME_NOT_FOUND':
          return 'Resume not found. The link may have expired or been removed.';
        case 'ACCESS_DENIED':
          return 'Access denied. You may not have permission to view this resume.';
        case 'INVALID_TOKEN':
          return 'Invalid link format. Please check the URL and try again.';
        case 'TIMEOUT':
          return 'Request timed out. Please check your connection and try again.';
        case 'NETWORK_ERROR':
          return 'Network error. Please check your internet connection.';
        default:
          return error.message || 'An error occurred while loading the resume.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Custom error class for Resume API errors
 */
export class ResumeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ResumeApiError';
  }
}
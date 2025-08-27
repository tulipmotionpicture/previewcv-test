import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';
import { ResumeApiResponse, ErrorResponse, AccessLog } from '@/types';
import { 
  validatePermanentToken, 
  getClientIP, 
  getSecurityHeaders,
  getCORSHeaders,
  sanitizeInput,
  logSecurityEvent
} from '@/utils/security';

/**
 * GET /api/resume/[token] - Fetch resume data by permanent token
 * This route acts as a proxy to the main resume API service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const startTime = Date.now();
  const { token } = await params;
  
  // Get client information using security utilities
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin');

  // Sanitize token input
  const sanitizedToken = sanitizeInput(token || '');
  
  // Enhanced token validation using security utilities
  const tokenValidation = validatePermanentToken(sanitizedToken);
  if (!tokenValidation.isValid) {
    const error: ErrorResponse = {
      success: false,
      error: tokenValidation.error || 'Invalid token',
      code: 'INVALID_TOKEN'
    };
    
    logSecurityEvent({
      type: 'suspicious_request',
      severity: 'medium',
      clientIP,
      userAgent,
      details: {
        error: tokenValidation.error,
        tokenLength: token?.length || 0,
        endpoint: 'resume-fetch'
      }
    });
    
    logAccess(sanitizedToken, false, clientIP, userAgent, tokenValidation.error);
    
    return NextResponse.json(error, { 
      status: 400,
      headers: {
        ...getSecurityHeaders(),
        ...getCORSHeaders(origin)
      }
    });
  }

  // Validate API configuration
  if (!config.api.apiToken) {
    console.error('Missing SHARED_LINK_API_TOKEN in environment configuration');
    const error: ErrorResponse = {
      success: false,
      error: 'Service configuration error',
      code: 'CONFIG_ERROR'
    };
    return NextResponse.json(error, { status: 500 });
  }

  try {
    // Make request to main API service
    const apiUrl = `${config.api.baseUrl}/api/v1/shared/public/resume/${token}`;
    
    console.log(`Fetching resume data from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-Token': config.api.apiToken,
        'Content-Type': 'application/json',
        'User-Agent': `PreviewCV/1.0 (${userAgent})`,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;
    console.log(`API response received in ${responseTime}ms with status: ${response.status}`);

    // Parse response data
    let data: ResumeApiResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      const error: ErrorResponse = {
        success: false,
        error: 'Invalid response from resume service',
        code: 'PARSE_ERROR'
      };
      logAccess(token, false, clientIP, userAgent, 'Parse error');
      return NextResponse.json(error, { status: 502 });
    }

    // Handle API response based on status
    if (response.ok && data.success) {
      // Successful response
      logAccess(sanitizedToken, true, clientIP, userAgent, 'Success', responseTime);
      
      // Enhanced security headers
      const headers = new Headers({
        ...getSecurityHeaders(),
        ...getCORSHeaders(origin),
        'Cache-Control': 'private, max-age=300', // 5 minute cache
        'X-Response-Time': `${responseTime}ms`,
        'X-Content-Source': 'resume-api',
      });

      return NextResponse.json(data, { status: 200, headers });
    } else {
      // API returned error
      console.error(`API error for token ${token}:`, data);
      
      const statusCode = response.status === 404 ? 404 : response.status === 401 ? 403 : 400;
      const errorMessage = data.error || 'Resume not found or access denied';
      
      const error: ErrorResponse = {
        success: false,
        error: errorMessage,
        code: response.status === 404 ? 'RESUME_NOT_FOUND' : 'ACCESS_DENIED'
      };

      logAccess(sanitizedToken, false, clientIP, userAgent, errorMessage);
      
      return NextResponse.json(error, { 
        status: statusCode,
        headers: {
          ...getSecurityHeaders(),
          ...getCORSHeaders(origin)
        }
      });
    }

  } catch (fetchError) {
    console.error(`Network error fetching resume ${sanitizedToken}:`, fetchError);
    
    const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
    const error: ErrorResponse = {
      success: false,
      error: isTimeout ? 'Request timeout - please try again' : 'Failed to connect to resume service',
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      details: config.app.nodeEnv === 'development' ? {
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      } : undefined
    };

    logAccess(sanitizedToken, false, clientIP, userAgent, error.error);
    
    // Log network errors for monitoring
    logSecurityEvent({
      type: 'suspicious_request',
      severity: 'low',
      clientIP,
      userAgent,
      details: {
        error: error.error,
        isTimeout,
        endpoint: 'resume-fetch',
        originalError: fetchError instanceof Error ? fetchError.message : 'Unknown'
      }
    });
    
    return NextResponse.json(error, { 
      status: isTimeout ? 408 : 502,
      headers: {
        ...getSecurityHeaders(),
        ...getCORSHeaders(origin)
      }
    });
  }
}

/**
 * Log access attempts for monitoring and security
 */
function logAccess(
  permanentToken: string, 
  success: boolean, 
  ipAddress: string, 
  userAgent: string,
  details?: string,
  responseTime?: number
) {
  const logEntry: AccessLog & { details?: string; responseTime?: number } = {
    timestamp: new Date().toISOString(),
    permanentToken: permanentToken.substring(0, 8) + '...', // Only log first 8 chars for privacy
    apiTokenPrefix: config.api.apiToken.substring(0, 10) + '...',
    success,
    ipAddress,
    userAgent,
    details,
    responseTime
  };

  // Log to console (in production, you might want to use a proper logging service)
  const logLevel = success ? 'info' : 'warn';
  console[logLevel]('Resume access attempt:', JSON.stringify(logEntry));

  // In a production environment, you might want to:
  // 1. Send logs to a logging service (e.g., CloudWatch, Datadog)
  // 2. Store in a database for analytics
  // 3. Send to monitoring systems for alerts
}

// Handle OPTIONS request for CORS with enhanced security
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        ...getCORSHeaders(origin),
        ...getSecurityHeaders(),
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    }
  );
}
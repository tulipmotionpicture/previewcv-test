import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  getSecurityHeaders, 
  getCORSHeaders, 
  validateRequest,
  logSecurityEvent,
  getClientIP
} from '@/utils/security';
import {
  rateLimit,
  getRateLimitConfig,
  generateRateLimitKey,
  getRateLimitHeaders,
  logRateLimitEvent
} from '@/utils/rateLimit';
import { logAccess } from '@/utils/accessLogging';

/**
 * Middleware function to apply security measures globally
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin');

  // Start timing for performance monitoring
  const startTime = Date.now();

  try {
    // Apply security validation for all requests
    // Note: Don't require API tokens for internal Next.js API routes
    const validation = validateRequest(request, false);
    
    if (!validation.isValid) {
      // Log security violation
      logAccess({
        method,
        path: pathname,
        statusCode: validation.status || 400,
        responseTime: Date.now() - startTime,
        clientIP,
        userAgent,
        success: false,
        error: validation.error,
        securityViolation: true
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error,
          code: 'SECURITY_VIOLATION'
        },
        { 
          status: validation.status || 400,
          headers: {
            ...getSecurityHeaders(),
            ...getCORSHeaders(origin)
          }
        }
      );
    }

    // Apply rate limiting
    const rateLimitConfig = getRateLimitConfig(pathname);
    const rateLimitKey = generateRateLimitKey(clientIP, pathname);
    const rateLimitResult = rateLimit(rateLimitKey, rateLimitConfig);
    
    // Log rate limit check
    logRateLimitEvent({
      identifier: rateLimitKey,
      endpoint: pathname,
      allowed: rateLimitResult.allowed,
      count: rateLimitConfig.maxRequests - rateLimitResult.remaining,
      limit: rateLimitResult.limit,
      resetTime: rateLimitResult.resetTime,
      userAgent
    });
    
    if (!rateLimitResult.allowed) {
      // Log rate limit violation
      logAccess({
        method,
        path: pathname,
        statusCode: 429,
        responseTime: Date.now() - startTime,
        clientIP,
        userAgent,
        success: false,
        error: 'Rate limit exceeded',
        rateLimited: true
      });
      
      return NextResponse.json(
        {
          success: false,
          error: rateLimitConfig.message || 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            ...getCORSHeaders(origin),
            ...getRateLimitHeaders(rateLimitResult)
          }
        }
      );
    }

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          ...getCORSHeaders(origin),
          'Access-Control-Max-Age': '86400' // 24 hours
        }
      });
    }

    // Create response with security headers
    const response = NextResponse.next();
    
    // Apply security headers to all responses
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Apply CORS headers
    const corsHeaders = getCORSHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Apply rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add performance timing header
    const responseTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    
    // Add security identifier
    response.headers.set('X-Security-Version', 'PreviewCV-v1.0');
    
    // Remove potentially revealing headers
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    // Log successful request
    logAccess({
      method,
      path: pathname,
      statusCode: 200, // Assume success for non-error responses
      responseTime,
      clientIP,
      userAgent,
      success: true,
      rateLimited: false,
      referer: request.headers.get('referer') || undefined
    });

    // Log successful security validation (only for API routes in production)
    if (pathname.startsWith('/api/') && process.env.NODE_ENV === 'production') {
      console.info('Security middleware: Request validated', {
        method,
        pathname,
        clientIP,
        userAgent: userAgent.substring(0, 50) + '...',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    return response;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log security middleware errors
    logSecurityEvent({
      type: 'suspicious_request',
      severity: 'high',
      clientIP,
      userAgent,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        pathname,
        method,
        middlewareError: true,
        responseTime
      }
    });

    // Log middleware error
    logAccess({
      method,
      path: pathname,
      statusCode: 500,
      responseTime,
      clientIP,
      userAgent,
      success: false,
      error: 'Middleware error',
      securityViolation: true
    });

    console.error('Security middleware error:', error);

    // Return safe error response
    return NextResponse.json(
      {
        success: false,
        error: 'Security validation failed',
        code: 'MIDDLEWARE_ERROR'
      },
      {
        status: 500,
        headers: {
          ...getSecurityHeaders(),
          'X-Error-ID': `mw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      }
    );
  }
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Additional security configuration that can be imported
 */
export const securityConfig = {
  // Rate limiting configuration
  rateLimit: {
    // API routes: stricter limits
    '/api/': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // requests per window
    },
    // Resume viewing: moderate limits
    '/resume/view/': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // requests per minute
    },
    // Default: lenient limits
    default: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // requests per minute
    }
  },
  
  // Trusted proxy configuration (for production deployment)
  trustedProxies: [
    '127.0.0.1',
    '::1',
    // Add your load balancer/proxy IPs here in production
  ],
  
  // Content Security Policy configuration
  csp: {
    // Domains that are allowed to load resources
    allowedDomains: [
      'self',
      '*.b-cdn.net', // Bunny CDN
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ]
  }
};
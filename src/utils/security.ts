/**
 * Security Utilities
 * Enhanced security measures for the PreviewCV application
 */

import { NextRequest } from 'next/server';
import config from '@/config';

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  apiToken: {
    required: boolean;
    minLength: number;
    prefix: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
  headers: {
    contentSecurityPolicy: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
  };
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  apiToken: {
    required: true,
    minLength: 32,
    prefix: 'sk_live_'
  },
  rateLimit: {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.requestsPerHour,
    skipSuccessfulRequests: false
  },
  cors: {
    allowedOrigins: ['*'], // In production, specify exact origins
    allowedMethods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Token']
  },
  headers: {
    contentSecurityPolicy: true,
    xFrameOptions: true,
    xContentTypeOptions: true,
    referrerPolicy: true
  }
};

/**
 * Validate API token format and authenticity
 */
export function validateApiToken(token: string | null): {
  isValid: boolean;
  error?: string;
} {
  if (!token) {
    return {
      isValid: false,
      error: 'Missing API token'
    };
  }

  // Check minimum length
  if (token.length < defaultSecurityConfig.apiToken.minLength) {
    return {
      isValid: false,
      error: 'API token too short'
    };
  }

  // Check prefix
  if (!token.startsWith(defaultSecurityConfig.apiToken.prefix)) {
    return {
      isValid: false,
      error: 'Invalid API token format'
    };
  }

  // Constant-time comparison to prevent timing attacks
  const expectedToken = config.api.apiToken;
  if (!constantTimeEqual(token, expectedToken)) {
    return {
      isValid: false,
      error: 'Invalid API token'
    };
  }

  return { isValid: true };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Extract client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIp = request.headers.get('x-client-ip');

  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }

  return realIp || cfConnectingIp || xClientIp || 'unknown';
}

/**
 * Validate permanent token format
 */
export function validatePermanentToken(token: string): {
  isValid: boolean;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid token'
    };
  }

  // Basic format validation
  if (token.length < 10 || token.length > 100) {
    return {
      isValid: false,
      error: 'Invalid token length'
    };
  }

  // Check for potentially malicious characters
  const allowedPattern = /^[a-zA-Z0-9_-]+$/;
  if (!allowedPattern.test(token)) {
    return {
      isValid: false,
      error: 'Invalid token format'
    };
  }

  return { isValid: true };
}

/**
 * Generate security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (defaultSecurityConfig.headers.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for PDF viewers
      "style-src 'self' 'unsafe-inline'", // Allow inline styles
      "img-src 'self' data: https:", // Allow images from CDN
      "font-src 'self' https:",
      "connect-src 'self' https:", // Allow API calls
      "frame-src 'self' https:", // Allow PDF embedding
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  if (defaultSecurityConfig.headers.xFrameOptions) {
    headers['X-Frame-Options'] = 'SAMEORIGIN';
  }

  if (defaultSecurityConfig.headers.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  if (defaultSecurityConfig.headers.referrerPolicy) {
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  }

  // Additional security headers
  headers['X-DNS-Prefetch-Control'] = 'off';
  headers['X-Download-Options'] = 'noopen';
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';
  headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

  return headers;
}

/**
 * Check if origin is allowed (CORS)
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests without origin (e.g., direct access)
  
  const allowedOrigins = defaultSecurityConfig.cors.allowedOrigins;
  
  // Allow all origins if '*' is in the list
  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Generate CORS headers
 */
export function getCORSHeaders(origin?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': defaultSecurityConfig.cors.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': defaultSecurityConfig.cors.allowedHeaders.join(', '),
    'Access-Control-Max-Age': '86400' // 24 hours
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  } else if (isOriginAllowed(null)) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Log security events for monitoring
 */
export interface SecurityEvent {
  type: 'invalid_token' | 'rate_limit_exceeded' | 'suspicious_request' | 'cors_violation';
  severity: 'low' | 'medium' | 'high';
  clientIP: string;
  userAgent?: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date()
  };

  const logLevel = event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warn' : 'info';
  
  console[logLevel](`SECURITY EVENT [${event.type.toUpperCase()}]:`, {
    ...fullEvent,
    timestamp: fullEvent.timestamp.toISOString()
  });

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to security monitoring service
    // securityMonitor.reportEvent(fullEvent);
  }
}

/**
 * Middleware for request validation
 */
export function validateRequest(request: NextRequest, requireApiToken = false) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal
    /<script/i, // XSS attempt
    /union.*select/i, // SQL injection
    /javascript:/i // JavaScript protocol
  ];

  const url = request.url;
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (isSuspicious) {
    logSecurityEvent({
      type: 'suspicious_request',
      severity: 'high',
      clientIP,
      userAgent,
      details: {
        url,
        method: request.method,
        reason: 'Suspicious URL pattern detected'
      }
    });
    
    return {
      isValid: false,
      error: 'Invalid request format',
      status: 400
    };
  }

  // Validate API token if required
  if (requireApiToken) {
    const apiToken = request.headers.get('X-API-Token');
    const tokenValidation = validateApiToken(apiToken);
    
    if (!tokenValidation.isValid) {
      logSecurityEvent({
        type: 'invalid_token',
        severity: 'medium',
        clientIP,
        userAgent,
        details: {
          error: tokenValidation.error,
          hasToken: !!apiToken,
          tokenPrefix: apiToken?.substring(0, 10)
        }
      });
      
      return {
        isValid: false,
        error: tokenValidation.error,
        status: 401
      };
    }
  }

  return { isValid: true };
}
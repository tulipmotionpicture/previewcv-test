/**
 * Access Logging System
 * Comprehensive logging with structured data and analytics
 */

export interface AccessLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  clientIP: string;
  userAgent: string;
  permanentToken?: string;
  success: boolean;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  referer?: string;
  country?: string;
  session?: {
    id: string;
    duration: number;
    pageViews: number;
  };
  security?: {
    rateLimited: boolean;
    securityViolation: boolean;
    threatLevel: 'none' | 'low' | 'medium' | 'high';
  };
  performance?: {
    dnsLookup?: number;
    tcpConnection?: number;
    tlsHandshake?: number;
    serverProcessing: number;
  };
}

export interface AccessLogFilter {
  startTime?: Date;
  endTime?: Date;
  clientIP?: string;
  statusCode?: number;
  success?: boolean;
  path?: string;
  minResponseTime?: number;
  maxResponseTime?: number;
  threatLevel?: 'none' | 'low' | 'medium' | 'high';
}

export interface AccessLogStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uniqueIPs: number;
  topPaths: Array<{ path: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  statusCodes: Record<number, number>;
  timeRange: {
    start: Date;
    end: Date;
    duration: number;
  };
  security: {
    rateLimitedRequests: number;
    securityViolations: number;
    threatLevels: Record<string, number>;
  };
}

/**
 * In-memory access log store
 */
class AccessLogStore {
  private logs: AccessLogEntry[] = [];
  private maxLogs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxLogs = 10000) {
    this.maxLogs = maxLogs;
    
    // Cleanup old logs every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  add(entry: AccessLogEntry): void {
    this.logs.push(entry);
    
    // Remove oldest logs if we exceed the limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  get(filter?: AccessLogFilter): AccessLogEntry[] {
    let filtered = this.logs;

    if (filter) {
      filtered = filtered.filter(log => {
        if (filter.startTime && log.timestamp < filter.startTime) return false;
        if (filter.endTime && log.timestamp > filter.endTime) return false;
        if (filter.clientIP && log.clientIP !== filter.clientIP) return false;
        if (filter.statusCode && log.statusCode !== filter.statusCode) return false;
        if (filter.success !== undefined && log.success !== filter.success) return false;
        if (filter.path && !log.path.includes(filter.path)) return false;
        if (filter.minResponseTime && log.responseTime < filter.minResponseTime) return false;
        if (filter.maxResponseTime && log.responseTime > filter.maxResponseTime) return false;
        if (filter.threatLevel && log.security?.threatLevel !== filter.threatLevel) return false;
        return true;
      });
    }

    return filtered;
  }

  getStats(filter?: AccessLogFilter): AccessLogStats {
    const logs = this.get(filter);
    
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        uniqueIPs: 0,
        topPaths: [],
        topUserAgents: [],
        statusCodes: {},
        timeRange: {
          start: new Date(),
          end: new Date(),
          duration: 0
        },
        security: {
          rateLimitedRequests: 0,
          securityViolations: 0,
          threatLevels: {}
        }
      };
    }

    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;
    
    const uniqueIPs = new Set(logs.map(log => log.clientIP)).size;
    
    // Count paths
    const pathCounts = logs.reduce((acc, log) => {
      acc[log.path] = (acc[log.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Count user agents
    const userAgentCounts = logs.reduce((acc, log) => {
      const ua = log.userAgent.substring(0, 50); // Truncate for readability
      acc[ua] = (acc[ua] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topUserAgents = Object.entries(userAgentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userAgent, count]) => ({ userAgent, count }));

    // Count status codes
    const statusCodes = logs.reduce((acc, log) => {
      acc[log.statusCode] = (acc[log.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Time range
    const timestamps = logs.map(log => log.timestamp.getTime());
    const start = new Date(Math.min(...timestamps));
    const end = new Date(Math.max(...timestamps));
    const duration = end.getTime() - start.getTime();

    // Security stats
    const rateLimitedRequests = logs.filter(log => log.security?.rateLimited).length;
    const securityViolations = logs.filter(log => log.security?.securityViolation).length;
    
    const threatLevels = logs.reduce((acc, log) => {
      const level = log.security?.threatLevel || 'none';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      uniqueIPs,
      topPaths,
      topUserAgents,
      statusCodes,
      timeRange: { start, end, duration },
      security: {
        rateLimitedRequests,
        securityViolations,
        threatLevels
      }
    };
  }

  private cleanup(): void {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => log.timestamp > twentyFourHoursAgo);
  }

  clear(): void {
    this.logs = [];
  }

  getSize(): number {
    return this.logs.length;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global access log store
const globalLogStore = new AccessLogStore();

/**
 * Generate unique ID for log entry
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine threat level based on request characteristics
 */
function determineThreatLevel(
  path: string,
  userAgent: string,
  statusCode: number,
  responseTime: number
): 'none' | 'low' | 'medium' | 'high' {
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal
    /<script/i, // XSS attempt
    /union.*select/i, // SQL injection
    /javascript:/i // JavaScript protocol
  ];

  const isSuspiciousPath = suspiciousPatterns.some(pattern => pattern.test(path));
  const isSuspiciousUA = /bot|crawler|spider|scan/i.test(userAgent) && !/googlebot|bingbot/i.test(userAgent);
  const isErrorResponse = statusCode >= 400;
  const isSlowResponse = responseTime > 10000;

  if (isSuspiciousPath) return 'high';
  if (isSuspiciousUA && isErrorResponse) return 'medium';
  if (isErrorResponse && isSlowResponse) return 'medium';
  if (isSuspiciousUA || isErrorResponse) return 'low';
  
  return 'none';
}

/**
 * Log access event
 */
export function logAccess({
  method,
  path,
  statusCode,
  responseTime,
  clientIP,
  userAgent,
  permanentToken,
  success,
  error,
  requestSize,
  responseSize,
  referer,
  rateLimited = false,
  securityViolation = false
}: {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  clientIP: string;
  userAgent: string;
  permanentToken?: string;
  success: boolean;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  referer?: string;
  rateLimited?: boolean;
  securityViolation?: boolean;
}): void {
  const threatLevel = determineThreatLevel(path, userAgent, statusCode, responseTime);
  
  const logEntry: AccessLogEntry = {
    id: generateLogId(),
    timestamp: new Date(),
    method,
    path,
    statusCode,
    responseTime,
    clientIP,
    userAgent,
    permanentToken: permanentToken ? permanentToken.substring(0, 8) + '...' : undefined,
    success,
    error,
    requestSize,
    responseSize,
    referer,
    security: {
      rateLimited,
      securityViolation,
      threatLevel
    },
    performance: {
      serverProcessing: responseTime
    }
  };

  // Add to store
  globalLogStore.add(logEntry);

  // Console logging based on severity
  const logLevel = 
    threatLevel === 'high' ? 'error' :
    threatLevel === 'medium' ? 'warn' :
    statusCode >= 400 ? 'warn' : 'info';

  const logMessage = {
    id: logEntry.id,
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    clientIP,
    success,
    threatLevel,
    timestamp: logEntry.timestamp.toISOString()
  };

  console[logLevel]('ACCESS LOG:', logMessage);

  // In production, send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to logging service (CloudWatch, Datadog, etc.)
    // loggingService.send(logEntry);
  }
}

/**
 * Get access logs with filtering
 */
export function getAccessLogs(filter?: AccessLogFilter): AccessLogEntry[] {
  return globalLogStore.get(filter);
}

/**
 * Get access log statistics
 */
export function getAccessLogStats(filter?: AccessLogFilter): AccessLogStats {
  return globalLogStore.getStats(filter);
}

/**
 * Get recent access logs (last N entries)
 */
export function getRecentAccessLogs(count = 100): AccessLogEntry[] {
  const logs = globalLogStore.get();
  return logs.slice(-count).reverse(); // Most recent first
}

/**
 * Clear access logs (for testing/maintenance)
 */
export function clearAccessLogs(): void {
  globalLogStore.clear();
  console.info('Access logs cleared');
}

/**
 * Get access log store size
 */
export function getAccessLogSize(): number {
  return globalLogStore.getSize();
}

/**
 * Export log data (for backup/analysis)
 */
export function exportAccessLogs(filter?: AccessLogFilter): string {
  const logs = globalLogStore.get(filter);
  return JSON.stringify(logs, null, 2);
}

/**
 * Get suspicious activity summary
 */
export function getSuspiciousActivity(): {
  highThreatRequests: AccessLogEntry[];
  frequentFailedIPs: Array<{ ip: string; failures: number }>;
  unusualUserAgents: Array<{ userAgent: string; requests: number }>;
} {
  const logs = globalLogStore.get();
  
  const highThreatRequests = logs.filter(log => log.security?.threatLevel === 'high');
  
  // Find IPs with many failed requests
  const failedByIP = logs
    .filter(log => !log.success)
    .reduce((acc, log) => {
      acc[log.clientIP] = (acc[log.clientIP] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const frequentFailedIPs = Object.entries(failedByIP)
    .filter(([, count]) => count >= 5)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, failures]) => ({ ip, failures }));
  
  // Find unusual user agents
  const uaByCounts = logs.reduce((acc, log) => {
    const ua = log.userAgent.substring(0, 100);
    acc[ua] = (acc[ua] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const unusualUserAgents = Object.entries(uaByCounts)
    .filter(([ua]) => /bot|crawler|spider|scan/i.test(ua) && !/googlebot|bingbot/i.test(ua))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userAgent, requests]) => ({ userAgent, requests }));

  return {
    highThreatRequests,
    frequentFailedIPs,
    unusualUserAgents
  };
}

// Export store for advanced usage
export { globalLogStore as accessLogStore };
/**
 * Rate Limiting System
 * In-memory rate limiting with configurable windows and limits
 */

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessful?: boolean;
  skipFailed?: boolean;
  message?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * In-memory rate limit storage
 */
class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now >= existing.resetTime) {
      // Create new entry or reset expired entry
      const entry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
      return entry;
    }

    // Increment existing entry
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  getStats(): { totalKeys: number; memoryUsage: number } {
    return {
      totalKeys: this.store.size,
      memoryUsage: JSON.stringify([...this.store.entries()]).length
    };
  }

  clear(): void {
    this.store.clear();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global rate limit store instance
const globalStore = new RateLimitStore();

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // API endpoints - strict limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests. Please try again later.'
  },
  
  // Resume viewing - moderate limits
  resume: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many resume requests. Please wait a moment.'
  },
  
  // General requests - lenient limits
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Rate limit exceeded. Please slow down.'
  },
  
  // Authentication-related - very strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please wait 15 minutes.'
  }
};

/**
 * Apply rate limiting to a request
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig,
  store: RateLimitStore = globalStore
): RateLimitResult {
  const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
  const entry = store.increment(key, config.windowMs);
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  const result: RateLimitResult = {
    allowed,
    limit: config.maxRequests,
    remaining,
    resetTime: entry.resetTime
  };

  if (!allowed) {
    result.retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
  }

  return result;
}

/**
 * Generate rate limit key based on IP and endpoint
 */
export function generateRateLimitKey(ip: string, endpoint?: string): string {
  const sanitizedIP = ip.replace(/[^a-zA-Z0-9.-]/g, '');
  return endpoint ? `${sanitizedIP}:${endpoint}` : sanitizedIP;
}

/**
 * Get rate limit configuration for a given path
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.startsWith('/api/')) {
    return rateLimitConfigs.api;
  }
  
  if (path.startsWith('/resume/view/')) {
    return rateLimitConfigs.resume;
  }
  
  if (path.includes('/auth') || path.includes('/login')) {
    return rateLimitConfigs.auth;
  }
  
  return rateLimitConfigs.general;
}

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string): RateLimitResult => {
    return rateLimit(identifier, config);
  };
}

/**
 * Advanced rate limiting with multiple tiers
 */
export interface TieredRateLimitConfig {
  tiers: {
    level: string;
    windowMs: number;
    maxRequests: number;
  }[];
  escalationThreshold: number;
}

export function tieredRateLimit(
  identifier: string,
  config: TieredRateLimitConfig,
  store: RateLimitStore = globalStore
): RateLimitResult & { tier: string } {
  // Check each tier from most restrictive to least
  for (const tier of config.tiers) {
    const key = `${identifier}:${tier.level}`;
    const result = rateLimit(key, {
      windowMs: tier.windowMs,
      maxRequests: tier.maxRequests
    }, store);

    if (!result.allowed) {
      return {
        ...result,
        tier: tier.level
      };
    }
  }

  // All tiers passed
  const firstTier = config.tiers[0];
  return {
    allowed: true,
    limit: firstTier.maxRequests,
    remaining: firstTier.maxRequests - 1,
    resetTime: Date.now() + firstTier.windowMs,
    tier: firstTier.level
  };
}

/**
 * Rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Log rate limiting events
 */
export interface RateLimitEvent {
  identifier: string;
  endpoint: string;
  allowed: boolean;
  count: number;
  limit: number;
  resetTime: number;
  userAgent?: string;
  timestamp: Date;
}

export function logRateLimitEvent(event: Omit<RateLimitEvent, 'timestamp'>): void {
  const fullEvent: RateLimitEvent = {
    ...event,
    timestamp: new Date()
  };

  const logLevel = event.allowed ? 'info' : 'warn';
  const message = event.allowed 
    ? `Rate limit check passed: ${event.count}/${event.limit}`
    : `Rate limit exceeded: ${event.count}/${event.limit}`;

  console[logLevel](`RATE LIMIT [${event.endpoint}]:`, {
    ...fullEvent,
    message,
    timestamp: fullEvent.timestamp.toISOString()
  });

  // In production, send to monitoring service
  if (!event.allowed && process.env.NODE_ENV === 'production') {
    // Example: Send rate limit violation to monitoring service
    // monitoringService.reportRateLimit(fullEvent);
  }
}

/**
 * Rate limit bypass for trusted sources
 */
export interface BypassConfig {
  trustedIPs: string[];
  trustedTokens: string[];
  bypassHeader: string;
}

export function shouldBypassRateLimit(
  identifier: string,
  config: BypassConfig,
  headers: Record<string, string | null>
): boolean {
  // Check trusted IPs
  if (config.trustedIPs.includes(identifier)) {
    return true;
  }

  // Check bypass header
  const bypassValue = headers[config.bypassHeader.toLowerCase()];
  if (bypassValue && config.trustedTokens.includes(bypassValue)) {
    return true;
  }

  return false;
}

/**
 * Get rate limit store statistics
 */
export function getRateLimitStats(): {
  totalKeys: number;
  memoryUsage: number;
  uptime: number;
} {
  return {
    ...globalStore.getStats(),
    uptime: Date.now() // Use Date.now() instead of process.uptime() for Edge Runtime
  };
}

/**
 * Clear all rate limit data (for testing or maintenance)
 */
export function clearRateLimitData(): void {
  globalStore.clear();
  console.info('Rate limit data cleared');
}

// Export the store for advanced usage
export { globalStore as rateLimitStore };
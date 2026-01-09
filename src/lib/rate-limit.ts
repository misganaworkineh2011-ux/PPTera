/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  // No existing entry or window expired - create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }
  
  // Within window - check count
  if (entry.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Preset configurations
export const RATE_LIMITS = {
  // Public forms - 5 requests per minute
  PUBLIC_FORM: { maxRequests: 5, windowMs: 60 * 1000 },
  // Newsletter - 3 per hour
  NEWSLETTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  // Contact form - 3 per hour
  CONTACT: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  // AI generation - 10 per minute
  AI_GENERATION: { maxRequests: 10, windowMs: 60 * 1000 },
  // General API - 100 per minute
  API: { maxRequests: 100, windowMs: 60 * 1000 },
} as const;

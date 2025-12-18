/**
 * Server-side in-memory cache for reducing database calls
 * Used for data that doesn't change frequently (themes, static content)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ServerCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const serverCache = new ServerCache();

// Cache TTL constants for server-side caching
export const SERVER_CACHE_TTL = {
  THEMES: 5 * 60 * 1000,        // 5 minutes
  INSPIRATION: 10 * 60 * 1000,  // 10 minutes
  INSIGHTS: 10 * 60 * 1000,     // 10 minutes
  STATIC: 30 * 60 * 1000,       // 30 minutes
} as const;

/**
 * Helper to wrap database queries with caching
 */
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = serverCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute query
  const result = await queryFn();
  
  // Cache result
  serverCache.set(key, result, ttl);
  
  return result;
}

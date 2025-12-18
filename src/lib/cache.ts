/**
 * Client-side caching utilities for reducing API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache TTL constants for different data types
export const CACHE_TTL = {
  USER_DATA: 2 * 60 * 1000,      // 2 minutes - user data changes frequently
  PRESENTATIONS: 5 * 60 * 1000,  // 5 minutes - presentations list
  THEMES: 10 * 60 * 1000,        // 10 minutes - themes rarely change
  STATIC: 30 * 60 * 1000,        // 30 minutes - static content
  DASHBOARD_INIT: 60 * 1000,     // 1 minute - combined dashboard data
} as const;

// Cache keys for consistent access
export const CACHE_KEYS = {
  DASHBOARD_INIT: "dashboard-init",
  USER_DATA: "user-data",
  PRESENTATIONS: "presentations",
  THEMES: "themes",
  ACTIVITIES: "activities",
} as const;

class ClientCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache data with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const clientCache = new ClientCache();

/**
 * Fetch with caching - wraps fetch with automatic caching
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheTTL?: number; cacheKey?: string }
): Promise<T> {
  const cacheKey = options?.cacheKey || url;
  const ttl = options?.cacheTTL || 5 * 60 * 1000;

  // Check cache first (only for GET requests)
  if (!options?.method || options.method === "GET") {
    const cached = clientCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from server
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the result (only for GET requests)
  if (!options?.method || options.method === "GET") {
    clientCache.set(cacheKey, data, ttl);
  }

  return data;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request deduplication - prevents duplicate concurrent requests
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const key = `${options?.method || "GET"}-${url}`;

  // Check if there's already a pending request
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  // Create new request
  const request = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

/**
 * Optimistic update helper - updates cache immediately and rolls back on failure
 */
export function createOptimisticUpdate<T>(cacheKey: string) {
  return {
    /**
     * Execute an optimistic update
     * @param currentData - Current cached data
     * @param optimisticData - Data to show immediately
     * @param apiCall - The actual API call to make
     * @param onSuccess - Callback on success with server response
     * @param onError - Callback on error (receives original data for rollback)
     */
    async execute(
      currentData: T,
      optimisticData: T,
      apiCall: () => Promise<Response>,
      onSuccess?: (serverData: unknown) => void,
      onError?: (originalData: T, error: Error) => void
    ): Promise<{ success: boolean; data?: unknown; error?: Error }> {
      // Immediately update cache with optimistic data
      clientCache.set(cacheKey, optimisticData, CACHE_TTL.PRESENTATIONS);

      try {
        const response = await apiCall();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();
        
        // Update cache with server response
        onSuccess?.(serverData);
        return { success: true, data: serverData };
      } catch (error) {
        // Rollback to original data
        clientCache.set(cacheKey, currentData, CACHE_TTL.PRESENTATIONS);
        onError?.(currentData, error as Error);
        return { success: false, error: error as Error };
      }
    },
  };
}

/**
 * Visibility-aware polling - pauses when tab is hidden
 */
export function createVisibilityAwareInterval(
  callback: () => void,
  interval: number
): () => void {
  let timerId: NodeJS.Timeout | null = null;
  let isVisible = typeof document !== "undefined" ? !document.hidden : true;

  const start = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (isVisible) callback();
    }, interval);
  };

  const handleVisibilityChange = () => {
    isVisible = !document.hidden;
    if (isVisible) {
      // Immediately fetch when becoming visible
      callback();
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  start();

  // Return cleanup function
  return () => {
    if (timerId) clearInterval(timerId);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

/**
 * Batch multiple requests into one
 */
export class RequestBatcher<T, R> {
  private queue: Array<{ key: T; resolve: (value: R) => void; reject: (error: Error) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (keys: T[]) => Promise<Map<T, R>>;
  private delay: number;

  constructor(batchFn: (keys: T[]) => Promise<Map<T, R>>, delay: number = 50) {
    this.batchFn = batchFn;
    this.delay = delay;
  }

  async load(key: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush(): Promise<void> {
    const batch = this.queue;
    this.queue = [];
    this.timeout = null;

    if (batch.length === 0) return;

    try {
      const keys = batch.map((item) => item.key);
      const results = await this.batchFn(keys);

      for (const item of batch) {
        const result = results.get(item.key);
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for key: ${item.key}`));
        }
      }
    } catch (error) {
      for (const item of batch) {
        item.reject(error as Error);
      }
    }
  }
}

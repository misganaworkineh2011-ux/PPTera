"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clientCache, deduplicatedFetch, CACHE_TTL, CACHE_KEYS, createVisibilityAwareInterval } from "~/lib/cache";

interface UseDashboardDataOptions<T> {
  /** API endpoint to fetch from */
  endpoint: string;
  /** Cache key (defaults to endpoint) */
  cacheKey?: string;
  /** Cache TTL in milliseconds (default: CACHE_TTL.PRESENTATIONS) */
  cacheTTL?: number;
  /** Initial data (for SSR) */
  initialData?: T;
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
  /** Transform response data */
  transform?: (data: unknown) => T;
  /** Enable stale-while-revalidate pattern */
  staleWhileRevalidate?: boolean;
}

interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  isStale: boolean;
}

/**
 * Optimized hook for fetching dashboard data with caching and deduplication
 * Now supports stale-while-revalidate pattern for better UX
 */
export function useDashboardData<T>({
  endpoint,
  cacheKey,
  cacheTTL = CACHE_TTL.PRESENTATIONS,
  initialData,
  fetchOnMount = true,
  deps = [],
  transform,
  staleWhileRevalidate = true,
}: UseDashboardDataOptions<T>): UseDashboardDataResult<T> {
  const key = cacheKey || endpoint;
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async (background = false) => {
    // Check cache first
    const cached = clientCache.get<T>(key);
    if (cached) {
      setData(cached);
      if (!background) setLoading(false);
      
      // If stale-while-revalidate is enabled and cache is getting old, refetch in background
      if (staleWhileRevalidate) {
        const now = Date.now();
        const cacheAge = now - lastFetchRef.current;
        if (cacheAge > cacheTTL * 0.7) {
          setIsStale(true);
          // Revalidate in background
          fetchData(true);
        }
      }
      return;
    }

    if (!background) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await deduplicatedFetch<unknown>(endpoint);
      const transformedData = transform ? transform(response) : (response as T);
      
      if (mountedRef.current) {
        setData(transformedData);
        clientCache.set(key, transformedData, cacheTTL);
        lastFetchRef.current = Date.now();
        setIsStale(false);
      }
    } catch (err) {
      if (mountedRef.current && !background) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current && !background) {
        setLoading(false);
      }
    }
  }, [endpoint, key, cacheTTL, transform, staleWhileRevalidate]);

  const invalidate = useCallback(() => {
    clientCache.invalidate(key);
    lastFetchRef.current = 0;
  }, [key]);

  const refetch = useCallback(async () => {
    invalidate();
    await fetchData();
  }, [invalidate, fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (fetchOnMount) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchOnMount, ...deps]);

  return { data, loading, error, refetch, invalidate, isStale };
}

/**
 * Hook for combined dashboard initialization
 * Fetches all dashboard data in a single request
 */
export function useDashboardInit() {
  return useDashboardData({
    endpoint: "/api/dashboard/init",
    cacheKey: CACHE_KEYS.DASHBOARD_INIT,
    cacheTTL: CACHE_TTL.DASHBOARD_INIT,
    staleWhileRevalidate: true,
  });
}

/**
 * Hook for paginated data with infinite scroll support
 */
interface UsePaginatedDataOptions<T> {
  endpoint: string;
  pageSize?: number;
  initialData?: T[];
}

interface UsePaginatedDataResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePaginatedData<T>({
  endpoint,
  pageSize = 20,
  initialData = [],
}: UsePaginatedDataOptions<T>): UsePaginatedDataResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  const fetchPage = useCallback(async (pageNum: number, append: boolean = false) => {
    const cacheKey = `${endpoint}-page-${pageNum}`;
    
    // Check cache
    const cached = clientCache.get<T[]>(cacheKey);
    if (cached) {
      if (append) {
        setData(prev => [...prev, ...cached]);
      } else {
        setData(cached);
      }
      setHasMore(cached.length === pageSize);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${endpoint}?page=${pageNum}&limit=${pageSize}`;
      const response = await deduplicatedFetch<{ data: T[]; hasMore: boolean }>(url);
      
      if (mountedRef.current) {
        const newData = response.data || [];
        clientCache.set(cacheKey, newData, 5 * 60 * 1000);
        
        if (append) {
          setData(prev => [...prev, ...newData]);
        } else {
          setData(newData);
        }
        setHasMore(response.hasMore ?? newData.length === pageSize);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, pageSize]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPage(nextPage, true);
  }, [loading, hasMore, page, fetchPage]);

  const refetch = useCallback(async () => {
    // Invalidate all pages
    clientCache.invalidatePattern(`${endpoint}-page-`);
    setPage(1);
    setData([]);
    await fetchPage(1, false);
  }, [endpoint, fetchPage]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (initialData.length === 0) {
      fetchPage(1, false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, error, hasMore, loadMore, refetch };
}

/**
 * Hook for real-time data with polling
 * OPTIMIZATION: Now uses visibility-aware polling to pause when tab is hidden
 */
interface UsePollingDataOptions<T> {
  endpoint: string;
  interval?: number;
  enabled?: boolean;
  initialData?: T;
}

export function usePollingData<T>({
  endpoint,
  interval = 30000,
  enabled = true,
  initialData,
}: UsePollingDataOptions<T>) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      fetchData();
      // OPTIMIZATION: Use visibility-aware interval that pauses when tab is hidden
      const cleanup = createVisibilityAwareInterval(fetchData, interval);
      return () => {
        cleanup();
        mountedRef.current = false;
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, interval, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

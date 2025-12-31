"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { clientCache, CACHE_TTL, CACHE_KEYS, deduplicatedFetch } from "~/lib/cache";

interface UserData {
  id: string;
  name: string;
  email: string;
  credits: number;
  subscriptionPlan: string | null;
  image: string | null;
}

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  slides: unknown[];
  shareToken?: string | null;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface DashboardInitData {
  user: UserData & { counts: { presentations: number; themes: number } };
  presentations: Presentation[];
  themes: unknown[];
  recentActivity: unknown[];
  pagination: PaginationInfo;
  meta: { timestamp: string; presentationCount: number; themeCount: number };
}

interface DashboardContextType {
  // User data
  user: UserData | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  
  // Credits management
  credits: number;
  updateCredits: (newCredits: number) => void;
  
  // Presentations
  presentations: Presentation[];
  setPresentations: React.Dispatch<React.SetStateAction<Presentation[]>>;
  
  // Presentation counts
  presentationCount: number;
  updatePresentationCount: (delta: number) => void;
  
  // Pagination
  pagination: PaginationInfo | null;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo | null>>;
  loadMorePresentations: () => Promise<void>;
  isLoadingMore: boolean;
  
  // Themes
  themes: unknown[];
  
  // Recent activity
  recentActivity: unknown[];
  
  // Global loading state
  isInitialized: boolean;
  
  // Full refresh
  refreshDashboard: () => Promise<void>;
  
  // Invalidate cache
  invalidateCache: (key?: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  initialUser?: UserData | null;
  initialPresentations?: Presentation[];
}

export function DashboardProvider({ children, initialUser, initialPresentations }: DashboardProviderProps) {
  const [user, setUser] = useState<UserData | null>(initialUser || null);
  const [userLoading, setUserLoading] = useState(!initialUser);
  const [credits, setCredits] = useState(initialUser?.credits || 0);
  const [presentations, setPresentations] = useState<Presentation[]>(initialPresentations || []);
  const [presentationCount, setPresentationCount] = useState(initialPresentations?.length || 0);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [themes, setThemes] = useState<unknown[]>([]);
  const [recentActivity, setRecentActivity] = useState<unknown[]>([]);
  const [isInitialized, setIsInitialized] = useState(!!initialUser);
  const mountedRef = useRef(true);

  // Load more presentations (pagination)
  const loadMorePresentations = useCallback(async () => {
    if (!pagination?.hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      // Use current presentations length as offset since SSR might have loaded more than the API limit
      const currentOffset = presentations.length;
      const response = await fetch(`/api/dashboard/init?presentationOffset=${currentOffset}&presentationLimit=12&themes=false&activity=false`);
      
      if (response.ok) {
        const data = await response.json();
        if (mountedRef.current) {
          // Append new presentations
          setPresentations(prev => [...prev, ...data.presentations]);
          // Update pagination with new offset
          setPagination({
            ...data.pagination,
            offset: currentOffset + data.presentations.length,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load more presentations:", error);
    } finally {
      if (mountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [pagination, isLoadingMore, presentations.length]);

  // Combined dashboard initialization - single API call
  const refreshDashboard = useCallback(async () => {
    // Check cache first (but with a shorter TTL check for navigation scenarios)
    const cached = clientCache.get<DashboardInitData>(CACHE_KEYS.DASHBOARD_INIT);
    if (cached && !userLoading) {
      setUser(cached.user);
      setCredits(cached.user.credits);
      setPresentations(cached.presentations);
      setPresentationCount(cached.meta.presentationCount);
      setPagination(cached.pagination);
      setThemes(cached.themes);
      setRecentActivity(cached.recentActivity);
      setUserLoading(false);
      setIsInitialized(true);
      return;
    }

    setUserLoading(true);
    try {
      // Use deduplicatedFetch to prevent duplicate requests
      const data = await deduplicatedFetch<DashboardInitData>("/api/dashboard/init");
      
      if (mountedRef.current) {
        setUser(data.user);
        setCredits(data.user.credits);
        setPresentations(data.presentations);
        setPresentationCount(data.meta.presentationCount);
        setPagination(data.pagination);
        setThemes(data.themes);
        setRecentActivity(data.recentActivity);
        
        // Cache the combined data
        clientCache.set(CACHE_KEYS.DASHBOARD_INIT, data, CACHE_TTL.DASHBOARD_INIT);
        // Also cache individual pieces for granular access
        clientCache.set(CACHE_KEYS.USER_DATA, data.user, CACHE_TTL.USER_DATA);
        clientCache.set(CACHE_KEYS.PRESENTATIONS, data.presentations, CACHE_TTL.PRESENTATIONS);
        clientCache.set(CACHE_KEYS.THEMES, data.themes, CACHE_TTL.THEMES);
      }
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
    } finally {
      if (mountedRef.current) {
        setUserLoading(false);
        setIsInitialized(true);
      }
    }
  }, [userLoading]);

  // Lightweight user refresh (for credit updates, etc.)
  const refreshUser = useCallback(async () => {
    const cached = clientCache.get<UserData>(CACHE_KEYS.USER_DATA);
    if (cached) {
      setUser(cached);
      setCredits(cached.credits);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    try {
      const response = await fetch("/api/user/me?include=basic");
      if (response.ok) {
        const data = await response.json();
        if (mountedRef.current) {
          setUser(data);
          setCredits(data.credits);
          clientCache.set(CACHE_KEYS.USER_DATA, data, CACHE_TTL.USER_DATA);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      if (mountedRef.current) {
        setUserLoading(false);
        setIsInitialized(true);
      }
    }
  }, []);

  const updateCredits = useCallback((newCredits: number) => {
    setCredits(newCredits);
    // Update both caches
    const cachedUser = clientCache.get<UserData>(CACHE_KEYS.USER_DATA);
    if (cachedUser) {
      clientCache.set(CACHE_KEYS.USER_DATA, { ...cachedUser, credits: newCredits }, CACHE_TTL.USER_DATA);
    }
    const cachedInit = clientCache.get<DashboardInitData>(CACHE_KEYS.DASHBOARD_INIT);
    if (cachedInit) {
      clientCache.set(CACHE_KEYS.DASHBOARD_INIT, {
        ...cachedInit,
        user: { ...cachedInit.user, credits: newCredits },
      }, CACHE_TTL.DASHBOARD_INIT);
    }
  }, []);

  const updatePresentationCount = useCallback((delta: number) => {
    setPresentationCount(prev => Math.max(0, prev + delta));
  }, []);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      clientCache.invalidate(key);
    } else {
      // Invalidate all dashboard-related caches
      clientCache.invalidate(CACHE_KEYS.DASHBOARD_INIT);
      clientCache.invalidate(CACHE_KEYS.USER_DATA);
      clientCache.invalidate(CACHE_KEYS.PRESENTATIONS);
      clientCache.invalidate(CACHE_KEYS.THEMES);
      clientCache.invalidate(CACHE_KEYS.ACTIVITIES);
    }
  }, []);

  // Initial fetch if no initial data provided via SSR
  // NOTE: We don't auto-fetch presentations here because the page component
  // will provide SSR data through the wrapper. This prevents overwriting
  // 50 SSR presentations with 12 API presentations.
  useEffect(() => {
    mountedRef.current = true;
    
    // Only fetch user data if not provided
    if (!initialUser) {
      refreshUser();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [initialUser, refreshUser]);

  return (
    <DashboardContext.Provider
      value={{
        user,
        userLoading,
        refreshUser,
        credits,
        updateCredits,
        presentations,
        setPresentations,
        presentationCount,
        updatePresentationCount,
        pagination,
        setPagination,
        loadMorePresentations,
        isLoadingMore,
        themes,
        recentActivity,
        isInitialized,
        refreshDashboard,
        invalidateCache,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

// Hook for just credits (lightweight)
export function useCredits() {
  const { credits, updateCredits } = useDashboard();
  return { credits, updateCredits };
}

// Hook for user data
export function useUserData() {
  const { user, userLoading, refreshUser } = useDashboard();
  return { user, loading: userLoading, refresh: refreshUser };
}

// Hook for presentations with optimistic updates
export function usePresentations() {
  const { presentations, setPresentations, invalidateCache, pagination, loadMorePresentations, isLoadingMore } = useDashboard();
  
  const updatePresentation = useCallback((id: string, updates: Partial<Presentation>) => {
    setPresentations(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, [setPresentations]);

  const removePresentation = useCallback((id: string) => {
    setPresentations(prev => prev.filter(p => p.id !== id));
  }, [setPresentations]);

  const addPresentation = useCallback((presentation: Presentation) => {
    setPresentations(prev => [presentation, ...prev]);
  }, [setPresentations]);

  return {
    presentations,
    updatePresentation,
    removePresentation,
    addPresentation,
    pagination,
    loadMore: loadMorePresentations,
    isLoadingMore,
    invalidateCache: () => invalidateCache(CACHE_KEYS.PRESENTATIONS),
  };
}

"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { clientCache } from "~/lib/cache";

interface UserData {
  id: string;
  name: string;
  email: string;
  credits: number;
  subscriptionPlan: string | null;
  image: string | null;
}

interface DashboardContextType {
  // User data
  user: UserData | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  
  // Credits management
  credits: number;
  updateCredits: (newCredits: number) => void;
  
  // Presentation counts
  presentationCount: number;
  updatePresentationCount: (delta: number) => void;
  
  // Global loading state
  isInitialized: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  initialUser?: UserData | null;
}

export function DashboardProvider({ children, initialUser }: DashboardProviderProps) {
  const [user, setUser] = useState<UserData | null>(initialUser || null);
  const [userLoading, setUserLoading] = useState(!initialUser);
  const [credits, setCredits] = useState(initialUser?.credits || 0);
  const [presentationCount, setPresentationCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(!!initialUser);
  const mountedRef = useRef(true);

  const refreshUser = useCallback(async () => {
    // Check cache first
    const cached = clientCache.get<UserData>("user-data");
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
          clientCache.set("user-data", data, 60 * 1000); // 1 minute cache
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
    // Update cache
    const cached = clientCache.get<UserData>("user-data");
    if (cached) {
      clientCache.set("user-data", { ...cached, credits: newCredits }, 60 * 1000);
    }
  }, []);

  const updatePresentationCount = useCallback((delta: number) => {
    setPresentationCount(prev => Math.max(0, prev + delta));
  }, []);

  // Initial fetch if no initial data
  useEffect(() => {
    mountedRef.current = true;
    
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
        presentationCount,
        updatePresentationCount,
        isInitialized,
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

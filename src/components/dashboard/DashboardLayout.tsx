"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Onboarding from "~/components/Onboarding";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  subscriptionPlan?: string | null;
  credits?: number;
  onSearch?: (query: string) => void;
}

const StickyContext = createContext<{
  isTitleSticky: boolean;
  setIsTitleSticky: (value: boolean) => void;
  stickyTitleContent: React.ReactNode | null;
  setStickyTitleContent: (content: React.ReactNode | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (value: boolean) => void;
  isDashboardNavigating: boolean;
  startDashboardNavigation: () => void;
}>({
  isTitleSticky: false,
  setIsTitleSticky: () => {},
  stickyTitleContent: null,
  setStickyTitleContent: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
  isDashboardNavigating: false,
  startDashboardNavigation: () => {},
});

export const useStickyContext = () => useContext(StickyContext);

export default function DashboardLayout({ children, subscriptionPlan, credits, onSearch }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTitleSticky, setIsTitleSticky] = useState(false);
  const [stickyTitleContent, setStickyTitleContent] = useState<React.ReactNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDashboardNavigating, setIsDashboardNavigating] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const startDashboardNavigation = () => {
    setIsDashboardNavigating(true);
  };

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsDashboardNavigating(false);
  }, [pathname]);

  // Listen for dashboard link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (!href) return;
      
      // Only handle dashboard internal navigation
      if (href.startsWith("/dashboard") && !href.startsWith("/dashboard/") === false) {
        const currentPath = window.location.pathname;
        if (href !== currentPath) {
          setIsDashboardNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Check if onboarding should be shown
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close mobile sidebar when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <StickyContext.Provider value={{ 
      isTitleSticky, 
      setIsTitleSticky, 
      stickyTitleContent, 
      setStickyTitleContent, 
      searchQuery, 
      setSearchQuery,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      isDashboardNavigating,
      startDashboardNavigation
    }}>
      <div className="flex h-screen bg-[#F8F9FA] dark:bg-zinc-900 font-sans selection:bg-[#06b6d4]/20 selection:text-[#1e3a8a]">
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - hidden on mobile, shown on lg+ */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto",
          "transform transition-transform duration-300 ease-in-out",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            subscriptionPlan={subscriptionPlan}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>
        
        <div className="flex flex-1 flex-col overflow-hidden w-full">
          <TopBar credits={credits} onSearch={handleSearch} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2 relative">
            {isDashboardNavigating ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <Onboarding
            userName={user?.firstName || undefined}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </StickyContext.Provider>
  );
}

"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Onboarding from "~/components/Onboarding";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";

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
}>({
  isTitleSticky: false,
  setIsTitleSticky: () => {},
  stickyTitleContent: null,
  setStickyTitleContent: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
});

export const useStickyContext = () => useContext(StickyContext);

export default function DashboardLayout({ children, subscriptionPlan, credits, onSearch }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTitleSticky, setIsTitleSticky] = useState(false);
  const [stickyTitleContent, setStickyTitleContent] = useState<React.ReactNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useUser();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Check if onboarding should be shown
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close mobile sidebar on resize
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
        
        {/* Floating toggle button - fixed position, always visible */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "hidden lg:flex fixed top-7 z-[100]",
            "w-7 h-7 items-center justify-center",
            "bg-white dark:bg-zinc-800 rounded-full",
            "border border-slate-200 dark:border-zinc-700",
            "shadow-lg hover:shadow-xl",
            "text-slate-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400",
            "transition-all duration-300 hover:scale-110",
            isSidebarCollapsed ? "left-[68px]" : "left-[270px]"
          )}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={cn(
              "transition-transform duration-200",
              isSidebarCollapsed ? "rotate-180" : ""
            )}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="flex flex-1 flex-col overflow-hidden w-full">
          <TopBar credits={credits} onSearch={handleSearch} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2 relative">
            {children}
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

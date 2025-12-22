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
      setIsMobileSidebarOpen
    }}>
      <div className="flex h-screen bg-[#F8F9FA] dark:bg-black font-sans selection:bg-[#06b6d4]/20 selection:text-[#1e3a8a]">
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
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2">
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

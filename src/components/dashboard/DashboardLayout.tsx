"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
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
}>({
  isTitleSticky: false,
  setIsTitleSticky: () => {},
  stickyTitleContent: null,
  setStickyTitleContent: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
});

export const useStickyContext = () => useContext(StickyContext);

export default function DashboardLayout({ children, subscriptionPlan, credits, onSearch }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTitleSticky, setIsTitleSticky] = useState(false);
  const [stickyTitleContent, setStickyTitleContent] = useState<React.ReactNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <StickyContext.Provider value={{ isTitleSticky, setIsTitleSticky, stickyTitleContent, setStickyTitleContent, searchQuery, setSearchQuery }}>
      <div className="flex h-screen bg-[#F8F9FA] font-sans selection:bg-[#06b6d4]/20 selection:text-[#1e3a8a]">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          subscriptionPlan={subscriptionPlan}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar credits={credits} onSearch={handleSearch} />
          <main className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
            {children}
          </main>
        </div>
      </div>
    </StickyContext.Provider>
  );
}

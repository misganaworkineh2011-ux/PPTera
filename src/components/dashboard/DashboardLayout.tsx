"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { cn } from "~/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const StickyContext = createContext<{
  isTitleSticky: boolean;
  setIsTitleSticky: (value: boolean) => void;
  stickyTitleContent: React.ReactNode | null;
  setStickyTitleContent: (content: React.ReactNode | null) => void;
}>({
  isTitleSticky: false,
  setIsTitleSticky: () => {},
  stickyTitleContent: null,
  setStickyTitleContent: () => {},
});

export const useStickyContext = () => useContext(StickyContext);

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTitleSticky, setIsTitleSticky] = useState(false);
  const [stickyTitleContent, setStickyTitleContent] = useState<React.ReactNode | null>(null);

  return (
    <StickyContext.Provider value={{ isTitleSticky, setIsTitleSticky, stickyTitleContent, setStickyTitleContent }}>
      <div className="flex h-screen bg-[#F8F9FA] font-sans selection:bg-[#06b6d4]/20 selection:text-[#1e3a8a]">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
            {children}
          </main>
        </div>
      </div>
    </StickyContext.Provider>
  );
}

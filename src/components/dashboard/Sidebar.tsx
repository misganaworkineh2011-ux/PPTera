"use client";

import {
  LayoutDashboard,
  Image as ImageIcon,
  BarChart,
  LayoutTemplate,
  Palette,
  Box,
  Sparkles,
  Settings,
  History,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const navGroups = [
    {
      title: "Dashboard",
      items: [
        { name: "Presentations", href: "/dashboard", icon: LayoutDashboard },
        // Removed Search from here
      ],
    },
    {
      title: "Assets",
      items: [
        { name: "Images", href: "/dashboard/images", icon: ImageIcon },
        { name: "Charts", href: "/dashboard/charts", icon: BarChart },
        { name: "Resources", href: "/dashboard/resources", icon: Box },
      ],
    },
    {
      title: "Design",
      items: [
        { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
        { name: "Themes", href: "/dashboard/themes", icon: Palette },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { name: "AI Suggestions", href: "/dashboard/ai", icon: Sparkles },
      ],
    },
    {
      title: "Workspace",
      items: [
        { name: "Collaboration", href: "/dashboard/collaboration", icon: Users },
        { name: "Activity", href: "/dashboard/activity", icon: History }, // Moved Activity here
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-slate-200/60 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-20 items-center justify-between px-6">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PPTMaster Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold tracking-tight text-[#1e3a8a]">
              PPT<span className="text-[#06b6d4]">MASTER</span>
            </span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <nav className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-[#e0f2fe] text-[#06b6d4] shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a]",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon
                        size={20}
                        className={cn(
                          "transition-colors",
                          isActive ? "text-[#06b6d4]" : "text-slate-600 group-hover:text-[#1e3a8a]"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="flex-1">{item.name}</span>
                      )}
                      {!isCollapsed && isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-[#06b6d4]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Account Info at Bottom */}
      {!isCollapsed && (
        <div className="border-t border-slate-100 p-4">
          <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#06b6d4] hover:shadow-md">
            <div className="flex items-center gap-3">
               <UserButton afterSignOutUrl="/" />
              <div className="flex flex-col items-start overflow-hidden">
                <span className="truncate text-sm font-bold text-[#1e3a8a]">
                  {user?.fullName || "User"}
                </span>
                <span className="truncate text-xs text-slate-500">
                  Free Workspace
                </span>
              </div>
            </div>
            <MoreVertical size={16} className="text-slate-400" />
          </button>
        </div>
      )}
    </aside>
  );
}

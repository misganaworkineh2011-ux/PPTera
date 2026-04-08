"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  BarChart,
  Palette,
  Settings,
  History,
  Users,
  MoreVertical,
  X,
  CreditCard,
  TrendingUp,
  LogOut,
  UserPlus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  subscriptionPlan?: string | null;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isCollapsed, subscriptionPlan, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    router.push("/");
  };

  const handleNavigate = (href: string) => {
    setIsMenuOpen(false);
    onCloseMobile?.();
    router.push(href);
  };

  const navGroups = [
    {
      title: t.dashboard,
      items: [
        { name: t.presentations, href: "/", icon: LayoutDashboard },
      ],
    },
    {
      title: t.assets,
      items: [
        { name: t.images, href: "/dashboard/images", icon: ImageIcon },
        { name: t.charts, href: "/dashboard/charts", icon: BarChart },
      ],
    },
    {
      title: t.design,
      items: [
        { name: t.themes, href: "/dashboard/themes", icon: Palette },
      ],
    },
    {
      title: t.workspace,
      items: [
        { name: t.collaboration, href: "/dashboard/collaboration", icon: Users },
        { name: t.activity, href: "/dashboard/activity", icon: History },
        { name: t.analytics || "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
        { name: t.billing || "Billing", href: "/dashboard/billing", icon: CreditCard },
        { name: t.settings, href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  // Add Developer section if Pro or Ultra
  if (subscriptionPlan === "pro" || subscriptionPlan === "ultra") {
    // Note: Marketing said Ultra only for API/Webhooks, but sometimes Pro has some access too.
    // The user specifically asked to move API to Ultra in previous turns.
    // So only for Ultra.
    if (subscriptionPlan === "ultra") {
      navGroups.push({
        title: t.developer || "Developer",
        items: [
          { name: t.apiAndWebhooks || "API & Webhooks", href: "/dashboard/api", icon: Sparkles },
        ],
      });
    }
  }

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r-0 bg-[#f0f4f8] dark:bg-zinc-900 transition-all duration-300",
        // On mobile, always show full width; on desktop, respect collapsed state
        "w-72 lg:w-72",
        isCollapsed && "lg:w-20"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 lg:h-20 items-center px-4 lg:px-6">
        {/* Logo - centered when expanded, centered icon when collapsed */}
        <div className={cn(
          "flex items-center justify-center flex-1",
        )}>
          <img 
            src="/logo.png" 
            alt="PPTMaster Logo" 
            className={cn(
              "w-auto transition-all",
              isCollapsed ? "lg:h-8" : "h-8 lg:h-10"
            )} 
          />
        </div>
        
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-2">
        <nav className="space-y-4 lg:space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {/* Show group titles on mobile always, on desktop only when not collapsed */}
              <h3 className={cn(
                "mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500",
                isCollapsed && "lg:hidden"
              )}>
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  // For presentations link (href="/"), consider active if on "/" or "/dashboard"
                  const isActive = item.href === "/"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname === item.href;
                  
                  const itemClasses = cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all scale-95 active:scale-90",
                    isActive
                      ? "bg-[#f1f5f9]/50 text-[#0b97c2] border-r-4 border-[#0b97c2] shadow-sm dark:bg-zinc-800 dark:text-[#0b97c2]"
                      : "text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                    isCollapsed && "lg:justify-center lg:px-2",
                    isActive && "cursor-default font-bold"
                  );

                  const content = (
                    <>
                      <item.icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={cn(
                          "transition-colors flex-shrink-0",
                          isActive ? "text-[#0b97c2]" : "text-slate-500 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-white"
                        )}
                      />
                      {/* Show text on mobile always, on desktop only when not collapsed */}
                      <span className={cn(
                        "flex-1",
                        isCollapsed && "lg:hidden"
                      )}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full bg-[#06b6d4]",
                          isCollapsed && "lg:hidden"
                        )} />
                      )}
                    </>
                  );

                  // If active, render as div to prevent any navigation
                  if (isActive) {
                    return (
                      <div key={item.href} className={itemClasses}>
                        {content}
                      </div>
                    );
                  }

                  // If not active, render as Link for navigation
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => onCloseMobile?.()}
                      className={itemClasses}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Account Info at Bottom */}
      <div className="border-t border-slate-100 dark:border-zinc-800">
        {/* Show account info on mobile always, on desktop only when not collapsed */}
        <div className={cn(
          "p-3 lg:p-4 relative",
          isCollapsed && "lg:hidden"
        )}>
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 p-2.5 lg:p-3 shadow-sm transition hover:border-[#06b6d4] hover:shadow-md"
          >
            <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
              <UserButton />
              <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate text-sm font-bold text-[#1e3a8a] dark:text-white">
                    {user?.fullName || "User"}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-zinc-500 shrink-0 hidden sm:block">
                    Workspace
                  </span>
                </div>
                <span className="truncate text-xs font-semibold text-[#06b6d4] mt-0.5">
                  {subscriptionPlan ? subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1) : "Free"}
                </span>
              </div>
            </div>
            <MoreVertical size={16} className={cn(
              "text-slate-400 dark:text-zinc-500 flex-shrink-0 transition-transform",
              isMenuOpen && "rotate-90"
            )} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute bottom-full left-3 right-3 lg:left-4 lg:right-4 mb-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-lg overflow-hidden z-50"
            >
              <div className="py-1">
                <button
                  onClick={() => handleNavigate("/dashboard/billing")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Sparkles size={16} className="text-[#06b6d4]" />
                  <span>{t.billing || "Upgrade Plan"}</span>
                </button>
                <button
                  onClick={() => handleNavigate("/dashboard/collaboration")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <UserPlus size={16} className="text-slate-500 dark:text-zinc-400" />
                  <span>{t.inviteMembers || "Invite Members"}</span>
                </button>
                <button
                  onClick={() => handleNavigate("/dashboard/settings")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Settings size={16} className="text-slate-500 dark:text-zinc-400" />
                  <span>{t.settings}</span>
                </button>
                <div className="border-t border-slate-100 dark:border-zinc-700 my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t.signOut || "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Collapsed state: show just the user avatar */}
        <div className={cn(
          "hidden p-3 justify-center",
          isCollapsed && "lg:flex"
        )}>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}

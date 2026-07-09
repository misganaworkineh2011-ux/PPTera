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
        "relative flex h-screen flex-col border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.06)] bg-[#f8fafc] dark:bg-zinc-950 dark:border-white/10 dark:shadow-none transition-all duration-300 z-40",
        // On mobile, always show full width; on desktop, respect collapsed state
        "w-64 lg:w-72",
        isCollapsed && "lg:w-20"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 lg:h-20 items-center px-4 lg:px-6">
        {/* Logo - centered when expanded, centered icon when collapsed */}
        <div className={cn(
          "flex items-center justify-center flex-1 overflow-hidden"
        )}>
          {isCollapsed ? (
            <img 
              src="/icon.png" 
              alt="PPTera Icon" 
              className="w-auto h-8 lg:h-9 object-contain"
              onError={(e) => {
                // Fallback if icon.png doesn't exist
                (e.target as HTMLImageElement).src = "/logo.png";
                (e.target as HTMLImageElement).className = "w-auto h-8 lg:h-9 object-cover object-left max-w-[32px]";
              }}
            />
          ) : (
            <img 
              src="/logo.png" 
              alt="PPTera Logo" 
              className="w-auto h-8 lg:h-9 object-contain"
            />
          )}
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 no-scrollbar">
        <nav className="space-y-4">
          {navGroups.map((group, index) => (
            <div key={group.title} className={cn(index > 0 && "pt-4 border-t border-slate-200/60 dark:border-zinc-800/60")}>
              {/* Show group titles on mobile always, on desktop only when not collapsed */}
              <h3 className={cn(
                "mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 dark:text-zinc-500",
                isCollapsed && "lg:hidden"
              )}>
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  // For presentations link (href="/"), consider active if on "/" or "/dashboard"
                  const isActive = item.href === "/"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname === item.href;
                  
                  const itemClasses = cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-all duration-200 select-none outline-none",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10 dark:bg-white dark:text-black"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white",
                    isCollapsed && "lg:justify-center lg:px-0 hover:translate-x-0"
                  );

                  const content = (
                    <>
                      <item.icon
                        size={16}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={cn(
                          "transition-colors flex-shrink-0",
                          isActive ? "text-white dark:text-black" : "text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-200"
                        )}
                      />
                      {/* Show text on mobile always, on desktop only when not collapsed */}
                      <span className={cn(
                        "flex-1 tracking-wide",
                        isCollapsed && "lg:hidden"
                      )}>
                        {item.name}
                      </span>
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

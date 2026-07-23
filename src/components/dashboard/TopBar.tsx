"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Sparkles, Gift, AlertCircle, AlertTriangle, FileText, Image as ImageIcon, BarChart, Palette, Sparkles as SparklesIcon, Users, History, Menu, Settings, Upload, Plus, Zap } from "lucide-react";
import { UserButton } from "~/lib/auth-compat";
import { useStickyContext } from "./DashboardLayout";
import { usePathname } from "next/navigation";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { useDashboard } from "~/contexts/DashboardContext";
import PricingModal from "./PricingModal";
import * as Dialog from "@radix-ui/react-dialog";
import ProjectCreationWizard from "./ProjectCreationWizard";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface TopBarProps {
  credits?: number;
  onSearch?: (query: string) => void;
}

export default function TopBar({ credits = 0, onSearch }: TopBarProps) {
  const { isTitleSticky, stickyTitleContent, setIsMobileSidebarOpen } = useStickyContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingModalTab, setPricingModalTab] = useState<"plans" | "topup">("plans");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { user } = useDashboard();
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Get page title and icon based on pathname
  const getPageInfo = () => {
    if (stickyTitleContent) {
      return { title: stickyTitleContent, icon: null };
    }
    
    const pageMap: Record<string, { title: string; icon: React.ReactNode }> = {
      "/": { title: t.presentations || "Presentations", icon: <FileText size={14} /> },
      "/dashboard/images": { title: t.images || "Images", icon: <ImageIcon size={14} /> },
      "/dashboard/charts": { title: t.charts || "Charts", icon: <BarChart size={14} /> },
      "/dashboard/themes": { title: t.themes || "Themes", icon: <Palette size={14} /> },
      "/dashboard/ai": { title: t.aiSuggestions || "AI Suggestions", icon: <SparklesIcon size={14} /> },
      "/dashboard/collaboration": { title: t.collaboration || "Collaboration", icon: <Users size={14} /> },
      "/dashboard/activity": { title: t.activity || "Activity", icon: <History size={14} /> },
      "/dashboard/settings": { title: t.settings || "Settings", icon: <Settings size={14} /> },
    };

    const pageInfo = pageMap[pathname] ?? pageMap["/dashboard"];
    return {
      title: pageInfo?.title ?? (t.dashboard || "Dashboard"),
      icon: pageInfo?.icon ?? null,
    };
  };

  const pageInfo = getPageInfo();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Fetch notifications
  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      setLoading(true);
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          setNotifications(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching notifications:", error);
          setNotifications([]);
          setLoading(false);
        });
    }
  }, [showNotifications, notifications.length]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (notificationId) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      } else {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
      <header className="md:sticky top-0 z-30 flex h-14 lg:h-20 items-center justify-between bg-white/80 backdrop-blur-md dark:bg-zinc-950/80 px-4 lg:px-10 border-b border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:shadow-none gap-4">
      {/* Left: Mobile menu button + Title */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile menu button */}
        <button
          data-onboarding="mobile-menu"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Center: Action Buttons + Search Bar */}
      <div className="hidden sm:flex flex-1 items-center justify-start px-4 gap-4">
        
        {/* Action Buttons (Before Search Bar) */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
           <button className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-5 py-2.5 text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all active:scale-95">
              <Upload size={16} className="text-slate-500" />
              Import
           </button>
           <button 
             onClick={() => setIsWizardOpen(true)} 
             className="group relative flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white px-5 py-2.5 text-[14px] font-bold text-white dark:text-black hover:bg-slate-800 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all outline-none focus:ring-4 focus:ring-slate-900/10 active:scale-95 overflow-hidden"
           >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <Plus size={16} className="group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">New AI PPT</span>
           </button>
        </div>

        <div className="relative w-[360px] max-w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t.search || "Search projects..."}
            className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 pl-11 pr-4 py-2.5 text-sm font-medium text-slate-700 dark:text-white transition-all focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:focus:ring-[#06b6d4]/10 focus:border-[#06b6d4]"
          />
        </div>
      </div>

      {/* Right: Actions and System Info */}
      <div className="flex items-center shrink-0">
        {/* Mobile Action Buttons (visible on small screens only) */}
        <div className="flex sm:hidden items-center gap-2 mr-2">
          {/* Mobile New Button */}
          <button 
            onClick={() => setIsWizardOpen(true)} 
            className="group relative flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-3 py-1.5 text-[12px] font-bold text-white dark:text-black hover:bg-slate-800 transition-all active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Plus size={14} className="relative z-10" />
            <span className="relative z-10">New</span>
          </button>

          {/* Mobile Credits */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900/80 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            <Sparkles size={11} className="text-[#06b6d4]" />
            <span>{credits}</span>
            <span className="text-slate-400 dark:text-zinc-500">Credits</span>
          </div>

          {/* Mobile Upgrade Button */}
          <button
            onClick={() => {
              setPricingModalTab("plans");
              setShowPricingModal(true);
            }}
            className="relative flex items-center rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] border border-[#06b6d4]/30 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:from-[#0891b2] hover:to-[#0e7490] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="relative z-10">{t.upgrade || "Upgrade"}</span>
          </button>
        </div>

        {/* Mobile search button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white mr-2"
        >
          <Search size={18} />
        </button>
        
        {/* System Info Cluster */}
        <div className="hidden md:flex items-center gap-2 mr-3">
          {/* Referral Button */}
          <button
            onClick={() => window.location.href = '/dashboard/billing#referral'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50 text-[12px] font-bold text-purple-600 dark:text-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all active:scale-95"
          >
            <Gift size={12} />
            <span>Refer & Earn</span>
          </button>

          {/* Subtle Credits Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900/80 text-[12px] font-bold text-slate-500 dark:text-zinc-400">
            <Sparkles size={12} className="text-[#06b6d4]" />
            <span>{credits}</span>
            <span className="font-semibold text-slate-400">Credits</span>
          </div>
          
          {/* Upgrade Button */}
          <button
            data-onboarding="upgrade"
            onClick={() => {
              setPricingModalTab("plans");
              setShowPricingModal(true);
            }}
            className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] border border-[#06b6d4]/30 px-4 py-1.5 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:from-[#0891b2] hover:to-[#0e7490] hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="relative z-10">{t.upgrade || "Upgrade"}</span>
          </button>

          {/* Top-up Button (Only for paid users) */}
          {user?.subscriptionPlan && user.subscriptionPlan.toLowerCase() !== "free" && (
            <button
              onClick={() => {
                setPricingModalTab("topup");
                setShowPricingModal(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 px-3 py-1.5 text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95"
            >
              <Zap size={12} />
              {t.topUp || "Top-up"}
            </button>
          )}
        </div>
        
        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-2" />

        {/* Account Cluster */}
        <div className="hidden sm:flex items-center gap-2 ml-1">
          {/* Notifications */}
          <div className="relative notifications-container flex items-center">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white dark:border-zinc-950 bg-[#06b6d4]"></span>
              )}
            </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-80 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xl z-50">
              <div className="border-b border-slate-100 dark:border-zinc-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">{t.notificationsTitle || "Notifications"}</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#06b6d4] px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount} {t.newNotifications || "new"}
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4] mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                    <p className="text-sm text-slate-500 dark:text-zinc-500">{t.noNotifications || "No notifications yet"}</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        if (notif.link) window.location.href = notif.link;
                      }}
                      className={`border-b border-slate-50 dark:border-zinc-700 p-4 transition hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer ${
                        !notif.isRead ? "bg-blue-50/50 dark:bg-white/5" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notif.type === "success" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                              <Sparkles size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          {notif.type === "info" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          {notif.type === "promo" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                              <Gift size={16} className="text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          {notif.type === "warning" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                          )}
                          {notif.type === "error" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{getTimeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 dark:border-zinc-700 p-3">
                <button
                  onClick={() => markAsRead()}
                  className="w-full text-center text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a] dark:hover:text-white"
                >
                  {t.markAllRead || "Mark all as read"}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 lg:h-9 lg:w-9 ring-2 ring-slate-100 hover:ring-[#06b6d4] transition-all",
            },
          }}
        />
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-3 sm:hidden shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.search || "Search..."}
              autoFocus
              className="w-full rounded-full border-none bg-slate-50 dark:bg-zinc-800 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 dark:text-white ring-1 ring-slate-200 dark:ring-zinc-700 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 dark:focus:ring-white/20"
            />
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={user?.subscriptionPlan}
        initialTab={pricingModalTab}
      />

      {/* Project Wizard Modal */}
      <Dialog.Root open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[9999] w-[95vw] sm:w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-transparent shadow-2xl outline-none">
            <Dialog.Title className="sr-only">{t.createNewPresentation || "Create New Presentation"}</Dialog.Title>
            <ProjectCreationWizard 
              userId={user?.id || ""} 
              credits={credits || 0} 
              onClose={() => setIsWizardOpen(false)} 
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </header>
    </>
  );
}

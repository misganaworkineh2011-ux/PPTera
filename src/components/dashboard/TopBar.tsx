"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Sparkles, Gift, AlertCircle, AlertTriangle, FileText } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useStickyContext } from "./DashboardLayout";
import Link from "next/link";

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
  const { isTitleSticky, stickyTitleContent } = useStickyContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

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
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between bg-[#F8F9FA] px-8 border-b border-slate-100/50 backdrop-blur-sm">
      {/* Left: Title and Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Title - Always visible */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-sm">
            <FileText size={14} />
          </div>
          <h1 className="text-base font-bold tracking-tight text-[#1e3a8a] whitespace-nowrap">Presentations</h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Try searching 'insights'..."
            className="w-full rounded-full border-none bg-white pl-11 pr-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
          />
        </div>
      </div>

      {/* Right: Actions - Always Fixed */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Upgrade Button */}
        <Link
          href="/pricing"
          className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md md:flex"
        >
          <Sparkles size={16} />
          <span>Upgrade for more AI</span>
        </Link>
        {/* Credits Badge */}
        <Link
          href="/pricing"
          className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-[#06b6d4] hover:shadow-md md:flex cursor-pointer"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#06b6d4]"></span>
          <span>{credits} Credits</span>
        </Link>
        
        {/* Notifications */}
        <div className="relative notifications-container">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#06b6d4]"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-2xl z-50">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#06b6d4] px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4] mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        if (notif.link) window.location.href = notif.link;
                      }}
                      className={`border-b border-slate-50 p-4 transition hover:bg-slate-50 cursor-pointer ${
                        !notif.isRead ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notif.type === "success" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <Sparkles size={16} className="text-green-600" />
                            </div>
                          )}
                          {notif.type === "info" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <AlertCircle size={16} className="text-blue-600" />
                            </div>
                          )}
                          {notif.type === "promo" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                              <Gift size={16} className="text-purple-600" />
                            </div>
                          )}
                          {notif.type === "warning" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                              <AlertTriangle size={16} className="text-yellow-600" />
                            </div>
                          )}
                          {notif.type === "error" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                              <AlertCircle size={16} className="text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{getTimeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 p-3">
                <button
                  onClick={() => markAsRead()}
                  className="w-full text-center text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a]"
                >
                  Mark all as read
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
              avatarBox: "h-10 w-10 ring-2 ring-slate-200 hover:ring-[#06b6d4] transition-all",
            },
          }}
        />
      </div>
    </header>
  );
}

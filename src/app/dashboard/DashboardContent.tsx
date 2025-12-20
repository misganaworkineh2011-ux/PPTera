"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Star, Globe, Lock, Share2, Edit3, Copy, Trash2, Link2, Loader2, Heart } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getPresentationUrl } from "~/lib/utils";
import ShareModal from "~/components/presentation/ShareModal";

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  shareToken?: string | null;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface DashboardContentProps {
  presentations: Presentation[];
  userName: string | null;
  searchQuery?: string;
  pagination?: PaginationInfo;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "favorites" | "public" | "private";

export default function DashboardContent({ presentations: initialPresentations, userName, searchQuery = "", pagination, onLoadMore, isLoadingMore }: DashboardContentProps) {
  const { user } = useUser();
  const [presentations, setPresentations] = useState(initialPresentations);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{ id: string; action: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // OPTIMIZATION: Optimistic update helpers
  const optimisticUpdate = useCallback(<T extends Partial<Presentation>>(
    presId: string,
    updates: T,
    rollback: () => void
  ) => {
    // Immediately update UI
    setPresentations(prev =>
      prev.map(p => p.id === presId ? { ...p, ...updates } : p)
    );
    return rollback;
  }, []);

  const optimisticRemove = useCallback((presId: string) => {
    const removed = presentations.find(p => p.id === presId);
    setPresentations(prev => prev.filter(p => p.id !== presId));
    // Return rollback function
    return () => {
      if (removed) {
        setPresentations(prev => [...prev, removed].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    };
  }, [presentations]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMenu && !target.closest('.menu-container')) {
        setActiveMenu(null);
      }
      if (showFilterMenu && !target.closest('.filter-menu-container')) {
        setShowFilterMenu(false);
      }
    };

    if (activeMenu || showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu, showFilterMenu]);

  // Get thumbnail from thumbnailUrl or fallback to logo
  const getThumbnail = (pres: Presentation) => {
    if (pres.thumbnailUrl && pres.thumbnailUrl.startsWith("http")) {
      return pres.thumbnailUrl;
    }
    return "/logo.png";
  };

  // Filter presentations
  const filteredPresentations = useMemo(() => {
    let filtered = presentations;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query)
      );
    }

    // Apply filter mode
    if (filterMode === "favorites") {
      filtered = filtered.filter(p => p.isPinned);
    } else if (filterMode === "public") {
      filtered = filtered.filter(p => p.isPublic);
    } else if (filterMode === "private") {
      filtered = filtered.filter(p => !p.isPublic);
    }

    return filtered;
  }, [presentations, filterMode, searchQuery]);

  const handleMenuAction = async (action: string, presId: string, pres?: Presentation, e?: React.MouseEvent) => {
    // Prevent event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Handle actions first, then close menu
    switch (action) {
      case "share":
        const sharePres = presentations.find(p => p.id === presId);
        if (sharePres) {
          // Close menu first
          setActiveMenu(null);
          setMenuPosition(null);
          // Then show modal
          setTimeout(() => setShowShareModal(presId), 50);
        }
        break;

      case "rename":
        const presentation = presentations.find(p => p.id === presId);
        if (presentation) {
          // Close menu first
          setActiveMenu(null);
          setMenuPosition(null);
          // Then show dialog
          setTimeout(() => {
            setRenameValue(presentation.title);
            setShowRenameDialog(presId);
          }, 50);
        }
        break;

      case "favorite":
        // Close menu first
        setActiveMenu(null);
        setMenuPosition(null);

        // OPTIMIZATION: Optimistic update - update UI immediately
        const currentPres = presentations.find(p => p.id === presId);
        if (!currentPres) break;

        const newPinnedState = !currentPres.isPinned;
        const rollbackFavorite = optimisticUpdate(presId, { isPinned: newPinnedState }, () => {
          setPresentations(prev =>
            prev.map(p => p.id === presId ? { ...p, isPinned: currentPres.isPinned } : p)
          );
        });

        // Show toast immediately
        toast.success(newPinnedState ? "Added to favorites" : "Removed from favorites");

        // Make API call in background
        fetch(`/api/presentations/${presId}/favorite`, { method: "PATCH" })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("Failed to update");
            }
          })
          .catch((error) => {
            console.error("Error toggling favorite:", error);
            rollbackFavorite();
            toast.error("Failed to update favorite status");
          });
        break;

      case "duplicate":
        // Close menu first
        setActiveMenu(null);
        setMenuPosition(null);

        try {
          setIsLoading(true);
          setLoadingAction({ id: presId, action: "duplicate" });
          const response = await fetch(`/api/presentations/${presId}/duplicate`, {
            method: "POST",
          });

          if (response.ok) {
            const data = await response.json();
            // Add the duplicated presentation to the list immediately
            setPresentations(prev => [data.presentation, ...prev]);
            toast.success("Presentation duplicated!");
          } else {
            toast.error("Failed to duplicate presentation");
          }
        } catch (error) {
          console.error("Error duplicating:", error);
          toast.error("Failed to duplicate presentation");
        } finally {
          setIsLoading(false);
          setLoadingAction(null);
        }
        break;

      case "copyLink":
        // Close menu first
        setActiveMenu(null);
        setMenuPosition(null);

        const copyPres = presentations.find(p => p.id === presId);
        const url = copyPres
          ? `${window.location.origin}${getPresentationUrl(presId, copyPres.title)}`
          : `${window.location.origin}/presentation/${presId}`;
        try {
          await navigator.clipboard.writeText(url);
          setCopiedId(presId);
          setTimeout(() => setCopiedId(null), 2000);
          toast.success("Link copied to clipboard!");
        } catch (error) {
          console.error("Error copying link:", error);
          toast.error("Failed to copy link");
        }
        break;

      case "delete":
        // Close menu first
        setActiveMenu(null);
        setMenuPosition(null);

        setTimeout(() => setShowDeleteDialog(presId), 50);
        break;
    }
  };

  const handleRename = async (presId: string) => {
    if (!renameValue.trim()) {
      toast?.error?.("Title cannot be empty") || alert("Title cannot be empty");
      return;
    }

    // OPTIMIZATION: Optimistic update for rename
    const currentPres = presentations.find(p => p.id === presId);
    const oldTitle = currentPres?.title || "";
    const newTitle = renameValue.trim();

    // Update UI immediately
    setPresentations(prev =>
      prev.map(p => p.id === presId ? { ...p, title: newTitle } : p)
    );
    setShowRenameDialog(null);
    setRenameValue("");

    try {
      const response = await fetch(`/api/presentations/${presId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        // Rollback on failure
        setPresentations(prev =>
          prev.map(p => p.id === presId ? { ...p, title: oldTitle } : p)
        );
        toast.error("Failed to rename presentation");
      } else {
        toast.success("Presentation renamed successfully");
      }
    } catch (error) {
      console.error("Error renaming:", error);
      // Rollback on error
      setPresentations(prev =>
        prev.map(p => p.id === presId ? { ...p, title: oldTitle } : p)
      );
      toast.error("Failed to rename presentation");
    }
  };

  const handleDelete = async (presId: string) => {
    // OPTIMIZATION: Optimistic delete - remove from UI immediately
    const rollbackDelete = optimisticRemove(presId);
    setShowDeleteDialog(null);

    try {
      const response = await fetch(`/api/presentations/${presId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        rollbackDelete();
        toast?.error?.("Failed to delete presentation") || alert("Failed to delete presentation");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete presentation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Filters & View Toggle */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          <button
            onClick={() => setFilterMode("all")}
            className={`flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${filterMode === "all"
                ? "bg-[#1e3a8a]/10 font-bold text-[#1e3a8a] dark:bg-[#1e3a8a]/30 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            <Grid size={14} className="sm:hidden" />
            <Grid size={16} className="hidden sm:block" />
            {t.all || "All"}
          </button>
          <button
            onClick={() => setFilterMode("favorites")}
            className={`flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${filterMode === "favorites"
                ? "bg-[#1e3a8a]/10 font-bold text-[#1e3a8a] dark:bg-[#1e3a8a]/30 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            <Star size={14} className="sm:hidden" />
            <Star size={16} className="hidden sm:block" />
            <span className="hidden xs:inline">{t.favorites || "Favorites"}</span>
            <span className="xs:hidden">{(t.favorites || "Favorites").slice(0, 3)}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative filter-menu-container">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="p-1.5 sm:p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <Filter size={16} className="sm:hidden" />
              <Filter size={18} className="hidden sm:block" />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-44 sm:w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 dark:border-slate-700 dark:bg-slate-800">
                <div className="p-1.5 sm:p-2">
                  <button
                    onClick={() => {
                      setFilterMode("public");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Globe size={14} /> {t.publicOnly || "Public only"}
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("private");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Lock size={14} /> {t.privateOnly || "Private only"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-100 p-0.5 sm:p-1 dark:bg-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${viewMode === "grid"
                  ? "bg-white text-[#1e3a8a] shadow-sm dark:bg-slate-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <Grid size={16} className="sm:hidden" />
              <Grid size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.grid || "Grid"}</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${viewMode === "list"
                  ? "bg-white text-[#1e3a8a] shadow-sm dark:bg-slate-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <ListIcon size={16} className="sm:hidden" />
              <ListIcon size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.list || "List"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
        {filteredPresentations.length === 0 ? (
          <div className="flex h-[250px] sm:h-[300px] lg:h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center px-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-white shadow-lg ring-1 ring-slate-100 dark:bg-slate-700 dark:ring-slate-600">
              <Upload size={22} className="sm:hidden text-[#06b6d4]" />
              <Upload size={28} className="hidden sm:block text-[#06b6d4]" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold text-[#1e3a8a] dark:text-white">
              {presentations.length === 0 ? (t.noPresentations || "No presentations yet") : (t.noResults || "No results found")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mb-4 sm:mb-6 dark:text-slate-400">
              {presentations.length === 0
                ? (t.createFirst || "Create your first AI-powered deck in seconds.")
                : (t.noMatch || "No presentations match the selected filter.")}
            </p>
            {filterMode !== "all" && (
              <button
                onClick={() => setFilterMode("all")}
                className="text-xs sm:text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a]"
              >
                {t.clearFilters || "Clear filters"}
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredPresentations.map((pres) => (
              <a
                key={pres.id}
                href={getPresentationUrl(pres.id, pres.title)}
                className="group relative flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                  <Image
                    src={getThumbnail(pres)}
                    alt={pres.title}
                    fill
                    className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-2 sm:p-3 opacity-60 group-hover:opacity-80" : "object-cover"} transition-opacity`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 group-hover:from-[#1e3a8a]/10 group-hover:to-[#06b6d4]/10 transition-colors" />
                  {/* Favorite Icon - Clickable */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction("favorite", pres.id);
                    }}
                    className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 rounded-full backdrop-blur-sm transition-all ${pres.isPinned
                        ? "bg-yellow-400/90 hover:bg-yellow-500"
                        : "bg-black/30 hover:bg-black/50"
                      }`}
                    title={pres.isPinned ? "Unfavorite" : "Favorite"}
                  >
                    <Heart
                      size={14}
                      className={`sm:hidden ${pres.isPinned ? "fill-white text-white" : "text-white"}`}
                    />
                    <Heart
                      size={16}
                      className={`hidden sm:block ${pres.isPinned ? "fill-white text-white" : "text-white"}`}
                    />
                  </button>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-2 sm:p-3">
                  {/* Title - fixed height with line clamp */}
                  <div className="h-8 sm:h-10 mb-1.5 sm:mb-2">
                    <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-[#1e3a8a] dark:text-white" title={pres.title}>
                      {pres.title}
                    </h3>
                  </div>

                  {/* Public/Private Indicator */}
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                    {pres.isPublic ? (
                      <>
                        <Globe size={10} className="sm:hidden text-green-600" />
                        <Globe size={12} className="hidden sm:block text-green-600" />
                        <span className="text-[10px] sm:text-xs font-medium text-green-600">{t.public || "Public"}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={10} className="sm:hidden text-slate-500" />
                        <Lock size={12} className="hidden sm:block text-slate-500" />
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500">{t.private || "Private"}</span>
                      </>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-50 dark:border-slate-700">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={userName || "User"}
                          width={20}
                          height={20}
                          className="h-4 w-4 sm:h-5 sm:w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold">
                          {userName ? userName[0]?.toUpperCase() : "U"}
                        </div>
                      )}
                      <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(pres.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="relative menu-container">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (activeMenu === pres.id) {
                            setActiveMenu(null);
                            setMenuPosition(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({ top: rect.top - 50, left: rect.left - 180 });
                            setActiveMenu(pres.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-slate-100 dark:text-slate-500 dark:hover:text-[#06b6d4] dark:hover:bg-slate-700 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPresentations.map((pres) => (
              <a
                key={pres.id}
                href={getPresentationUrl(pres.id, pres.title)}
                className="group flex items-center gap-2 sm:gap-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 sm:p-3 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-md cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-14 h-10 sm:w-20 sm:h-14 flex-shrink-0 bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 rounded relative overflow-hidden">
                  <Image
                    src={getThumbnail(pres)}
                    alt={pres.title}
                    fill
                    className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-1.5 sm:p-2 opacity-60 group-hover:opacity-80" : "object-cover"} transition-opacity`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#1e3a8a] dark:text-white truncate" title={pres.title}>
                      {pres.title}
                    </h3>
                    {/* Favorite Icon - Clickable */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction("favorite", pres.id);
                      }}
                      className={`p-1 rounded-full transition-all flex-shrink-0 ${pres.isPinned
                          ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      title={pres.isPinned ? "Unfavorite" : "Favorite"}
                    >
                      <Heart
                        size={12}
                        className={`sm:hidden ${pres.isPinned ? "fill-yellow-500 text-yellow-500" : "text-slate-400"}`}
                      />
                      <Heart
                        size={14}
                        className={`hidden sm:block ${pres.isPinned ? "fill-yellow-500 text-yellow-500" : "text-slate-400"}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500">
                    <span className="hidden xs:inline">{new Date(pres.createdAt).toLocaleDateString()}</span>
                    <span className="hidden xs:inline">•</span>
                    <div className="flex items-center gap-1">
                      {pres.isPublic ? (
                        <>
                          <Globe size={10} className="sm:hidden text-green-600" />
                          <Globe size={12} className="hidden sm:block text-green-600" />
                          <span className="text-green-600 font-medium">{t.public || "Public"}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={10} className="sm:hidden text-slate-500" />
                          <Lock size={12} className="hidden sm:block text-slate-500" />
                          <span className="text-slate-500 font-medium">{t.private || "Private"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0 menu-container">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (activeMenu === pres.id) {
                        setActiveMenu(null);
                        setMenuPosition(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.top - 50, left: rect.left - 180 });
                        setActiveMenu(pres.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {pagination?.hasMore && (
        <div className="flex justify-center pt-6 pb-2">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More ({pagination.total - pagination.offset - filteredPresentations.length} remaining)
              </>
            )}
          </button>
        </div>
      )}

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/30 p-4" onClick={() => setShowRenameDialog(null)}>
          <div className="bg-white rounded-lg sm:rounded-md p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base sm:text-lg font-bold text-[#1e3a8a] mb-3 sm:mb-4 dark:text-white">{t.renamePresentation || "Rename Presentation"}</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename(showRenameDialog);
                } else if (e.key === "Escape") {
                  setShowRenameDialog(null);
                }
              }}
              className="w-full rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder={t.enterNewTitle || "Enter new title"}
              autoFocus
              disabled={isLoading}
            />
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => setShowRenameDialog(null)}
                className="flex-1 rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled={isLoading}
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleRename(showRenameDialog)}
                className="flex-1 rounded-md bg-[#1e3a8a] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#1e3a8a]/90 disabled:opacity-50"
                disabled={isLoading || !renameValue.trim()}
              >
                {isLoading ? (t.saving || "Saving...") : (t.saveChanges || "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/30 p-4" onClick={() => setShowDeleteDialog(null)}>
          <div className="bg-white rounded-lg sm:rounded-md p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/50">
                <Trash2 size={16} className="sm:hidden text-red-600 dark:text-red-400" />
                <Trash2 size={20} className="hidden sm:block text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1e3a8a] dark:text-white">{t.deletePresentation || "Delete Presentation"}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 dark:text-slate-400">
              {t.deleteConfirm || "Are you sure you want to delete this presentation? This action cannot be undone."}
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="flex-1 rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled={isLoading}
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                className="flex-1 rounded-md bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (t.deleting || "Deleting...") : (t.delete || "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (() => {
        const pres = presentations.find(p => p.id === showShareModal);
        return pres ? (
          <ShareModal
            presentationId={showShareModal}
            initialIsPublic={pres.isPublic}
            initialShareToken={pres.shareToken}
            onClose={() => setShowShareModal(null)}
          />
        ) : null;
      })()}

      {/* Portal Dropdown Menu */}
      {activeMenu && menuPosition && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onMouseDown={(e) => {
              // Only close if clicking directly on backdrop, not if click started in menu
              if (e.target === e.currentTarget) {
                setActiveMenu(null);
                setMenuPosition(null);
              }
            }}
          />
          <div
            className="fixed w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ top: menuPosition.top, left: Math.max(8, menuPosition.left) }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("share", activeMenu, undefined, e);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 size={15} /> {t.share || "Share"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("rename", activeMenu, undefined, e);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit3 size={15} /> {t.rename || "Rename"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("favorite", activeMenu, undefined, e);
                }}
                disabled={loadingAction?.id === activeMenu && loadingAction?.action === "favorite"}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {loadingAction?.id === activeMenu && loadingAction?.action === "favorite" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Heart size={15} className={presentations.find(p => p.id === activeMenu)?.isPinned ? "fill-yellow-500 text-yellow-500" : "text-slate-500"} />
                )}
                {presentations.find(p => p.id === activeMenu)?.isPinned ? (t.unfavorite || "Unfavorite") : (t.favorite || "Favorite")}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("duplicate", activeMenu, undefined, e);
                }}
                disabled={loadingAction?.id === activeMenu && loadingAction?.action === "duplicate"}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {loadingAction?.id === activeMenu && loadingAction?.action === "duplicate" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Copy size={15} />
                )}
                {t.duplicate || "Duplicate"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("copyLink", activeMenu, undefined, e);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${copiedId === activeMenu
                    ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
              >
                <Link2 size={15} /> {copiedId === activeMenu ? (t.copied || "Copied!") : (t.copyLink || "Copy link")}
              </button>
              <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuAction("delete", activeMenu, undefined, e);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={15} /> {t.delete || "Delete"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

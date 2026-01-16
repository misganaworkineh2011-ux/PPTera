"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Star, Globe, Lock, Share2, Edit3, Copy, Trash2, Link2, Loader2, Heart } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getPresentationUrl } from "~/lib/utils";
import ShareModal from "~/components/presentation/ShareModal";

// Shimmer effect for skeleton loading
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

// Single skeleton card component for inline rendering
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-2.5 w-16 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="w-6 h-6 rounded bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );
}

// Infinite Scroll Trigger Component with Intersection Observer
function InfiniteScrollTrigger({ 
  onLoadMore, 
  isLoading, 
  remainingCount,
  moreText
}: { 
  onLoadMore: () => void; 
  isLoading: boolean;
  remainingCount: number;
  moreText: string;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    // Reset initialization on mount
    isInitialized.current = false;
    hasTriggered.current = false;

    // Delay observer setup to prevent immediate trigger on page load
    const initTimeout = setTimeout(() => {
      isInitialized.current = true;
    }, 500);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only trigger if initialized (after delay), visible, not loading, has remaining items, and not already triggered
        if (entry?.isIntersecting && !isLoading && !hasTriggered.current && isInitialized.current && remainingCount > 0) {
          hasTriggered.current = true;
          onLoadMore();
        }
      },
      { 
        rootMargin: "100px", // Start loading 100px before reaching the trigger
        threshold: 0.1 
      }
    );

    observer.observe(trigger);
    return () => {
      clearTimeout(initTimeout);
      observer.disconnect();
    };
  }, [onLoadMore, isLoading, remainingCount]);

  // Reset trigger flag when loading completes
  useEffect(() => {
    if (!isLoading) {
      // Small delay before allowing next trigger to prevent rapid re-triggers
      const resetTimeout = setTimeout(() => {
        hasTriggered.current = false;
      }, 100);
      return () => clearTimeout(resetTimeout);
    }
  }, [isLoading]);

  // Don't render anything if no remaining items and not loading
  if (remainingCount <= 0 && !isLoading) {
    return null;
  }

  return (
    <div ref={triggerRef} className="col-span-full">
      {!isLoading && remainingCount > 0 && (
        <button 
          onClick={onLoadMore}
          className="flex flex-col items-center gap-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer group w-full py-6"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600 rounded-full group-hover:via-slate-400" />
            <span className="text-xs font-medium">{remainingCount} {moreText}</span>
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600 rounded-full group-hover:via-slate-400" />
          </div>
        </button>
      )}
    </div>
  );
}

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

export default function DashboardContent({ presentations: propPresentations, userName, searchQuery = "", pagination, onLoadMore, isLoadingMore }: DashboardContentProps) {
  const { user } = useUser();
  // Local state for optimistic updates only - synced from props
  const [localPresentations, setLocalPresentations] = useState(propPresentations);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [loadingAction, setLoadingAction] = useState<{ id: string; action: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  // Track which presentation IDs have been rendered (shouldn't animate)
  const renderedIdsRef = useRef<Set<string>>(new Set(propPresentations.map(p => p.id)));
  
  // Track the count of items before load more (for animation index calculation)
  const prevCountRef = useRef(propPresentations.length);
  
  // Track if this is the first render to disable all animations on initial load
  const isFirstRenderRef = useRef(true);
  
  // After first render, mark it as done
  useEffect(() => {
    // Small delay to ensure SSR content is painted before enabling animations
    const timer = setTimeout(() => {
      isFirstRenderRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync local state when props change and track new items for animation
  useEffect(() => {
    // Calculate which items are new (for staggered animation)
    const newIds = propPresentations
      .filter(p => !renderedIdsRef.current.has(p.id))
      .map(p => p.id);
    
    // Update the previous count for next load
    prevCountRef.current = renderedIdsRef.current.size;
    
    // Mark new items as rendered after animation completes
    if (newIds.length > 0) {
      const animationDuration = newIds.length * 50 + 300; // stagger + duration
      setTimeout(() => {
        newIds.forEach(id => renderedIdsRef.current.add(id));
      }, animationDuration);
    }
    
    setLocalPresentations(propPresentations);
  }, [propPresentations]);
  
  // Use local state for display (allows optimistic updates)
  const presentations = localPresentations;
  const setPresentations = setLocalPresentations;

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

  const handleMenuAction = async (action: string, presId: string, _pres?: Presentation, e?: React.MouseEvent) => {
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
        toast.success(newPinnedState ? (t.addedToFavorites || "Added to favorites") : (t.removedFromFavorites || "Removed from favorites"));

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
            toast.error(t.failedToUpdate || "Failed to update favorite status");
          });
        break;

      case "duplicate":
        // Close menu first
        setActiveMenu(null);
        setMenuPosition(null);

        try {
          setLoadingAction({ id: presId, action: "duplicate" });
          const response = await fetch(`/api/presentations/${presId}/duplicate`, {
            method: "POST",
          });

          if (response.ok) {
            const data = await response.json();
            // Add the duplicated presentation to the list immediately
            setPresentations(prev => [data.presentation, ...prev]);
            toast.success(t.presentationDuplicated || "Presentation duplicated!");
          } else {
            toast.error(t.failedToDuplicate || "Failed to duplicate presentation");
          }
        } catch (error) {
          console.error("Error duplicating:", error);
          toast.error(t.failedToDuplicate || "Failed to duplicate presentation");
        } finally {
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
          toast.success(t.linkCopied || "Link copied to clipboard!");
        } catch (error) {
          console.error("Error copying link:", error);
          toast.error(t.failedToCopyLink || "Failed to copy link");
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
      toast?.error?.(t.titleCannotBeEmpty || "Title cannot be empty") || alert(t.titleCannotBeEmpty || "Title cannot be empty");
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
        toast.error(t.failedToRename || "Failed to rename presentation");
      } else {
        toast.success(t.renamedSuccessfully || "Presentation renamed successfully");
      }
    } catch (error) {
      console.error("Error renaming:", error);
      // Rollback on error
      setPresentations(prev =>
        prev.map(p => p.id === presId ? { ...p, title: oldTitle } : p)
      );
      toast.error(t.failedToRename || "Failed to rename presentation");
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
        toast?.error?.(t.failedToDelete || "Failed to delete presentation") || alert(t.failedToDelete || "Failed to delete presentation");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      rollbackDelete();
      toast?.error?.(t.failedToDelete || "Failed to delete presentation") || alert(t.failedToDelete || "Failed to delete presentation");
    }
  };

  return (
    <>
      {/* Filters & View Toggle */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          <button
            onClick={() => setFilterMode("all")}
            className={`flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${filterMode === "all"
                ? "bg-neutral-200 font-bold text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
              }`}
          >
            <Grid size={14} className="sm:hidden" />
            <Grid size={16} className="hidden sm:block" />
            {t.all || "All"}
          </button>
          <button
            onClick={() => setFilterMode("favorites")}
            className={`flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${filterMode === "favorites"
                ? "bg-neutral-200 font-bold text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
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
              className="p-1.5 sm:p-0 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <Filter size={16} className="sm:hidden" />
              <Filter size={18} className="hidden sm:block" />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-44 sm:w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="p-1.5 sm:p-2">
                  <button
                    onClick={() => {
                      setFilterMode("public");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Globe size={14} /> {t.publicOnly || "Public only"}
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("private");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Lock size={14} /> {t.privateOnly || "Private only"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-100 p-0.5 sm:p-1 dark:bg-neutral-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${viewMode === "grid"
                  ? "bg-white text-[#1e3a8a] shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
                }`}
            >
              <Grid size={16} className="sm:hidden" />
              <Grid size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.grid || "Grid"}</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition ${viewMode === "list"
                  ? "bg-white text-[#1e3a8a] shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
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
      <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] pb-8 sm:pb-12 lg:pb-16">
        {filteredPresentations.length === 0 ? (
          <div className="flex h-[250px] sm:h-[300px] lg:h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center px-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-white shadow-lg ring-1 ring-slate-100 dark:bg-neutral-800 dark:ring-neutral-700">
              <Upload size={22} className="sm:hidden text-[#06b6d4]" />
              <Upload size={28} className="hidden sm:block text-[#06b6d4]" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold text-[#1e3a8a] dark:text-white">
              {presentations.length === 0 ? (t.noPresentations || "No presentations yet") : (t.noResults || "No results found")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mb-4 sm:mb-6 dark:text-neutral-400">
              {presentations.length === 0
                ? (t.createFirst || "Create your first AI-powered deck in seconds.")
                : (t.noMatch || "No presentations match the selected filter.")}
            </p>
            {filterMode !== "all" && (
              <button
                onClick={() => setFilterMode("all")}
                className="text-xs sm:text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a] dark:text-neutral-400 dark:hover:text-white"
              >
                {t.clearFilters || "Clear filters"}
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredPresentations.map((pres, index) => {
              // Only animate cards that were loaded after initial render (via "load more")
              const isNewCard = !isFirstRenderRef.current && !renderedIdsRef.current.has(pres.id);
              // Calculate animation index relative to new items only (not overall index)
              const newItemIndex = isNewCard ? index - prevCountRef.current : 0;
              const animationClass = isNewCard ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "";
              const animationStyle = isNewCard ? { 
                animationDelay: `${Math.max(0, newItemIndex) * 75}ms`, 
                animationFillMode: "backwards" as const 
              } : {};
              
              return (
              <a
                key={pres.id}
                href={getPresentationUrl(pres.id, pres.title)}
                className={`group relative flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer ${animationClass}`}
                style={animationStyle}
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900 relative overflow-hidden">
                  <Image
                    src={getThumbnail(pres)}
                    alt={pres.title}
                    fill
                    className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-2 sm:p-3 opacity-60 group-hover:opacity-80" : "object-cover"} transition-opacity`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 group-hover:from-black/10 group-hover:to-black/15 transition-colors" />
                  {/* Favorite Icon - Clickable */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction("favorite", pres.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
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
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-50 dark:border-neutral-800">
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
                        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold">
                          {userName ? userName[0]?.toUpperCase() : "U"}
                        </div>
                      )}
                      <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-neutral-500">
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
                        className="p-1 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-slate-100 dark:text-neutral-500 dark:hover:text-[#06b6d4] dark:hover:bg-neutral-800 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            );
            })}
            {/* Inline skeleton cards when loading more */}
            {isLoadingMore && Array.from({ length: Math.min(pagination?.total ? pagination.total - presentations.length : 12, 12) }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} index={i} />
            ))}
            {/* Infinite scroll trigger inside grid */}
            {onLoadMore && (pagination?.hasMore || isLoadingMore) && (
              <InfiniteScrollTrigger 
                onLoadMore={onLoadMore} 
                isLoading={isLoadingMore || false}
                remainingCount={pagination ? pagination.total - presentations.length : 0}
                moreText={t.moreItems || "more"}
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPresentations.map((pres, index) => {
              // Only animate cards that were loaded after initial render (via "load more")
              const isNewCard = !isFirstRenderRef.current && !renderedIdsRef.current.has(pres.id);
              // Calculate animation index relative to new items only
              const newItemIndex = isNewCard ? index - prevCountRef.current : 0;
              const animationClass = isNewCard ? "animate-in fade-in slide-in-from-left-4 duration-500" : "";
              const animationStyle = isNewCard ? { 
                animationDelay: `${Math.max(0, newItemIndex) * 75}ms`, 
                animationFillMode: "backwards" as const 
              } : {};
              
              return (
              <a
                key={pres.id}
                href={getPresentationUrl(pres.id, pres.title)}
                className={`group flex items-center gap-2 sm:gap-4 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 sm:p-3 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-md cursor-pointer ${animationClass}`}
                style={animationStyle}
              >
                {/* Thumbnail */}
                <div className="w-14 h-10 sm:w-20 sm:h-14 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900 rounded relative overflow-hidden">
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction("favorite", pres.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`p-1 rounded-full transition-all flex-shrink-0 ${pres.isPinned
                          ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30"
                          : "hover:bg-slate-100 dark:hover:bg-neutral-800"
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
                    className="p-1.5 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </a>
            );
            })}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999, isolation: 'isolate', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowRenameDialog(null)}>
          <div className="bg-white rounded-lg sm:rounded-md p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:bg-neutral-900 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
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
              className="w-full rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder={t.enterNewTitle || "Enter new title"}
              autoFocus
            />
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => setShowRenameDialog(null)}
                className="flex-1 rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleRename(showRenameDialog)}
                className="flex-1 rounded-md bg-[#1e3a8a] dark:bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white dark:text-black hover:bg-[#1e3a8a]/90 dark:hover:bg-neutral-200 disabled:opacity-50"
                disabled={!renameValue.trim()}
              >
                {t.saveChanges || "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999, isolation: 'isolate', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowDeleteDialog(null)}>
          <div className="bg-white rounded-lg sm:rounded-md p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:bg-neutral-900 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/50">
                <Trash2 size={16} className="sm:hidden text-red-600 dark:text-red-400" />
                <Trash2 size={20} className="hidden sm:block text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1e3a8a] dark:text-white">{t.deletePresentation || "Delete Presentation"}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 dark:text-neutral-400">
              {t.deleteConfirm || "Are you sure you want to delete this presentation? This action cannot be undone."}
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="flex-1 rounded-md border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                className="flex-1 rounded-md bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700"
              >
                {t.delete || "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Modal */}
      {showShareModal && typeof document !== "undefined" && createPortal(
        (() => {
          const pres = presentations.find(p => p.id === showShareModal);
          return pres ? (
            <ShareModal
              presentationId={showShareModal}
              initialIsPublic={pres.isPublic}
              initialShareToken={pres.shareToken}
              onClose={() => setShowShareModal(null)}
            />
          ) : null;
        })(),
        document.body
      )}

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
            className="fixed w-44 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
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
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
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
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
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
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <Heart size={15} className={presentations.find(p => p.id === activeMenu)?.isPinned ? "fill-yellow-500 text-yellow-500" : "text-slate-500"} />
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
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
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
                    : "text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
              >
                <Link2 size={15} /> {copiedId === activeMenu ? (t.copied || "Copied!") : (t.copyLink || "Copy link")}
              </button>
              <div className="my-1.5 border-t border-slate-100 dark:border-neutral-800" />
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

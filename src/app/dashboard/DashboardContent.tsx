"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Globe, Lock, Share2, Edit3, Copy, Trash2, Link2, Loader2, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { useUser } from "@clerk/nextjs";
import { useDashboard } from "~/contexts/DashboardContext";
import { toast } from "sonner";
import { getPresentationUrl } from "~/lib/utils";
import ShareModal from "~/components/presentation/ShareModal";
import InfiniteScrollTrigger from "./components/InfiniteScrollTrigger";
import SkeletonCard from "./components/SkeletonCard";

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
  const { user: clerkUser } = useUser();
  const { user: dashboardUser } = useDashboard();
  const subscriptionPlan = dashboardUser?.subscriptionPlan;
  
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
  
  const renderedIdsRef = useRef<Set<string>>(new Set(propPresentations.map(p => p.id)));
  const prevCountRef = useRef(propPresentations.length);
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      isFirstRenderRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newIds = propPresentations
      .filter(p => !renderedIdsRef.current.has(p.id))
      .map(p => p.id);
    
    prevCountRef.current = renderedIdsRef.current.size;
    
    if (newIds.length > 0) {
      const animationDuration = newIds.length * 50 + 300;
      setTimeout(() => {
        newIds.forEach(id => renderedIdsRef.current.add(id));
      }, animationDuration);
    }
    
    setLocalPresentations(propPresentations);
  }, [propPresentations]);
  
  const presentations = localPresentations;
  const setPresentations = setLocalPresentations;

  const filteredPresentations = useMemo(() => {
    let filtered = presentations;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(query));
    }
    if (filterMode === "favorites") filtered = filtered.filter(p => p.isPinned);
    else if (filterMode === "public") filtered = filtered.filter(p => p.isPublic);
    else if (filterMode === "private") filtered = filtered.filter(p => !p.isPublic);
    return filtered;
  }, [presentations, filterMode, searchQuery]);

  const optimisticUpdate = useCallback(<T extends Partial<Presentation>>(
    presId: string,
    updates: T,
    rollback: () => void
  ) => {
    setPresentations(prev =>
      prev.map(p => p.id === presId ? { ...p, ...updates } : p)
    );
    return rollback;
  }, []);

  const optimisticRemove = useCallback((presId: string) => {
    const removed = presentations.find(p => p.id === presId);
    setPresentations(prev => prev.filter(p => p.id !== presId));
    return () => {
      if (removed) {
        setPresentations(prev => [...prev, removed].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    };
  }, [presentations]);

  const handleMenuAction = async (action: string, presId: string, _pres?: Presentation, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    switch (action) {
      case "share":
        setActiveMenu(null);
        setMenuPosition(null);
        setTimeout(() => setShowShareModal(presId), 50);
        break;
      case "rename":
        const presentation = presentations.find(p => p.id === presId);
        if (presentation) {
          setActiveMenu(null);
          setMenuPosition(null);
          setTimeout(() => {
            setRenameValue(presentation.title);
            setShowRenameDialog(presId);
          }, 50);
        }
        break;
      case "favorite":
        setActiveMenu(null);
        setMenuPosition(null);
        const currentPres = presentations.find(p => p.id === presId);
        if (!currentPres) break;
        const newPinnedState = !currentPres.isPinned;
        const rollbackFavorite = optimisticUpdate(presId, { isPinned: newPinnedState }, () => {
          setPresentations(prev => prev.map(p => p.id === presId ? { ...p, isPinned: currentPres.isPinned } : p));
        });
        toast.success(newPinnedState ? (t.addedToFavorites || "Added to favorites") : (t.removedFromFavorites || "Removed from favorites"));
        fetch(`/api/presentations/${presId}/favorite`, { method: "PATCH" })
          .catch((error) => {
            console.error("Error toggling favorite:", error);
            rollbackFavorite();
          });
        break;
      case "duplicate":
        setActiveMenu(null);
        setMenuPosition(null);
        try {
          setLoadingAction({ id: presId, action: "duplicate" });
          const response = await fetch(`/api/presentations/${presId}/duplicate`, { method: "POST" });
          if (response.ok) {
            const data = await response.json();
            setPresentations(prev => [data.presentation, ...prev]);
            toast.success(t.presentationDuplicated || "Presentation duplicated!");
          }
        } catch (error) { console.error(error); } finally { setLoadingAction(null); }
        break;
      case "copyLink":
        setActiveMenu(null);
        setMenuPosition(null);
        const copyPres = presentations.find(p => p.id === presId);
        const url = copyPres ? `${window.location.origin}${getPresentationUrl(presId, copyPres.title)}` : `${window.location.origin}/presentation/${presId}`;
        try {
          await navigator.clipboard.writeText(url);
          setCopiedId(presId);
          setTimeout(() => setCopiedId(null), 2000);
          toast.success(t.linkCopied || "Link copied!");
        } catch (error) { console.error(error); }
        break;
      case "delete":
        setActiveMenu(null);
        setMenuPosition(null);
        setShowDeleteDialog(presId);
        break;
    }
  };

  const handleRename = async (presId: string) => {
    if (!renameValue.trim()) return;
    const oldPres = presentations.find(p => p.id === presId);
    const rollbackRename = optimisticUpdate(presId, { title: renameValue }, () => {
      if (oldPres) setPresentations(prev => prev.map(p => p.id === presId ? { ...p, title: oldPres.title } : p));
    });
    setShowRenameDialog(null);
    try {
      const response = await fetch(`/api/presentations/${presId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue }),
      });
      if (!response.ok) throw new Error();
      toast.success(t.presentationRenamed || "Renamed!");
    } catch (error) {
      rollbackRename();
    }
  };

  const handleDelete = async (presId: string) => {
    const rollbackDelete = optimisticRemove(presId);
    setShowDeleteDialog(null);
    try {
      const response = await fetch(`/api/presentations/${presId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.success(t.presentationDeleted || "Deleted");
    } catch (error) {
      rollbackDelete();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMenu && !target.closest('.menu-container')) setActiveMenu(null);
      if (showFilterMenu && !target.closest('.filter-menu-container')) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu, showFilterMenu]);

  const getThumbnail = (pres: Presentation) => {
    if (pres.thumbnailUrl && pres.thumbnailUrl.startsWith("http")) return pres.thumbnailUrl;
    return "/logo.png";
  };

  return (
    <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Quick Actions & Controls Bar */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
          <div className="relative filter-menu-container">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all outline-none shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md ${
                filterMode !== "all" 
                ? "bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]" 
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-white hover:border-[#06b6d4]"
              }`}
            >
              <Filter size={14} />
              <span>{filterMode === "all" ? t.filterBy || "Filter" : filterMode}</span>
            </button>
            
            {showFilterMenu && (
              <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {(["all", "favorites", "public", "private"] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setFilterMode(mode); setShowFilterMenu(false); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-black uppercase tracking-wider transition-colors ${filterMode === mode ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${viewMode === "grid" ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Grid size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${viewMode === "list" ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ListIcon size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[400px] pb-16">
        {filteredPresentations.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center px-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-inner ring-1 ring-slate-100 dark:bg-zinc-800 dark:ring-zinc-700">
              <Upload size={32} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {presentations.length === 0 ? "No projects yet" : "No matches found"}
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-8">
              {presentations.length === 0 ? "Start by generating an AI presentation." : "Try adjusting your filters."}
            </p>
            {filterMode !== "all" && (
              <button onClick={() => setFilterMode("all")} className="text-xs font-black uppercase text-[#06b6d4] border-b-2 border-[#06b6d4]">Clear Filter</button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredPresentations.map((pres, index) => {
              const isNewCard = !isFirstRenderRef.current && !renderedIdsRef.current.has(pres.id);
              const newItemIndex = isNewCard ? index - prevCountRef.current : 0;
              const animationClass = isNewCard ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "";
              const animationStyle = isNewCard ? { animationDelay: `${Math.max(0, newItemIndex) * 75}ms`, animationFillMode: "backwards" as const } : {};
              
              return (
                <a
                  key={pres.id}
                  href={getPresentationUrl(pres.id, pres.title)}
                  className={`group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-md ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950 transition-all duration-300 hover:border-[#06b6d4]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer ${animationClass}`}
                  style={animationStyle}
                >
                  <div className="aspect-[16/10] w-full bg-slate-50 dark:bg-zinc-900 relative overflow-hidden border-b border-slate-100 dark:border-zinc-800">
                    <Image src={getThumbnail(pres)} alt={pres.title} fill className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-8 opacity-20" : "object-cover"} transition-transform duration-700 group-hover:scale-105`} />
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMenuAction("favorite", pres.id); }} className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${pres.isPinned ? "bg-yellow-400 text-white shadow-lg shadow-yellow-400/20" : "bg-white/80 dark:bg-black/50 text-slate-400 dark:text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500 shadow-sm"}`}>
                      <Heart size={16} className={pres.isPinned ? "fill-current" : ""} />
                    </button>
                    {/* Add subtle gradient overlay at bottom of image for contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    <h3 className="line-clamp-2 text-[14px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#06b6d4] transition-colors mb-4">{pres.title}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${pres.isPublic ? "text-[#06b6d4]" : "text-slate-400 dark:text-zinc-500"}`}>
                          {pres.isPublic ? <Globe size={12} strokeWidth={2.5} /> : <Lock size={12} strokeWidth={2.5} />}
                          <span className="hidden xs:inline">{pres.isPublic ? "Public" : "Private"}</span>
                        </div>
                        <span className="text-slate-300 dark:text-zinc-700 mx-0.5">•</span>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500"> {new Date(pres.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="relative menu-container">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (activeMenu === pres.id) { setActiveMenu(null); setMenuPosition(null); } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuPosition({ top: rect.top - 50, left: rect.left - 180 }); setActiveMenu(pres.id); } }} className="p-2 -mr-2 rounded-xl text-slate-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"><MoreHorizontal size={18} strokeWidth={2.5} /></button>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
            {isLoadingMore && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} index={i} />)}
            {onLoadMore && (pagination?.hasMore || isLoadingMore) && (
              <InfiniteScrollTrigger onLoadMore={onLoadMore} isLoading={isLoadingMore || false} remainingCount={pagination ? pagination.total - presentations.length : 0} moreText="more" />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPresentations.map((pres, index) => (
              <a key={pres.id} href={getPresentationUrl(pres.id, pres.title)} className="group flex items-center gap-5 rounded-[20px] border border-slate-200/80 shadow-sm ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950 p-3 transition-all duration-300 hover:border-[#06b6d4]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 cursor-pointer">
                <div className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 bg-slate-50 dark:bg-zinc-900 rounded-[14px] relative overflow-hidden border border-slate-100 dark:border-zinc-800">
                  <Image src={getThumbnail(pres)} alt={pres.title} fill className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-4 opacity-20" : "object-cover"} transition-transform duration-500 group-hover:scale-105`} />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#06b6d4] transition-colors">{pres.title}</h3>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMenuAction("favorite", pres.id); }} className={`p-1.5 rounded-lg transition-all ${pres.isPinned ? "text-yellow-500 bg-yellow-50" : "text-slate-300 hover:text-yellow-500 opacity-0 group-hover:opacity-100"}`}>
                      <Heart size={16} className={pres.isPinned ? "fill-current" : ""} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                    <div className={`flex items-center gap-1.5 ${pres.isPublic ? "text-[#06b6d4]" : "text-slate-400 dark:text-zinc-500"}`}>
                      {pres.isPublic ? <Globe size={12} strokeWidth={2.5} /> : <Lock size={12} strokeWidth={2.5} />}
                      <span className="hidden sm:inline">{pres.isPublic ? "Public" : "Private"}</span>
                    </div>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tracking-normal">{new Date(pres.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="relative menu-container px-2">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (activeMenu === pres.id) { setActiveMenu(null); setMenuPosition(null); } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuPosition({ top: rect.top - 50, left: rect.left - 180 }); setActiveMenu(pres.id); } }} className="p-2 rounded-xl text-slate-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"><MoreHorizontal size={20} strokeWidth={2.5} /></button>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Modals & Portals */}
      {showRenameDialog && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRenameDialog(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Rename Project</h3>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRename(showRenameDialog)} className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold focus:border-[#06b6d4] focus:outline-none focus:ring-4 focus:ring-[#06b6d4]/10 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white mb-6" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowRenameDialog(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleRename(showRenameDialog)} className="flex-1 rounded-2xl bg-slate-900 dark:bg-white px-4 py-3 text-sm font-black uppercase tracking-wider text-white dark:text-black hover:opacity-90 disabled:opacity-50" disabled={!renameValue.trim()}>Save</button>
            </div>
          </div>
        </div>, document.body
      )}

      {showDeleteDialog && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteDialog(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Delete Project?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteDialog(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(showDeleteDialog)} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>, document.body
      )}

      {showShareModal && createPortal(
        (() => {
          const pres = presentations.find(p => p.id === showShareModal);
          return pres ? <ShareModal presentationId={showShareModal} initialIsPublic={pres.isPublic} initialShareToken={pres.shareToken} onClose={() => setShowShareModal(null)} subscriptionPlan={subscriptionPlan} /> : null;
        })(), document.body
      )}

      {activeMenu && menuPosition && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onMouseDown={() => { setActiveMenu(null); setMenuPosition(null); }} />
          <div className="fixed w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 p-2" style={{ top: menuPosition.top, left: Math.min(window.innerWidth - 240, Math.max(8, menuPosition.left)) }}>
            <button onClick={(e) => handleMenuAction("share", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><Share2 size={16} /> Share</button>
            <button onClick={(e) => handleMenuAction("rename", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><Edit3 size={16} /> Rename</button>
            <button onClick={(e) => handleMenuAction("favorite", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
              <Heart size={16} className={presentations.find(p => p.id === activeMenu)?.isPinned ? "fill-yellow-500 text-yellow-500" : ""} />
              {presentations.find(p => p.id === activeMenu)?.isPinned ? "Unfavorite" : "Favorite"}
            </button>
            <button onClick={(e) => handleMenuAction("duplicate", activeMenu, undefined, e)} disabled={loadingAction?.id === activeMenu} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50">
              {loadingAction?.id === activeMenu ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />} Duplicate
            </button>
            <button onClick={(e) => handleMenuAction("copyLink", activeMenu, undefined, e)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${copiedId === activeMenu ? "bg-green-50 text-green-600" : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900"}`}><Link2 size={16} /> {copiedId === activeMenu ? "Copied!" : "Copy Link"}</button>
            <div className="my-2 border-t border-slate-100 dark:border-zinc-900" />
            <button onClick={(e) => handleMenuAction("delete", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={16} /> Delete</button>
          </div>
        </>, document.body
      )}
    </div>
  );
}

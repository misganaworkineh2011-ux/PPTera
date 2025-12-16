"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Star, Globe, Lock, Share2, Edit3, Copy, Trash2, Link2 } from "lucide-react";
import Image from "next/image";

interface SlideData {
  type: string;
  title: string;
  image?: {
    url: string;
    alt?: string;
  } | null;
}

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  slides: SlideData[];
  shareToken?: string | null;
}

interface DashboardContentProps {
  presentations: Presentation[];
  userName: string | null;
  searchQuery?: string;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "favorites" | "public" | "private";

export default function DashboardContent({ presentations: initialPresentations, userName, searchQuery = "" }: DashboardContentProps) {
  const router = useRouter();
  const [presentations, setPresentations] = useState(initialPresentations);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

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

  // Get thumbnail from first slide with image or fallback to logo
  const getThumbnail = (pres: Presentation) => {
    const slideWithImage = pres.slides?.find(slide => slide.image?.url);
    return slideWithImage?.image?.url || "/logo.png";
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

  const handleMenuAction = async (action: string, presId: string, pres?: Presentation) => {
    setActiveMenu(null);
    
    switch (action) {
      case "share":
        window.open(`/presentation/${presId}`, "_blank");
        break;
        
      case "rename":
        const presentation = presentations.find(p => p.id === presId);
        if (presentation) {
          setRenameValue(presentation.title);
          setShowRenameDialog(presId);
        }
        break;
        
      case "favorite":
        try {
          const response = await fetch(`/api/presentations/${presId}/favorite`, {
            method: "PATCH",
          });
          
          if (response.ok) {
            const data = await response.json();
            setPresentations(prev => 
              prev.map(p => p.id === presId ? { ...p, isPinned: data.isPinned } : p)
            );
          }
        } catch (error) {
          console.error("Error toggling favorite:", error);
          alert("Failed to update favorite status");
        }
        break;
        
      case "duplicate":
        try {
          setIsLoading(true);
          const response = await fetch(`/api/presentations/${presId}/duplicate`, {
            method: "POST",
          });
          
          if (response.ok) {
            const data = await response.json();
            // Add the duplicated presentation to the list immediately
            setPresentations(prev => [data.presentation, ...prev]);
          } else {
            alert("Failed to duplicate presentation");
          }
        } catch (error) {
          console.error("Error duplicating:", error);
          alert("Failed to duplicate presentation");
        } finally {
          setIsLoading(false);
        }
        break;
        
      case "copyLink":
        const url = `${window.location.origin}/presentation/${presId}`;
        try {
          await navigator.clipboard.writeText(url);
          setCopiedId(presId);
          setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
          console.error("Error copying link:", error);
          alert("Failed to copy link");
        }
        break;
        
      case "delete":
        setShowDeleteDialog(presId);
        break;
    }
  };

  const handleRename = async (presId: string) => {
    if (!renameValue.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/presentations/${presId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setPresentations(prev =>
          prev.map(p => p.id === presId ? { ...p, title: data.title } : p)
        );
        setShowRenameDialog(null);
        setRenameValue("");
      } else {
        alert("Failed to rename presentation");
      }
    } catch (error) {
      console.error("Error renaming:", error);
      alert("Failed to rename presentation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (presId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/presentations/${presId}/delete`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setPresentations(prev => prev.filter(p => p.id !== presId));
        setShowDeleteDialog(null);
      } else {
        alert("Failed to delete presentation");
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterMode("all")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              filterMode === "all"
                ? "bg-[#1e3a8a]/10 font-bold text-[#1e3a8a]"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
            }`}
          >
            <Grid size={16} /> All
          </button>
          <button
            onClick={() => setFilterMode("favorites")}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              filterMode === "favorites"
                ? "bg-[#1e3a8a]/10 font-bold text-[#1e3a8a]"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
            }`}
          >
            <Star size={16} /> Favorites
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative filter-menu-container">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="text-slate-400 hover:text-slate-600"
            >
              <Filter size={18} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setFilterMode("public");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Globe size={14} /> Public only
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("private");
                      setShowFilterMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Lock size={14} /> Private only
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
                viewMode === "grid"
                  ? "bg-white text-[#1e3a8a] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Grid size={20} />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
                viewMode === "list"
                  ? "bg-white text-[#1e3a8a] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ListIcon size={20} />
              <span className="text-sm font-medium">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="min-h-[600px]">
        {filteredPresentations.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <Upload size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              {presentations.length === 0 ? "No presentations yet" : "No results found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              {presentations.length === 0
                ? "Create your first AI-powered deck in seconds."
                : "No presentations match the selected filter."}
            </p>
            {filterMode !== "all" && (
              <button
                onClick={() => setFilterMode("all")}
                className="text-sm font-medium text-[#06b6d4] hover:text-[#1e3a8a]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filteredPresentations.map((pres) => (
              <a
                key={pres.id}
                href={`/presentation/${pres.id}`}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                  <Image
                    src={getThumbnail(pres)}
                    alt={pres.title}
                    fill
                    className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-3 opacity-60 group-hover:opacity-80" : "object-cover"} transition-opacity`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 group-hover:from-[#1e3a8a]/10 group-hover:to-[#06b6d4]/10 transition-colors" />
                  {pres.isPinned && (
                    <div className="absolute top-2 right-2">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-3">
                  <h3 className="mb-2 line-clamp-2 text-sm font-bold text-[#1e3a8a]" title={pres.title}>
                    {pres.title}
                  </h3>

                  {/* Public/Private Indicator */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {pres.isPublic ? (
                      <>
                        <Globe size={12} className="text-green-600" />
                        <span className="text-xs font-medium text-green-600">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">Private</span>
                      </>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-[9px] text-white font-bold">
                        {userName ? userName[0]?.toUpperCase() : "U"}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(pres.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="relative menu-container">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMenu(activeMenu === pres.id ? null : pres.id);
                        }}
                        className="text-slate-300 hover:text-[#06b6d4]"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {activeMenu === pres.id && (
                        <div className="absolute right-0 bottom-full mb-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                          <div className="p-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("share", pres.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Share2 size={14} /> Share
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("rename", pres.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Edit3 size={14} /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("favorite", pres.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Star size={14} /> {pres.isPinned ? "Remove from" : "Add to"} favorites
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("duplicate", pres.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Copy size={14} /> Duplicate
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("copyLink", pres.id);
                              }}
                              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                                copiedId === pres.id
                                  ? "bg-green-50 text-green-600"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <Link2 size={14} /> {copiedId === pres.id ? "Link copied!" : "Copy link"}
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuAction("delete", pres.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
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
                href={`/presentation/${pres.id}`}
                className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-md cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 flex-shrink-0 bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 rounded-md relative overflow-hidden">
                  <Image
                    src={getThumbnail(pres)}
                    alt={pres.title}
                    fill
                    className={`${getThumbnail(pres) === "/logo.png" ? "object-contain p-2 opacity-60 group-hover:opacity-80" : "object-cover"} transition-opacity`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#1e3a8a] truncate" title={pres.title}>
                      {pres.title}
                    </h3>
                    {pres.isPinned && (
                      <Star size={14} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(pres.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {pres.isPublic ? (
                        <>
                          <Globe size={12} className="text-green-600" />
                          <span className="text-green-600 font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={12} className="text-slate-500" />
                          <span className="text-slate-500 font-medium">Private</span>
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
                      setActiveMenu(activeMenu === pres.id ? null : pres.id);
                    }}
                    className="text-slate-300 hover:text-[#06b6d4]"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {activeMenu === pres.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                      <div className="p-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("share", pres.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <Share2 size={14} /> Share
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("rename", pres.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <Edit3 size={14} /> Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("favorite", pres.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <Star size={14} /> {pres.isPinned ? "Remove from" : "Add to"} favorites
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("duplicate", pres.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <Copy size={14} /> Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("copyLink", pres.id);
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            copiedId === pres.id
                              ? "bg-green-50 text-green-600"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Link2 size={14} /> {copiedId === pres.id ? "Link copied!" : "Copy link"}
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuAction("delete", pres.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setShowRenameDialog(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a8a] mb-4">Rename Presentation</h3>
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
              placeholder="Enter new title"
              autoFocus
              disabled={isLoading}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRenameDialog(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRename(showRenameDialog)}
                className="flex-1 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a8a]/90 disabled:opacity-50"
                disabled={isLoading || !renameValue.trim()}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#1e3a8a]">Delete Presentation</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this presentation? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
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
    </>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Globe, Lock, Share2, Edit3, Copy, Trash2, Link2, Loader2, Heart, Sparkles, ListTree, ArrowUpRight, ArrowUpDown, Check, Eye, Layers, RotateCcw, Tag, LayoutTemplate, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNavigation } from "~/contexts/NavigationContext";
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
import DeckHoverPreview from "./components/DeckHoverPreview";
import DeckCoverSlide from "./components/DeckCoverSlide";

interface Presentation {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  shareToken?: string | null;
  outlineId?: string | null;
  tags?: string[];
  viewCount?: number;
  slideCount?: number;
  previewImages?: string[];
  coverSlide?: unknown;
  themeId?: string | null;
  deletedAt?: string | Date | null;
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
type SortMode = "edited" | "name" | "oldest" | "favorites";

const SORT_LABELS: Record<SortMode, string> = {
  edited: "Last edited",
  name: "Name A–Z",
  oldest: "Oldest first",
  favorites: "Favorites first",
};

// Deterministic aurora gradient + monogram for decks without a thumbnail —
// each deck gets a stable, branded cover instead of a washed-out logo.
const AURORA_PAIRS: Array<[string, string]> = [
  ["#7c3aed", "#06b6d4"], // violet → cyan
  ["#0ea5e9", "#8b5cf6"], // sky → violet
  ["#d946ef", "#6366f1"], // fuchsia → indigo
  ["#06b6d4", "#3b82f6"], // cyan → blue
  ["#8b5cf6", "#ec4899"], // violet → pink
];

function deckGradient(title: string): [string, string] {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return AURORA_PAIRS[h % AURORA_PAIRS.length]!;
}

function deckInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]!.toUpperCase());
  return letters.join("") || "P";
}

function relativeTime(d: Date | string): string {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export default function DashboardContent({ presentations: propPresentations, userName, searchQuery = "", pagination, onLoadMore, isLoadingMore }: DashboardContentProps) {
  const { user: clerkUser } = useUser();
  const { user: dashboardUser } = useDashboard();
  const router = useRouter();
  const { startNavigating } = useNavigation();
  const subscriptionPlan = dashboardUser?.subscriptionPlan;
  
  const [localPresentations, setLocalPresentations] = useState(propPresentations);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("edited");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [loadingAction, setLoadingAction] = useState<{ id: string; action: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [trashItems, setTrashItems] = useState<Presentation[] | null>(null);
  const [trashLoading, setTrashLoading] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [showTagsDialog, setShowTagsDialog] = useState<string | null>(null); // pres id or "__bulk__"
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState<string | null>(null);
  const [duplicateTitle, setDuplicateTitle] = useState("");
  const [hoverPreview, setHoverPreview] = useState<{ id: string; idx: number } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs = useRef<Map<string, HTMLAnchorElement | null>>(new Map());
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  const renderedIdsRef = useRef<Set<string>>(new Set(propPresentations.map(p => p.id)));
  const prevCountRef = useRef(propPresentations.length);
  const isFirstRenderRef = useRef(true);
  // Decks removed locally (trash/permanent delete) — must never be resurrected
  // by a prop resync from stale parent data.
  const locallyRemovedRef = useRef<Set<string>>(new Set());
  
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

    // MERGE the incoming prop list instead of replacing state with it.
    // The parent recombines from its original SSR snapshot, so a blind
    // replace would wipe every optimistic update made since page load
    // (tags, favorites, renames) and resurrect locally-deleted decks.
    // Rule: a deck we already hold keeps its local version; new decks from
    // the props are added; locally-created decks (duplicates) survive.
    setLocalPresentations((prev) => {
      const prevById = new Map(prev.map((p) => [p.id, p]));
      const propIds = new Set(propPresentations.map((p) => p.id));
      const base = propPresentations
        .filter((p) => !locallyRemovedRef.current.has(p.id))
        .map((p) => prevById.get(p.id) ?? p);
      const localOnly = prev.filter((p) => !propIds.has(p.id));
      return [...localOnly, ...base];
    });
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
    if (activeTag) filtered = filtered.filter(p => (p.tags ?? []).includes(activeTag));

    const byEdited = (a: Presentation, b: Presentation) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    const sorted = [...filtered];
    if (sortMode === "edited") sorted.sort(byEdited);
    else if (sortMode === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortMode === "oldest") sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortMode === "favorites") sorted.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || byEdited(a, b));
    return sorted;
  }, [presentations, filterMode, searchQuery, sortMode, activeTag]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const pres of presentations) for (const tag of pres.tags ?? []) set.add(tag);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [presentations]);

  // ---- Trash: load soft-deleted decks when the trash view opens ----
  useEffect(() => {
    if (!showTrash) return;
    let cancelled = false;
    setTrashLoading(true);
    fetch("/api/dashboard/presentations?trashed=1&limit=50")
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setTrashItems(json.data ?? []); })
      .catch(() => { if (!cancelled) setTrashItems([]); })
      .finally(() => { if (!cancelled) setTrashLoading(false); });
    return () => { cancelled = true; };
  }, [showTrash]);

  const handleRestore = async (presId: string) => {
    const item = trashItems?.find((t) => t.id === presId);
    setTrashItems((prev) => (prev ?? []).filter((t) => t.id !== presId));
    try {
      const res = await fetch(`/api/presentations/${presId}/restore`, { method: "POST" });
      if (!res.ok) throw new Error();
      locallyRemovedRef.current.delete(presId);
      if (item) setPresentations((prev) => [{ ...item, deletedAt: null }, ...prev]);
      toast.success("Presentation restored");
    } catch {
      if (item) setTrashItems((prev) => [item, ...(prev ?? [])]);
      toast.error("Could not restore presentation");
    }
  };

  const handlePermanentDelete = async (presId: string) => {
    setPermanentDeleteId(null);
    const item = trashItems?.find((t) => t.id === presId);
    setTrashItems((prev) => (prev ?? []).filter((t) => t.id !== presId));
    try {
      const res = await fetch(`/api/presentations/${presId}/delete?permanent=1`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted forever");
    } catch {
      if (item) setTrashItems((prev) => [item, ...(prev ?? [])]);
      toast.error("Could not delete presentation");
    }
  };

  // ---- Bulk selection ----
  const toggleSelected = (presId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(presId)) next.delete(presId); else next.add(presId);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const bulkRun = async (action: "favorite" | "private" | "trash") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      if (action === "favorite") {
        const results = await Promise.all(ids.map((id) => fetch(`/api/presentations/${id}/favorite`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned: true }),
        })));
        if (results.some((r) => !r.ok)) throw new Error();
        setPresentations((prev) => prev.map((pres) => selectedIds.has(pres.id) ? { ...pres, isPinned: true } : pres));
        toast.success(`${ids.length} added to favorites`);
      } else if (action === "private") {
        const results = await Promise.all(ids.map((id) => fetch(`/api/presentations/${id}/visibility`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: false }),
        })));
        if (results.some((r) => !r.ok)) throw new Error();
        setPresentations((prev) => prev.map((pres) => selectedIds.has(pres.id) ? { ...pres, isPublic: false } : pres));
        toast.success(`${ids.length} made private`);
      } else {
        const results = await Promise.all(ids.map((id) => fetch(`/api/presentations/${id}/delete`, { method: "DELETE" })));
        if (results.some((r) => !r.ok)) throw new Error();
        ids.forEach((id) => locallyRemovedRef.current.add(id));
        setPresentations((prev) => prev.filter((pres) => !selectedIds.has(pres.id)));
        toast.success(`${ids.length} moved to trash`);
      }
      exitSelectMode();
    } catch {
      toast.error("Some items could not be updated");
    } finally {
      setBulkBusy(false);
    }
  };

  // ---- Tags dialog ----
  const openTagsDialog = (presId: string) => {
    const pres = presentations.find((x) => x.id === presId);
    setTagsDraft(presId === "__bulk__" ? [] : [...(pres?.tags ?? [])]);
    setTagInput("");
    setShowTagsDialog(presId);
  };

  const commitTagInput = () => {
    const tag = tagInput.trim().slice(0, 24);
    if (tag && !tagsDraft.includes(tag) && tagsDraft.length < 8) setTagsDraft((prev) => [...prev, tag]);
    setTagInput("");
  };

  const saveTags = async () => {
    const target = showTagsDialog;
    if (!target) return;
    // Fold in a tag that was typed but never committed with Enter/Add —
    // otherwise "type one tag → Save" silently saves nothing.
    const pending = tagInput.trim().slice(0, 24);
    const draft =
      pending && !tagsDraft.includes(pending) && tagsDraft.length < 8
        ? [...tagsDraft, pending]
        : tagsDraft;
    setTagInput("");
    const ids = target === "__bulk__" ? Array.from(selectedIds) : [target];
    setShowTagsDialog(null);
    try {
      await Promise.all(ids.map(async (id) => {
        const existing = target === "__bulk__" ? (presentations.find((x) => x.id === id)?.tags ?? []) : [];
        const merged = Array.from(new Set([...existing, ...draft])).slice(0, 8);
        const res = await fetch(`/api/presentations/${id}/tags`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: target === "__bulk__" ? merged : draft }),
        });
        if (!res.ok) throw new Error();
        setPresentations((prev) => prev.map((pres) => pres.id === id ? { ...pres, tags: target === "__bulk__" ? merged : draft } : pres));
      }));
      toast.success("Tags updated");
      if (target === "__bulk__") exitSelectMode();
    } catch {
      toast.error("Could not update tags");
    }
  };

  // ---- Rename-on-duplicate ----
  const executeDuplicate = async (presId: string, title: string) => {
    setShowDuplicateDialog(null);
    try {
      setLoadingAction({ id: presId, action: "duplicate" });
      const response = await fetch(`/api/presentations/${presId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPresentations((prev) => [data.presentation, ...prev]);
      toast.success(t.presentationDuplicated || "Presentation duplicated!");
    } catch {
      toast.error("Could not duplicate presentation");
    } finally {
      setLoadingAction(null);
    }
  };

  // ---- Hover slide preview ----
  const startHoverPreview = (pres: Presentation) => {
    if ((pres.slideCount ?? 0) < 1) return;
    setHoverPreview({ id: pres.id, idx: 0 });
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    hoverTimerRef.current = setInterval(() => {
      setHoverPreview((prev) => (prev && prev.id === pres.id ? { id: pres.id, idx: prev.idx + 1 } : prev));
    }, 900);
  };

  const stopHoverPreview = () => {
    if (hoverTimerRef.current) { clearInterval(hoverTimerRef.current); hoverTimerRef.current = null; }
    setHoverPreview(null);
  };

  useEffect(() => () => { if (hoverTimerRef.current) clearInterval(hoverTimerRef.current); }, []);

  // ---- Keyboard navigation across cards ----
  const focusCard = (presId: string | undefined) => {
    if (!presId) return;
    cardRefs.current.get(presId)?.focus();
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, pres: Presentation, index: number) => {
    const cols = viewMode === "grid" ? 3 : 1;
    if (e.key === "ArrowRight") { e.preventDefault(); focusCard(filteredPresentations[index + 1]?.id); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusCard(filteredPresentations[index - 1]?.id); }
    else if (e.key === "ArrowDown") { e.preventDefault(); focusCard(filteredPresentations[index + cols]?.id); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusCard(filteredPresentations[index - cols]?.id); }
    else if (e.key.toLowerCase() === "f") { e.preventDefault(); handleMenuAction("favorite", pres.id); }
    else if (e.key === "Delete") { e.preventDefault(); setShowDeleteDialog(pres.id); }
  };

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
    let removed: Presentation | undefined;
    setPresentations(prev => {
      removed = prev.find(p => p.id === presId);
      return prev.filter(p => p.id !== presId);
    });
    locallyRemovedRef.current.add(presId);
    return () => {
      locallyRemovedRef.current.delete(presId);
      if (removed) {
        const item = removed;
        setPresentations(prev => [...prev, item].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    };
  }, []);

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
        fetch(`/api/presentations/${presId}/favorite`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned: newPinnedState }),
          keepalive: true,
        }).catch((error) => {
          console.error("Error toggling favorite:", error);
          rollbackFavorite();
        });
        break;
      case "duplicate": {
        setActiveMenu(null);
        setMenuPosition(null);
        const dupPres = presentations.find(x => x.id === presId);
        setTimeout(() => {
          setDuplicateTitle(`${dupPres?.title ?? "Presentation"} (Copy)`);
          setShowDuplicateDialog(presId);
        }, 50);
        break;
      }
      case "tags":
        setActiveMenu(null);
        setMenuPosition(null);
        setTimeout(() => openTagsDialog(presId), 50);
        break;
      case "template":
        setActiveMenu(null);
        setMenuPosition(null);
        try {
          setLoadingAction({ id: presId, action: "template" });
          const res = await fetch("/api/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ presentationId: presId }),
          });
          if (!res.ok) throw new Error();
          toast.success("Saved as a template");
        } catch {
          toast.error("Could not save as template");
        } finally {
          setLoadingAction(null);
        }
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
      case "editOutline": {
        setActiveMenu(null);
        setMenuPosition(null);
        const outlinePres = presentations.find(p => p.id === presId);
        if (outlinePres?.outlineId) {
          startNavigating(); // instant branded loading feedback
          router.push(`/createpresentation/outline/${outlinePres.outlineId}?mode=ai`);
        } else {
          toast.error("This presentation has no saved outline.");
        }
        break;
      }
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
      const response = await fetch(`/api/presentations/${presId}/delete`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.success("Moved to trash - restore it anytime within 30 days");
    } catch (error) {
      rollbackDelete();
      toast.error("Could not move to trash");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMenu && !target.closest('.menu-container')) setActiveMenu(null);
      if (showFilterMenu && !target.closest('.filter-menu-container')) setShowFilterMenu(false);
      if (showSortMenu && !target.closest('.sort-menu-container')) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu, showFilterMenu, showSortMenu]);

  // Open a deck with client-side navigation: instant, keeps the dashboard
  // mounted (no full page load), and shows the branded loading overlay.
  // Capture-phase guard: any click that originates on a button inside a card
  // can never trigger the card's navigation — the anchor default is cancelled
  // before any other handler runs. (stopPropagation is deliberately NOT
  // called here so the button's own handler still fires in the bubble phase.)
  const guardInnerClicks = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) e.preventDefault();
  };

  const openPresentation = (e: React.MouseEvent, pres: Presentation) => {
    if ((e.target as HTMLElement).closest("button")) return; // button clicks never navigate
    if (selectMode) {
      e.preventDefault();
      toggleSelected(pres.id);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks through
    e.preventDefault();
    startNavigating();
    router.push(getPresentationUrl(pres.id, pres.title));
  };

  const getThumbnail = (pres: Presentation) => {
    if (pres.thumbnailUrl && pres.thumbnailUrl.startsWith("http")) {
      // Cache-bust so a regenerated cover shows immediately after edits
      const sep = pres.thumbnailUrl.includes("?") ? "&" : "?";
      return `${pres.thumbnailUrl}${sep}v=${new Date(pres.updatedAt).getTime()}`;
    }
    return "/logo.png";
  };

  const firstName = (userName || clerkUser?.firstName || "").trim().split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const totalDecks = pagination?.total ?? presentations.length;
  const favoriteCount = presentations.filter((p) => p.isPinned).length;
  const publicCount = presentations.filter((p) => p.isPublic).length;

  return (
    <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Welcome band */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-6 py-7 sm:px-8">
        {/* Aurora wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[10%] h-64 w-64 rounded-full bg-cyan-200/40 blur-[90px] dark:bg-cyan-500/10" />
          <div className="absolute -bottom-28 left-[5%] h-64 w-64 rounded-full bg-indigo-200/40 blur-[90px] dark:bg-indigo-500/10" />
          <div
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(ellipse at 20% 0%, black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 20% 0%, black 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {greeting}
            </p>
            <h1 className="mt-1 text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {[
                { label: totalDecks === 1 ? "presentation" : "presentations", value: totalDecks },
                { label: favoriteCount === 1 ? "favorite" : "favorites", value: favoriteCount },
                { label: "public", value: publicCount },
              ].map(({ label, value }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[12px] font-semibold text-slate-500 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400"
                >
                  <span className="font-black tabular-nums text-slate-800 dark:text-white">{value}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              startNavigating();
              router.push("/createpresentation");
            }}
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:shadow-cyan-600/35 hover:brightness-110"
          >
            <Sparkles size={17} className="transition-transform group-hover:rotate-12" />
            Create with AI
          </button>
        </div>
      </div>

      {/* Quick Actions & Controls Bar */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2.5">
          <div className="relative filter-menu-container">
            <button
              type="button"
              onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
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

          {/* Sort */}
          <div className="relative sort-menu-container">
            <button
              type="button"
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all outline-none shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md ${
                sortMode !== "edited"
                ? "bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-white hover:border-[#06b6d4]"
              }`}
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{SORT_LABELS[sortMode]}</span>
            </button>

            {showSortMenu && (
              <div className="absolute left-0 top-full z-20 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => { setSortMode(mode); setShowSortMenu(false); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-black uppercase tracking-wider transition-colors ${sortMode === mode ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    {SORT_LABELS[mode]}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>

          <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { startNavigating(); router.push("/dashboard/templates"); }}
            title="Template gallery — curated starters plus decks you saved with 'Use as template'"
            className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all outline-none shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-white hover:border-violet-400"
          >
            <LayoutTemplate size={14} />
            <span className="hidden md:inline">Templates</span>
          </button>
          <button
            type="button"
            onClick={() => { setShowTrash(!showTrash); exitSelectMode(); }}
            title="Trash"
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all outline-none shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md ${
              showTrash
              ? "bg-red-500/10 border-red-400 text-red-500"
              : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-white hover:border-red-400"
            }`}
          >
            <Trash2 size={14} />
            <span className="hidden md:inline">Trash</span>
          </button>
          <button
            type="button"
            onClick={() => { if (selectMode) { exitSelectMode(); } else { setSelectMode(true); setShowTrash(false); } }}
            title="Select multiple"
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all outline-none shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md ${
              selectMode
              ? "bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]"
              : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-white hover:border-[#06b6d4]"
            }`}
          >
            <Check size={14} />
            <span className="hidden md:inline">{selectMode ? "Done" : "Select"}</span>
          </button>
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
      </div>

      <div className="min-h-[400px] pb-16">
        {/* Tag filter: visible home for every tag across the decks */}
        {!showTrash && allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              <Tag size={12} /> Tags
            </span>
            {allTags.map((tag) => {
              const count = presentations.filter((p) => !p.deletedAt && (p.tags ?? []).includes(tag)).length;
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
                    activeTag === tag
                      ? "border-violet-400/70 bg-violet-500/15 text-violet-500 dark:text-violet-300"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-400/50 hover:text-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                  }`}
                >
                  #{tag}
                  <span className="text-[10px] font-black opacity-60 tabular-nums">{count}</span>
                </button>
              );
            })}
            {activeTag && (
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-400 transition-colors hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
        {showTrash ? (
          <div>
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-400/25 bg-red-500/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Trash</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">Decks here are deleted forever after 30 days.</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTrash(false)} className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Back to decks</button>
            </div>
            {trashLoading ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : (trashItems ?? []).length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-sm font-semibold text-slate-400 dark:text-zinc-500">Trash is empty</div>
            ) : (
              <div className="space-y-3">
                {(trashItems ?? []).map((pres) => (
                  <div key={pres.id} className="group flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="w-24 h-16 flex-shrink-0 rounded-[14px] relative overflow-hidden border border-slate-100 dark:border-white/10">
                      {pres.thumbnailUrl && pres.thumbnailUrl.startsWith("http") ? (
                        <Image src={pres.thumbnailUrl} alt={pres.title} fill className="object-cover opacity-70" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-80" style={{ background: `linear-gradient(135deg, ${deckGradient(pres.title)[0]}, ${deckGradient(pres.title)[1]})` }}>
                          <span className="text-lg font-black text-white/90">{deckInitials(pres.title)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-[15px] font-bold text-slate-900 dark:text-white">{pres.title}</h3>
                      {pres.deletedAt && (
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Deleted {relativeTime(pres.deletedAt)}</p>
                      )}
                    </div>
                    <button type="button" onClick={() => handleRestore(pres.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-black uppercase tracking-wider text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-500 dark:border-white/10 dark:text-zinc-300">
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button type="button" onClick={() => setPermanentDeleteId(pres.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600/90 px-3.5 py-2 text-[12px] font-black uppercase tracking-wider text-white transition-colors hover:bg-red-600">
                      <Trash2 size={13} /> Delete forever
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredPresentations.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center px-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] shadow-lg shadow-cyan-600/25">
              <Upload size={32} className="text-white" />
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPresentations.map((pres, index) => {
              const isNewCard = !isFirstRenderRef.current && !renderedIdsRef.current.has(pres.id);
              const newItemIndex = isNewCard ? index - prevCountRef.current : 0;
              const animationClass = isNewCard ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "";
              const animationStyle = isNewCard ? { animationDelay: `${Math.max(0, newItemIndex) * 75}ms`, animationFillMode: "backwards" as const } : {};
              
              return (
                <a
                  key={pres.id}
                  href={getPresentationUrl(pres.id, pres.title)}
                  ref={(el) => { cardRefs.current.set(pres.id, el); }}
                  onClickCapture={guardInnerClicks}
                  onClick={(e) => openPresentation(e, pres)}
                  onKeyDown={(e) => handleCardKeyDown(e, pres, index)}
                  onMouseEnter={() => startHoverPreview(pres)}
                  onMouseLeave={stopHoverPreview}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuPosition({
                      top: Math.min(window.innerHeight - 360, e.clientY),
                      left: e.clientX,
                    });
                    setActiveMenu(pres.id);
                  }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:shadow-[0_24px_60px_-20px_rgba(8,15,35,0.35)] dark:border-white/10 dark:bg-white/[0.04] dark:ring-0 dark:shadow-none dark:hover:bg-white/[0.06] dark:hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] cursor-pointer ${animationClass}`}
                  style={animationStyle}
                >
                  {/* Bulk selection checkbox */}
                  {selectMode && (
                    <span
                      className={`absolute top-3 left-3 z-30 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        selectedIds.has(pres.id)
                          ? "border-transparent bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                          : "border-white/80 bg-black/25 text-transparent backdrop-blur"
                      }`}
                    >
                      <Check size={14} strokeWidth={3.5} />
                    </span>
                  )}

                  {/* Aurora sheen on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), transparent 38%, transparent 62%, rgba(34,211,238,0.12))" }}
                  />

                  <div className="aspect-[16/10] w-full relative overflow-hidden border-b border-slate-100 dark:border-white/10">
                    {getThumbnail(pres) === "/logo.png" ? (
                      /* Branded monogram cover for decks without a thumbnail */
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${deckGradient(pres.title)[0]}, ${deckGradient(pres.title)[1]})` }}
                      >
                        <div
                          className="absolute inset-0 opacity-25"
                          style={{
                            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                            maskImage: "radial-gradient(ellipse at 30% 20%, black 0%, transparent 75%)",
                            WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, black 0%, transparent 75%)",
                          }}
                        />
                        <span className="relative text-5xl font-black tracking-tight text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-110">
                          {deckInitials(pres.title)}
                        </span>
                        <span className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                          PPTera deck
                        </span>
                      </div>
                    ) : (
                      <Image src={getThumbnail(pres)} alt={pres.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                    )}

                    {/* Static cover: the deck's REAL first slide, rendered live
                        (thumbnail/monogram above stays as the loading fallback) */}
                    <DeckCoverSlide coverSlide={pres.coverSlide} themeId={pres.themeId} slideCount={pres.slideCount} />

                    {/* Hover preview: the deck's ACTUAL first slides, rendered live */}
                    {hoverPreview?.id === pres.id && (
                      <DeckHoverPreview presentationId={pres.id} tick={hoverPreview.idx} />
                    )}

                    {/* Deck stats */}
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
                      {(pres.slideCount ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md">
                          <Layers size={10.5} /> {pres.slideCount}
                        </span>
                      )}
                      {(pres.viewCount ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md">
                          <Eye size={10.5} /> {pres.viewCount}
                        </span>
                      )}
                    </div>

                    {/* Readability scrim */}
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMenuAction("favorite", pres.id); }} className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-20 ${pres.isPinned ? "bg-amber-400 text-white shadow-lg shadow-amber-400/30" : "bg-white/85 dark:bg-black/50 text-slate-400 dark:text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-amber-500 shadow-sm"}`}>
                      <Heart size={16} className={pres.isPinned ? "fill-current" : ""} />
                    </button>
                    <button type="button" title="Share" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMenuAction("share", pres.id); }} className="absolute top-3 right-14 p-2 rounded-xl backdrop-blur-md transition-all z-20 bg-white/85 dark:bg-black/50 text-slate-400 dark:text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-cyan-500 shadow-sm">
                      <Share2 size={16} />
                    </button>

                    {/* Open affordance */}
                    <span className="absolute bottom-3 right-3 z-20 inline-flex translate-y-1.5 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Open <ArrowUpRight size={13} strokeWidth={2.75} />
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    <h3 className="line-clamp-2 text-[15px] font-bold text-slate-900 dark:text-white leading-snug transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-300 mb-2">{pres.title}</h3>
                    {(pres.tags?.length ?? 0) > 0 && (
                      <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        {pres.tags!.slice(0, 2).map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTag(activeTag === tag ? null : tag); }}
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                              activeTag === tag
                                ? "border-violet-400/60 bg-violet-500/15 text-violet-500 dark:text-violet-300"
                                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-400/50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                        {pres.tags!.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">+{pres.tags!.length - 2}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          pres.isPublic
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
                            : "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                        }`}>
                          {pres.isPublic ? <Globe size={11} strokeWidth={2.75} /> : <Lock size={11} strokeWidth={2.75} />}
                          <span className="hidden xs:inline">{pres.isPublic ? "Public" : "Private"}</span>
                        </span>
                        <span
                          className="truncate text-[11px] font-semibold text-slate-400 dark:text-zinc-500"
                          title={new Date(pres.updatedAt).toLocaleString()}
                        >
                          Edited {relativeTime(pres.updatedAt)}
                        </span>
                      </div>
                      <div className="relative menu-container">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (activeMenu === pres.id) { setActiveMenu(null); setMenuPosition(null); } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuPosition({ top: rect.top - 50, left: rect.left - 180 }); setActiveMenu(pres.id); } }} className="p-2 -mr-2 rounded-xl text-slate-300 dark:text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"><MoreHorizontal size={18} strokeWidth={2.5} /></button>
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
              <a key={pres.id} href={getPresentationUrl(pres.id, pres.title)} onClickCapture={guardInnerClicks} onClick={(e) => openPresentation(e, pres)} onContextMenu={(e) => { e.preventDefault(); setMenuPosition({ top: Math.min(window.innerHeight - 360, e.clientY), left: e.clientX }); setActiveMenu(pres.id); }} className={`group flex items-center gap-5 rounded-2xl border border-slate-200/80 shadow-sm ring-1 ring-slate-900/5 bg-white p-3 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_12px_36px_-12px_rgba(8,15,35,0.3)] hover:-translate-y-0.5 dark:ring-0 dark:border-white/10 dark:shadow-none dark:bg-white/[0.04] dark:hover:bg-white/[0.06] cursor-pointer ${selectMode && selectedIds.has(pres.id) ? "ring-2 ring-cyan-400/70 dark:ring-cyan-400/70" : ""}`}>
                <div className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-[14px] relative overflow-hidden border border-slate-100 dark:border-white/10">
                  {getThumbnail(pres) === "/logo.png" ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${deckGradient(pres.title)[0]}, ${deckGradient(pres.title)[1]})` }}
                    >
                      <span className="text-xl font-black text-white/90 drop-shadow">{deckInitials(pres.title)}</span>
                    </div>
                  ) : (
                    <Image src={getThumbnail(pres)} alt={pres.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <DeckCoverSlide coverSlide={pres.coverSlide} themeId={pres.themeId} slideCount={pres.slideCount} />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#06b6d4] transition-colors">{pres.title}</h3>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMenuAction("favorite", pres.id); }} className={`p-1.5 rounded-lg transition-all ${pres.isPinned ? "text-yellow-500 bg-yellow-50" : "text-slate-300 hover:text-yellow-500 opacity-0 group-hover:opacity-100"}`}>
                      <Heart size={16} className={pres.isPinned ? "fill-current" : ""} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                    <div className={`flex items-center gap-1.5 ${pres.isPublic ? "text-[#06b6d4]" : "text-slate-400 dark:text-zinc-500"}`}>
                      {pres.isPublic ? <Globe size={12} strokeWidth={2.5} /> : <Lock size={12} strokeWidth={2.5} />}
                      <span className="hidden sm:inline">{pres.isPublic ? "Public" : "Private"}</span>
                    </div>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tracking-normal" title={new Date(pres.updatedAt).toLocaleString()}>Edited {relativeTime(pres.updatedAt)}</span>
                  </div>
                </div>
                <div className="relative menu-container px-2">
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (activeMenu === pres.id) { setActiveMenu(null); setMenuPosition(null); } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuPosition({ top: rect.top - 50, left: rect.left - 180 }); setActiveMenu(pres.id); } }} className="p-2 rounded-xl text-slate-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"><MoreHorizontal size={20} strokeWidth={2.5} /></button>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectMode && selectedIds.size > 0 && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1120]/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="pr-2 text-[13px] font-black text-white tabular-nums">{selectedIds.size} selected</span>
          <button type="button" disabled={bulkBusy} onClick={() => bulkRun("favorite")} className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"><Heart size={13} /> Favorite</button>
          <button type="button" disabled={bulkBusy} onClick={() => bulkRun("private")} className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"><Lock size={13} /> Private</button>
          <button type="button" disabled={bulkBusy} onClick={() => openTagsDialog("__bulk__")} className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"><Tag size={13} /> Tag</button>
          <button type="button" disabled={bulkBusy} onClick={() => bulkRun("trash")} className="flex items-center gap-1.5 rounded-xl bg-red-600/90 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50">{bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Trash</button>
          <button type="button" onClick={exitSelectMode} className="ml-1 rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><X size={15} /></button>
        </div>, document.body
      )}

      {/* Tags dialog */}
      {showTagsDialog && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTagsDialog(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Tags</h3>
            <p className="text-xs font-semibold text-slate-400 mb-5">{showTagsDialog === "__bulk__" ? `Add tags to ${selectedIds.size} selected decks` : "Organize this deck (max 8 tags)"}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {tagsDraft.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[12px] font-bold text-violet-500 dark:text-violet-300">
                  #{tag}
                  <button type="button" onClick={() => setTagsDraft((prev) => prev.filter((x) => x !== tag))} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              ))}
              {tagsDraft.length === 0 && <span className="text-[12px] font-semibold text-slate-400">No tags yet</span>}
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitTagInput(); } }} placeholder="Add a tag and press Enter" className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#06b6d4] focus:outline-none focus:ring-4 focus:ring-[#06b6d4]/10 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white" />
              <button type="button" onClick={commitTagInput} className="rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Add</button>
            </div>
            {allTags.filter((tag) => !tagsDraft.includes(tag)).length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Your tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.filter((tag) => !tagsDraft.includes(tag)).slice(0, 10).map((tag) => (
                    <button type="button" key={tag} onClick={() => tagsDraft.length < 8 && setTagsDraft((prev) => [...prev, tag])} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:border-violet-400/60 hover:text-violet-500 dark:border-white/10 dark:text-zinc-400">
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTagsDialog(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={saveTags} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:brightness-110">Save</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Rename-on-duplicate dialog */}
      {showDuplicateDialog && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDuplicateDialog(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Duplicate Deck</h3>
            <input type="text" value={duplicateTitle} onChange={(e) => setDuplicateTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && duplicateTitle.trim() && executeDuplicate(showDuplicateDialog, duplicateTitle.trim())} className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold focus:border-[#06b6d4] focus:outline-none focus:ring-4 focus:ring-[#06b6d4]/10 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white mb-6" autoFocus />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDuplicateDialog(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => executeDuplicate(showDuplicateDialog, duplicateTitle.trim())} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-50" disabled={!duplicateTitle.trim()}>Duplicate</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Delete-forever confirm */}
      {permanentDeleteId && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setPermanentDeleteId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Delete forever?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">This permanently deletes the deck. It cannot be restored.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPermanentDeleteId(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handlePermanentDelete(permanentDeleteId)} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-red-700">Delete forever</button>
            </div>
          </div>
        </div>, document.body
      )}

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
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Move to trash?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">The deck moves to Trash — you can restore it anytime within 30 days.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteDialog(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(showDeleteDialog)} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-red-700">Move to Trash</button>
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
          <div className="menu-container fixed w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 p-2" style={{ top: menuPosition.top, left: Math.min(window.innerWidth - 240, Math.max(8, menuPosition.left)) }}>
            <button onClick={(e) => handleMenuAction("share", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><Share2 size={16} /> Share</button>
            <button onClick={(e) => handleMenuAction("rename", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><Edit3 size={16} /> Rename</button>
            {presentations.find(p => p.id === activeMenu)?.outlineId && (
              <button onClick={(e) => handleMenuAction("editOutline", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><ListTree size={16} /> Edit Outline</button>
            )}
            <button onClick={(e) => handleMenuAction("favorite", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
              <Heart size={16} className={presentations.find(p => p.id === activeMenu)?.isPinned ? "fill-yellow-500 text-yellow-500" : ""} />
              {presentations.find(p => p.id === activeMenu)?.isPinned ? "Unfavorite" : "Favorite"}
            </button>
            <button onClick={(e) => handleMenuAction("tags", activeMenu, undefined, e)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"><Tag size={16} /> Tags</button>
            <button onClick={(e) => handleMenuAction("template", activeMenu, undefined, e)} disabled={loadingAction?.id === activeMenu && loadingAction?.action === "template"} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50">
              {loadingAction?.id === activeMenu && loadingAction?.action === "template" ? <Loader2 size={16} className="animate-spin" /> : <LayoutTemplate size={16} />} Use as template
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

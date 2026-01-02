"use client";

import {
  ArrowLeft,
  Download,
  Share2,
  Play,
  Grid3X3,
  X,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Undo2,
  Redo2,
  Hash,
  Palette,
  ChevronDown,
  History,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

interface HeaderProps {
  title: string;
  editedTitle: string;
  isEditingTitle: boolean;
  slidesCount: number;
  mode: string;
  viewMode: "slides" | "scroll";
  showThumbnails: boolean;
  showPageNumbers: boolean;
  isOwner: boolean;
  theme: Theme;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  isMobile?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onBack: () => void;
  onEditTitle: () => void;
  onTitleChange: (v: string) => void;
  onSaveTitle: () => void;
  onCancelEditTitle: () => void;
  onToggleViewMode: () => void;
  onToggleThumbnails: () => void;
  onTogglePageNumbers: () => void;
  onExport: () => void;
  onShare: () => void;
  onPresent: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenThemes?: () => void;
}

export function Header({
  title,
  editedTitle,
  isEditingTitle,
  slidesCount,
  mode,
  viewMode,
  showThumbnails,
  showPageNumbers,
  isOwner,
  theme,
  isSaving,
  hasUnsavedChanges,
  isMobile = false,
  canUndo = false,
  canRedo = false,
  onBack,
  onEditTitle,
  onTitleChange,
  onSaveTitle,
  onCancelEditTitle,
  onToggleViewMode,
  onToggleThumbnails,
  onTogglePageNumbers,
  onExport,
  onShare,
  onPresent,
  onUndo,
  onRedo,
  onOpenThemes,
}: HeaderProps) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMoreMenu]);

  return (
    <header
      className={`backdrop-blur-md border-b px-3 sm:px-4 py-2 sticky top-0 z-50 ${ui.headerBg}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveTitle();
                    else if (e.key === "Escape") onCancelEditTitle();
                  }}
                  className={`font-medium border-b bg-transparent focus:outline-none text-sm w-full max-w-[200px] ${ui.headerText}`}
                  style={{ borderColor: theme.colors.primary }}
                  autoFocus
                />
                <button
                  onClick={onSaveTitle}
                  className={`p-1 rounded ${ui.headerHover} ${ui.headerIcon}`}
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  onClick={onCancelEditTitle}
                  className={`p-1 rounded ${ui.headerHover} ${ui.headerMuted}`}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1
                  className={`font-medium text-sm truncate max-w-[150px] sm:max-w-[250px] cursor-pointer transition-colors hover:opacity-80 ${ui.headerText}`}
                  onClick={isOwner ? onEditTitle : undefined}
                  title={title}
                >
                  {title}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${ui.headerMuted}`}>
                    {slidesCount} slides
                  </span>
                  {isSaving && (
                    <span className={`text-xs ${ui.headerMuted} flex items-center gap-1`}>
                      <Loader2 size={10} className="animate-spin" />
                    </span>
                  )}
                  {!isSaving && hasUnsavedChanges && (
                    <span className={`text-xs ${ui.headerMuted}`}>•</span>
                  )}
                  {!isSaving && !hasUnsavedChanges && isOwner && (
                    <span className="text-xs text-emerald-500">✓</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme button - icon + text */}
          {isOwner && onOpenThemes && (
            <button
              onClick={onOpenThemes}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
            >
              <Palette size={16} />
              <span>Theme</span>
            </button>
          )}

          {/* Share button - icon + text */}
          {isOwner && (
            <button
              onClick={onShare}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}

          {/* Present button with dropdown */}
          <div className="flex items-center">
            <button
              onClick={onPresent}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.primary,
                color: themeType === "light" ? "#ffffff" : "#18181b",
              }}
            >
              <Play size={14} fill="currentColor" />
              <span className="hidden sm:inline">Present</span>
            </button>
          </div>

          {/* More menu (three dots) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreMenu && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border backdrop-blur-md z-50 overflow-hidden ${ui.headerBg}`}
                style={{ borderColor: themeType === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
              >
                {/* Title info section */}
                <div className={`px-4 py-3 border-b ${themeType === "dark" ? "border-white/10" : "border-black/10"}`}>
                  <p className={`text-sm font-medium truncate ${ui.headerText}`}>{title}</p>
                  <p className={`text-xs ${ui.headerMuted} mt-0.5`}>
                    {slidesCount} slides {mode === "ai" && "• AI Generated"}
                  </p>
                </div>

                <div className="p-2">
                  {/* Undo/Redo */}
                  {isOwner && onUndo && onRedo && (
                    <>
                      <button
                        onClick={() => { onUndo(); setShowMoreMenu(false); }}
                        disabled={!canUndo}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${canUndo ? `${ui.headerHover} ${ui.headerText}` : `${ui.headerText} opacity-40 cursor-not-allowed`}`}
                      >
                        <div className="flex items-center gap-3">
                          <Undo2 size={16} />
                          <span>Undo</span>
                        </div>
                        <span className={`text-xs ${ui.headerMuted}`}>Ctrl+Z</span>
                      </button>
                      <button
                        onClick={() => { onRedo(); setShowMoreMenu(false); }}
                        disabled={!canRedo}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${canRedo ? `${ui.headerHover} ${ui.headerText}` : `${ui.headerText} opacity-40 cursor-not-allowed`}`}
                      >
                        <div className="flex items-center gap-3">
                          <Redo2 size={16} />
                          <span>Redo</span>
                        </div>
                        <span className={`text-xs ${ui.headerMuted}`}>Ctrl+Y</span>
                      </button>
                      <div className={`h-px my-2 ${themeType === "dark" ? "bg-white/10" : "bg-black/10"}`} />
                    </>
                  )}

                  {/* View options */}
                  <button
                    onClick={() => { onToggleViewMode(); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    {viewMode === "slides" ? <Grid3X3 size={16} /> : <Eye size={16} />}
                    <span>{viewMode === "slides" ? "Scroll View" : "Slide View"}</span>
                  </button>
                  
                  <button
                    onClick={() => { onToggleThumbnails(); setShowMoreMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={16} />
                      <span>Thumbnails</span>
                    </div>
                    {showThumbnails && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => { onTogglePageNumbers(); setShowMoreMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <Hash size={16} />
                      <span>Page Numbers</span>
                    </div>
                    {showPageNumbers && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </button>

                  {isOwner && (
                    <>
                      <div className={`h-px my-2 ${themeType === "dark" ? "bg-white/10" : "bg-black/10"}`} />
                      
                      {/* Mobile-only: Theme */}
                      {onOpenThemes && (
                        <button
                          onClick={() => { onOpenThemes(); setShowMoreMenu(false); }}
                          className={`sm:hidden w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                        >
                          <Palette size={16} />
                          <span>Theme</span>
                        </button>
                      )}

                      {/* Mobile-only: Share */}
                      <button
                        onClick={() => { onShare(); setShowMoreMenu(false); }}
                        className={`sm:hidden w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                      >
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => { onExport(); setShowMoreMenu(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                      >
                        <Download size={16} />
                        <span>Export...</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

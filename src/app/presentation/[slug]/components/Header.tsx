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
  Menu,
} from "lucide-react";
import { useState } from "react";
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
  isOwner: boolean;
  theme: Theme;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  isMobile?: boolean;
  onBack: () => void;
  onEditTitle: () => void;
  onTitleChange: (v: string) => void;
  onSaveTitle: () => void;
  onCancelEditTitle: () => void;
  onToggleViewMode: () => void;
  onToggleThumbnails: () => void;
  onExport: () => void;
  onShare: () => void;
  onPresent: () => void;
}

export function Header({
  title,
  editedTitle,
  isEditingTitle,
  slidesCount,
  mode,
  viewMode,
  showThumbnails,
  isOwner,
  theme,
  isSaving,
  hasUnsavedChanges,
  isMobile = false,
  onBack,
  onEditTitle,
  onTitleChange,
  onSaveTitle,
  onCancelEditTitle,
  onToggleViewMode,
  onToggleThumbnails,
  onExport,
  onShare,
  onPresent,
}: HeaderProps) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header
      className={`backdrop-blur-md border-b px-2 sm:px-4 py-2.5 sticky top-0 z-50 ${ui.headerBg}`}
    >
      <div className="flex items-center justify-between">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className={`p-1.5 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <div className={`h-5 w-px ${ui.divider} hidden sm:block`} />
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
                  className={`font-medium border-b bg-transparent focus:outline-none text-xs sm:text-sm w-full ${ui.headerText}`}
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
              <h1
                className={`font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[300px] cursor-pointer transition-colors ${ui.headerText}`}
                onClick={isOwner ? onEditTitle : undefined}
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <p className={`text-[10px] sm:text-xs ${ui.headerMuted}`}>
                {slidesCount} slides{mode === "ai" && " • AI"}
              </p>
              {isSaving && (
                <span
                  className={`text-[10px] sm:text-xs ${ui.headerMuted} flex items-center gap-1`}
                >
                  <Loader2 size={10} className="animate-spin" /> <span className="hidden sm:inline">Saving...</span>
                </span>
              )}
              {!isSaving && hasUnsavedChanges && (
                <span className={`text-[10px] sm:text-xs ${ui.headerMuted}`}>• Unsaved</span>
              )}
              {!isSaving && !hasUnsavedChanges && isOwner && (
                <span className="text-[10px] sm:text-xs text-emerald-500">• Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onToggleViewMode}
            className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
            title={viewMode === "slides" ? "Scroll View" : "Slides View"}
          >
            {viewMode === "slides" ? <Grid3X3 size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={onToggleThumbnails}
            className={`p-2 rounded transition-colors ${showThumbnails ? ui.headerActive : `${ui.headerIcon} ${ui.headerHover}`}`}
            title="Toggle Thumbnails"
          >
            <LayoutGrid size={18} />
          </button>

          <div className={`h-5 w-px mx-1 ${ui.divider}`} />

          {isOwner && (
            <>
              <button
                onClick={onExport}
                className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
                title="Export"
              >
                <Download size={18} />
              </button>
              <button
                onClick={onShare}
                className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </>
          )}

          <div className={`h-5 w-px mx-1 ${ui.divider}`} />

          <button
            onClick={onPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.colors.primary,
              color: themeType === "light" ? "#ffffff" : "#18181b",
            }}
          >
            <Play size={14} />
            <span className="hidden sm:inline">Present</span>
          </button>
        </div>

        {/* Mobile Burger Menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
          >
            <Menu size={20} />
          </button>

          {showMobileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMobileMenu(false)}
              />
              <div
                className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border backdrop-blur-md z-50 ${ui.headerBg} ${ui.divider}`}
              >
                <div className="p-2 space-y-1">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          onExport();
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${ui.headerHover} ${ui.headerText} text-sm`}
                      >
                        <Download size={16} />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={() => {
                          onShare();
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${ui.headerHover} ${ui.headerText} text-sm`}
                      >
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </>
                  )}
                  <div className={`h-px my-1 ${ui.divider}`} />
                  <button
                    onClick={() => {
                      onPresent();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: themeType === "light" ? "#ffffff" : "#18181b",
                    }}
                  >
                    <Play size={16} />
                    <span>Present</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

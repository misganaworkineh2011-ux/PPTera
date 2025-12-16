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
} from "lucide-react";
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

  return (
    <header
      className={`backdrop-blur-md border-b px-4 py-2.5 sticky top-0 z-50 ${ui.headerBg}`}
    >
      <div className="flex items-center justify-between">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-1.5 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div className={`h-5 w-px ${ui.divider}`} />
          <div>
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
                  className={`font-medium border-b bg-transparent focus:outline-none text-sm ${ui.headerText}`}
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
                className={`font-medium text-sm truncate max-w-[300px] cursor-pointer transition-colors ${ui.headerText}`}
                onClick={isOwner ? onEditTitle : undefined}
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <p className={`text-xs ${ui.headerMuted}`}>
                {slidesCount} slides{mode === "ai" && " • AI"}
              </p>
              {isSaving && (
                <span
                  className={`text-xs ${ui.headerMuted} flex items-center gap-1`}
                >
                  <Loader2 size={10} className="animate-spin" /> Saving...
                </span>
              )}
              {!isSaving && hasUnsavedChanges && (
                <span className={`text-xs ${ui.headerMuted}`}>• Unsaved</span>
              )}
              {!isSaving && !hasUnsavedChanges && isOwner && (
                <span className="text-xs text-emerald-500">• Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
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
      </div>
    </header>
  );
}

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
  Eye,
  Sparkles,
  Monitor,
  Maximize,
  FileText,
  Link2,
  Minus,
  Plus,
  Users,
  Crown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

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
  isPresenting?: boolean;
  presenterViewConnected?: boolean;
  // Presentation mode controls
  presentZoom?: number;
  isSpotlightActive?: boolean;
  currentSlide?: number;
  subscriptionPlan?: string | null;
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
  onExitPresent?: () => void;
  onPresentFullscreen?: () => void;
  onPresentWithNotes?: () => void;
  onShareFollowLink?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenThemes?: () => void;
  onOpenAgent?: () => void;
  // Presentation mode callbacks
  onZoomChange?: (zoom: number) => void;
  onSpotlightToggle?: () => void;
  onUpgrade?: () => void;
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
  isMobile: _isMobile = false,
  canUndo = false,
  canRedo = false,
  isPresenting = false,
  presenterViewConnected = false,
  presentZoom = 100,
  isSpotlightActive = false,
  currentSlide = 0,
  subscriptionPlan,
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
  onExitPresent,
  onPresentFullscreen,
  onPresentWithNotes,
  onShareFollowLink,
  onUndo,
  onRedo,
  onOpenThemes,
  onOpenAgent,
  onZoomChange,
  onSpotlightToggle,
  onUpgrade,
}: HeaderProps) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPresentMenu, setShowPresentMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const presentMenuRef = useRef<HTMLDivElement>(null);

  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Check if user is free
  const isFreeUser = !subscriptionPlan || subscriptionPlan.toLowerCase() === 'free';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (presentMenuRef.current && !presentMenuRef.current.contains(e.target as Node)) {
        setShowPresentMenu(false);
      }
    };
    if (showMoreMenu || showPresentMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMoreMenu, showPresentMenu]);

  // Presentation mode header - simplified with zoom, spotlight, share controls
  if (isPresenting) {
    return (
      <header
        className="backdrop-blur-md border-b px-3 sm:px-4 py-2 sticky top-0 z-50"
        style={{
          backgroundColor: `${theme.colors.background}e6`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left section - Slide counter */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${ui.headerText}`}>
              {currentSlide + 1} / {slidesCount}
            </span>
          </div>

          {/* Center section - Zoom, Spotlight, Share */}
          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <button
              onClick={() => onZoomChange?.(Math.max(50, presentZoom - 10))}
              className={`p-2 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
              title="Zoom out (-)"
            >
              <Minus size={18} />
            </button>
            
            {/* Zoom percentage display */}
            <span className={`px-2 py-1.5 text-sm font-medium min-w-[60px] text-center ${ui.headerText}`}>
              {presentZoom}%
            </span>
            
            <button
              onClick={() => onZoomChange?.(Math.min(200, presentZoom + 10))}
              className={`p-2 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
              title="Zoom in (+)"
            >
              <Plus size={18} />
            </button>
            
            {/* Divider */}
            <div className={`w-px h-6 mx-2 ${themeType === "dark" ? "bg-white/20" : "bg-black/20"}`} />
            
            {/* Spotlight toggle */}
            <button
              onClick={onSpotlightToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSpotlightActive 
                  ? 'bg-blue-500/20 text-blue-500' 
                  : `${ui.headerHover} ${ui.headerText}`
              }`}
              title={isSpotlightActive ? "Turn off spotlight (S)" : "Turn on spotlight (S)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="m4.93 4.93 2.83 2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M12 18v4" />
                <path d="m19.07 19.07-2.83-2.83" />
                <path d="M22 12h-4" />
                <path d="m19.07 4.93-2.83 2.83" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span className="hidden sm:inline">Spotlight</span>
            </button>
            
            {/* Divider */}
            <div className={`w-px h-6 mx-2 ${themeType === "dark" ? "bg-white/20" : "bg-black/20"}`} />
            
            {/* Share button */}
            <button
              onClick={onShare}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${ui.headerHover} ${ui.headerText}`}
              title="Share presentation"
            >
              <Users size={18} />
              <span className="hidden sm:inline">{t.shareBtn || "Share"}</span>
            </button>
          </div>

          {/* Right section - Exit button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExitPresent}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
              title="Exit presentation (Esc)"
            >
              <X size={14} />
              <span className="hidden sm:inline">{t.exitPresent || "Exit"}</span>
            </button>
            
            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-2 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
                title={t.moreOptions || "More options"}
              >
                <MoreHorizontal size={18} />
              </button>

              {showMoreMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-md z-50 overflow-hidden"
                  style={{ 
                    backgroundColor: `${theme.colors.background}f5`,
                    borderColor: theme.colors.border,
                  }}
                >
                  <div className="p-2">
                    <button
                      onClick={() => { 
                        if (isFreeUser) {
                          onUpgrade?.();
                        } else {
                          onOpenThemes?.();
                        }
                        setShowMoreMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                    >
                      <Palette size={16} />
                      <span>{t.themeBtn || "Theme"}</span>
                    </button>
                    <button
                      onClick={() => { 
                        if (isFreeUser) {
                          onUpgrade?.();
                        } else {
                          onOpenAgent?.();
                        }
                        setShowMoreMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                    >
                      <Sparkles size={16} />
                      <span>{t.agentBtn || "Agent"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile button */}
            <div className="hidden sm:block">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-offset-1",
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="backdrop-blur-md border-b px-3 sm:px-4 py-2 sticky top-0 z-50"
      style={{
        backgroundColor: `${theme.colors.background}e6`, // e6 = 90% opacity
        borderColor: theme.colors.border,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
            title={t.backToDashboard || "Back to Dashboard"}
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
                    {slidesCount} {t.slides || "slides"}
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
              <span>{t.themeBtn || "Theme"}</span>
            </button>
          )}

          {/* Share button - icon + text */}
          {isOwner && (
            <button
              onClick={onShare}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
            >
              <Share2 size={16} />
              <span>{t.shareBtn || "Share"}</span>
            </button>
          )}

          {/* Agent button - icon + text with dropdown arrow */}
          {isOwner && onOpenAgent && (
            <button
              onClick={() => {
                if (isFreeUser) {
                  onUpgrade?.();
                } else {
                  onOpenAgent();
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                themeType === "light" || themeType === "corporate"
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
              }`}
              title={isFreeUser ? "Upgrade to unlock AI Agent" : undefined}
            >
              <Sparkles size={16} />
              <span>{t.agentBtn || "Agent"}</span>
              <ChevronDown size={14} />
            </button>
          )}

          {/* Present button with dropdown */}
          <div className="relative" ref={presentMenuRef}>
            <div className="flex items-center h-[34px]">
              {isPresenting ? (
                <button
                  onClick={onExitPresent}
                  className="flex items-center gap-1.5 px-3 sm:px-4 h-full rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
                  title={t.exitPresent || "Exit presentation mode"}
                >
                  <X size={14} />
                  <span className="hidden sm:inline">{t.exitPresent || "Exit"}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onPresent}
                    className="flex items-center gap-1.5 px-3 sm:px-4 h-full rounded-l-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: themeType === "light" || themeType === "corporate" ? "#ffffff" : "#18181b",
                    }}
                    title={`${t.presentBtn || "Present"} (Ctrl+Enter)`}
                  >
                    <Play size={14} fill="currentColor" />
                    <span className="hidden sm:inline">{t.presentBtn || "Present"}</span>
                  </button>
                  <button
                    onClick={() => setShowPresentMenu(!showPresentMenu)}
                    className="flex items-center justify-center px-2 h-full rounded-r-lg text-sm font-medium transition-colors border-l border-white/20"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: themeType === "light" || themeType === "corporate" ? "#ffffff" : "#18181b",
                    }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </>
              )}
            </div>

            {showPresentMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border backdrop-blur-md z-50 overflow-hidden"
                style={{ 
                  backgroundColor: `${theme.colors.background}f5`, // f5 = 96% opacity
                  borderColor: theme.colors.border,
                }}
              >
                {/* Start presenting section */}
                <div className={`px-4 py-3 border-b ${themeType === "dark" ? "border-white/10" : "border-black/10"}`}>
                  <p className={`text-sm font-semibold ${ui.headerText}`}>{t.startPresenting || "Start presenting"}</p>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { onPresentFullscreen?.(); setShowPresentMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor size={18} />
                      <span>{t.inThisTab || "In this tab"}</span>
                    </div>
                    <span className={`text-xs ${ui.headerMuted}`}>Ctrl+Enter</span>
                  </button>

                  <button
                    onClick={() => { onPresent(); setShowPresentMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <Maximize size={18} />
                      <span>{t.fullScreen || "Full screen"}</span>
                    </div>
                    <span className={`text-xs ${ui.headerMuted}`}>Ctrl+Shift+Enter</span>
                  </button>

                  {onPresentWithNotes && (
                    <button
                      onClick={() => { onPresentWithNotes(); setShowPresentMenu(false); }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} />
                        <div className="text-left">
                          <span>{t.presenterView || "Presenter view"}</span>
                          <p className={`text-xs ${ui.headerMuted}`}>{t.viewNotesWhilePresenting || "View notes while presenting"}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Other ways to share section */}
                {onShareFollowLink && (
                  <>
                    <div className={`px-4 py-3 border-t ${themeType === "dark" ? "border-white/10" : "border-black/10"}`}>
                      <p className={`text-sm font-semibold ${ui.headerText}`}>{t.otherWaysToShare || "Other ways to share"}</p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => { onShareFollowLink(); setShowPresentMenu(false); }}
                        className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                      >
                        <div className="flex items-center gap-3">
                          <Link2 size={18} />
                          <div className="text-left">
                            <span>{t.shareFollowLink || "Share a follow link"}</span>
                            <p className={`text-xs ${ui.headerMuted}`}>{t.followLinkDesc || "People who join will follow you automatically"}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Upgrade button */}
          {isOwner && onUpgrade && (
            <button
              onClick={onUpgrade}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              title={t.upgradeBtn || "Upgrade"}
            >
              <Crown size={16} />
              <span>{t.upgradeBtn || "Upgrade"}</span>
            </button>
          )}

          {/* More menu (three dots) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2 rounded-lg transition-colors ${ui.headerHover} ${ui.headerIcon}`}
              title={t.moreOptions || "More options"}
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border backdrop-blur-md z-50 overflow-hidden"
                style={{ 
                  backgroundColor: `${theme.colors.background}f5`, // f5 = 96% opacity
                  borderColor: theme.colors.border,
                }}
              >
                {/* Title info section */}
                <div className={`px-4 py-3 border-b ${themeType === "dark" ? "border-white/10" : "border-black/10"}`}>
                  <p className={`text-sm font-medium truncate ${ui.headerText}`}>{title}</p>
                  <p className={`text-xs ${ui.headerMuted} mt-0.5`}>
                    {slidesCount} {t.slides || "slides"} {mode === "ai" && `• ${t.aiGenerated || "AI Generated"}`}
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
                          <span>{t.undoBtn || "Undo"}</span>
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
                          <span>{t.redoBtn || "Redo"}</span>
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
                    <span>{viewMode === "slides" ? (t.scrollView || "Scroll View") : (t.slideView || "Slide View")}</span>
                  </button>
                  
                  <button
                    onClick={() => { onToggleThumbnails(); setShowMoreMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={16} />
                      <span>{t.thumbnails || "Thumbnails"}</span>
                    </div>
                    {showThumbnails && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => { onTogglePageNumbers(); setShowMoreMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                  >
                    <div className="flex items-center gap-3">
                      <Hash size={16} />
                      <span>{t.pageNumbers || "Page Numbers"}</span>
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
                          <span>{t.themeBtn || "Theme"}</span>
                        </button>
                      )}

                      {/* Mobile-only: Share */}
                      <button
                        onClick={() => { onShare(); setShowMoreMenu(false); }}
                        className={`sm:hidden w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                      >
                        <Share2 size={16} />
                        <span>{t.shareBtn || "Share"}</span>
                      </button>

                      <button
                        onClick={() => { onExport(); setShowMoreMenu(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                      >
                        <Download size={16} />
                        <span>{t.exportMenuBtn || "Export..."}</span>
                      </button>

                      {/* Mobile-only: Agent */}
                      {onOpenAgent && (
                        <button
                          onClick={() => { 
                            if (isFreeUser) {
                              onUpgrade?.();
                            } else {
                              onOpenAgent();
                            }
                            setShowMoreMenu(false);
                          }}
                          className={`sm:hidden w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${ui.headerHover} ${ui.headerText}`}
                          title={isFreeUser ? "Upgrade to unlock AI Agent" : undefined}
                        >
                          <Sparkles size={16} />
                          <span>{t.agentBtn || "Agent"}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile button */}
          <div className="hidden sm:block">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-offset-1",
                  userButtonTrigger: "focus:shadow-none",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

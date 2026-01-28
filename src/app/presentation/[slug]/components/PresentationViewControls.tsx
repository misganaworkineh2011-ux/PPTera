"use client";

import { Minimize2, Minus, Plus, Users, X } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

interface PublicViewControlsProps {
  isFullscreen: boolean;
  viewMode: "slides" | "scroll";
  theme: Theme;
  onToggleViewMode: () => void;
  onToggleFullscreen: () => void;
}

export function PublicViewControls({
  isFullscreen,
  viewMode,
  theme,
  onToggleViewMode,
  onToggleFullscreen,
}: PublicViewControlsProps) {
  const ui = getUIColors(getThemeType(theme));

  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex items-center gap-2">
      {!isFullscreen && (
        <button
          onClick={onToggleViewMode}
          className={`p-2 sm:p-2.5 rounded-lg backdrop-blur-sm transition-colors ${ui.headerBg} ${ui.headerText} hover:opacity-80`}
          title={viewMode === "slides" ? "Switch to scroll view" : "Switch to slides view"}
        >
          {viewMode === "slides" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          )}
        </button>
      )}

      <button
        onClick={onToggleFullscreen}
        className={`p-2 sm:p-2.5 rounded-lg backdrop-blur-sm transition-colors ${ui.headerBg} ${ui.headerText} hover:opacity-80`}
        title={isFullscreen ? "Exit present mode" : "Enter present mode"}
      >
        {isFullscreen ? (
          <Minimize2 size={18} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>
    </div>
  );
}

interface FullscreenNavbarProps {
  isVisible: boolean;
  theme: Theme;
  currentSlide: number;
  totalSlides: number;
  presentZoom: number;
  isSpotlightActive: boolean;
  onShowNavbar: () => void;
  onHideNavbar: () => void;
  onZoomChange: (value: number) => void;
  onToggleSpotlight: () => void;
  onShare: () => void;
  onExit: () => void;
}

export function FullscreenNavbar({
  isVisible,
  theme,
  currentSlide,
  totalSlides,
  presentZoom,
  isSpotlightActive,
  onShowNavbar,
  onHideNavbar,
  onZoomChange,
  onToggleSpotlight,
  onShare,
  onExit,
}: FullscreenNavbarProps) {
  return (
    <>
      {!isVisible && (
        <div
          className="fixed top-0 left-0 right-0 h-4 z-50"
          onMouseEnter={onShowNavbar}
        />
      )}

      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b px-3 sm:px-4 py-2 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
        style={{
          backgroundColor: `${theme.colors.background}e6`,
          borderColor: theme.colors.border,
        }}
        onMouseLeave={onHideNavbar}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onZoomChange(Math.max(50, presentZoom - 10))}
              className="p-2 rounded-lg transition-colors hover:bg-black/10"
              style={{ color: theme.colors.text }}
              title="Zoom out (-)"
            >
              <Minus size={18} />
            </button>

            <span className="px-2 py-1.5 text-sm font-medium min-w-[60px] text-center" style={{ color: theme.colors.text }}>
              {presentZoom}%
            </span>

            <button
              onClick={() => onZoomChange(Math.min(200, presentZoom + 10))}
              className="p-2 rounded-lg transition-colors hover:bg-black/10"
              style={{ color: theme.colors.text }}
              title="Zoom in (+)"
            >
              <Plus size={18} />
            </button>

            <div className="w-px h-6 mx-2 bg-current opacity-20" />

            <button
              onClick={onToggleSpotlight}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSpotlightActive ? "bg-blue-500/20 text-blue-500" : "hover:bg-black/10"
              }`}
              style={!isSpotlightActive ? { color: theme.colors.text } : undefined}
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

            <div className="w-px h-6 mx-2 bg-current opacity-20" />

            <button
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-black/10"
              style={{ color: theme.colors.text }}
              title="Share presentation"
            >
              <Users size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
              title="Exit fullscreen (Esc)"
            >
              <X size={14} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

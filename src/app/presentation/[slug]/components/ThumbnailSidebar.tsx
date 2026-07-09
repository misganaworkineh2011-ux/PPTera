"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, LayoutGrid, List, Copy, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getUIColors, getModalColors } from "./ui-colors";
import { getThemeType } from "./types";

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  if (!hexColor || !hexColor.startsWith("#")) return true;
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

type ViewMode = "grid" | "list";

interface ThumbnailSidebarProps {
  slides: SlideData[];
  currentSlide?: number;
  onSlideClick: (i: number) => void;
  onClose: () => void;
  renderSlide: (
    slide: SlideData,
    index: number,
    isMain: boolean
  ) => React.ReactNode;
  theme: Theme;
  isFreeUserLimited?: boolean;
  freeSlideLimit?: number;
  halfBlurredSlideIndex?: number;
  // Right-click slide actions
  onDuplicateSlide?: (index: number) => void;
  onMoveSlide?: (index: number, direction: "up" | "down") => void;
  onDeleteSlide?: (index: number) => void;
  onAddSlideAfter?: (index: number) => void;
}

export function ThumbnailSidebar({
  slides,
  currentSlide = 0,
  onSlideClick,
  onClose,
  renderSlide,
  theme,
  isFreeUserLimited = false,
  freeSlideLimit,
  halfBlurredSlideIndex,
  onDuplicateSlide,
  onMoveSlide,
  onDeleteSlide,
  onAddSlideAfter,
}: ThumbnailSidebarProps) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  const modalColors = getModalColors(theme);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Keep the active slide's thumbnail scrolled into view so its highlight is
  // always visible when navigating via arrows, keyboard, or clicks.
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentSlide, viewMode]);

  // Right-click context menu, positioned at the cursor.
  const hasMenuActions = !!(onDuplicateSlide || onMoveSlide || onDeleteSlide || onAddSlideAfter);
  const [menu, setMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const openMenu = (e: React.MouseEvent, index: number) => {
    if (!hasMenuActions) return;
    e.preventDefault();
    e.stopPropagation();
    setMenu({ index, x: e.clientX, y: e.clientY });
  };

  const renderContextMenu = () => {
    if (!menu) return null;
    const items = [
      onDuplicateSlide && { icon: <Copy size={14} />, label: "Duplicate", onClick: () => onDuplicateSlide(menu.index) },
      onAddSlideAfter && { icon: <Plus size={14} />, label: "Add slide after", onClick: () => onAddSlideAfter(menu.index) },
      onMoveSlide && { icon: <ArrowUp size={14} />, label: "Move up", disabled: menu.index === 0, onClick: () => onMoveSlide(menu.index, "up") },
      onMoveSlide && { icon: <ArrowDown size={14} />, label: "Move down", disabled: menu.index === slides.length - 1, onClick: () => onMoveSlide(menu.index, "down") },
    ].filter(Boolean) as { icon: React.ReactNode; label: string; disabled?: boolean; onClick: () => void }[];

    const W = 196;
    const H = 52 + items.length * 34 + (onDeleteSlide ? 46 : 0);
    const left = Math.min(menu.x, window.innerWidth - W - 8);
    const top = Math.min(menu.y, window.innerHeight - H - 8);

    return createPortal(
      <div
        className="fixed z-[120] min-w-[196px] overflow-hidden rounded-xl border py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
        style={{ top, left, background: modalColors.bg, borderColor: modalColors.border }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: modalColors.textMuted }}>
          Slide {menu.index + 1}
        </div>
        {items.map((it, i) => (
          <button
            key={i}
            disabled={it.disabled}
            onClick={() => { it.onClick(); setMenu(null); }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-40"
            style={{ color: modalColors.text }}
            onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.backgroundColor = modalColors.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span style={{ color: modalColors.textMuted }}>{it.icon}</span>
            {it.label}
          </button>
        ))}
        {onDeleteSlide && (
          <>
            <div className="my-1 h-px" style={{ backgroundColor: modalColors.border }} />
            <button
              onClick={() => { onDeleteSlide(menu.index); setMenu(null); }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>,
      document.body,
    );
  };

  // Filter slides based on lock status
  const visibleSlides = slides.filter((_, index) => {
    if (!isFreeUserLimited) return true;
    if (freeSlideLimit === undefined || halfBlurredSlideIndex === undefined) return true;
    // Show slides up to and including the half-blurred slide
    return index <= halfBlurredSlideIndex;
  });
  
  // Check if theme has a background image
  const hasBgImage = !!(theme.backgroundImage || theme.previewBackgroundImage);
  
  // Theme-aware background styles - use semi-transparent for bg image themes
  const bgStyle = hasBgImage 
    ? { 
        background: `rgba(${isColorDark(theme.colors.background) ? '0,0,0' : '255,255,255'}, 0.85)`,
        backdropFilter: 'blur(12px)',
      }
    : { background: modalColors.bg };
  const bgClass = "";

  // For list view: sidebar shrinks to content and centers vertically
  // For grid view: sidebar is full height
  if (viewMode === "list") {
    return (
      <div className="w-44 shrink-0 fixed left-0 top-[56px] h-[calc(100vh-56px)] flex items-center">
        <aside
          className={`w-full mx-2 px-2 py-3 rounded-xl border shadow-lg ${bgClass}`}
          style={{
            ...bgStyle,
            borderColor: modalColors.border,
          }}
        >
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ backgroundColor: modalColors.surface }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-1.5 rounded-full transition-all"
                style={{ color: modalColors.textMuted }}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-1.5 rounded-full transition-all shadow-sm"
                style={{ 
                  backgroundColor: modalColors.surfaceHover,
                  color: modalColors.text
                }}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: modalColors.textMuted }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Slide list */}
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {visibleSlides.map((slide, visibleIndex) => {
              // Get the original index from the full slides array
              const originalIndex = slides.indexOf(slide);
              return (
                <button
                  key={originalIndex}
                  ref={currentSlide === originalIndex ? activeRef : undefined}
                  onClick={() => onSlideClick(originalIndex)}
                  onContextMenu={(e) => openMenu(e, originalIndex)}
                  className="w-full flex items-center gap-1.5"
                >
                  <div
                    className="w-5 h-5 shrink-0 flex items-center justify-center rounded text-[10px] font-semibold transition-colors"
                    style={
                      currentSlide === originalIndex
                        ? { backgroundColor: modalColors.accent, color: "#ffffff" }
                        : { backgroundColor: modalColors.surface, color: modalColors.textMuted }
                    }
                  >
                    {originalIndex + 1}
                  </div>
                  <div
                    className="flex-1 text-left py-1 px-1.5 rounded text-xs truncate transition-colors"
                    style={
                      currentSlide === originalIndex
                        ? { backgroundColor: modalColors.surface, color: modalColors.accent }
                        : { color: modalColors.text }
                    }
                  >
                    {slide.title || slide.subtitle || `Slide ${originalIndex + 1}`}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
        {renderContextMenu()}
      </div>
    );
  }

  // Grid view - full height sidebar
  return (
    <aside
      className={`w-44 shrink-0 h-[calc(100vh-56px)] fixed left-0 top-[56px] flex flex-col border-r ${bgClass}`}
      style={{
        ...bgStyle,
        borderColor: modalColors.border,
      }}
    >
      {/* Header with toggle */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ backgroundColor: modalColors.surface }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-full transition-all shadow-sm"
              style={{ 
                backgroundColor: modalColors.surfaceHover,
                color: modalColors.text
              }}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded-full transition-all"
              style={{ color: modalColors.textMuted }}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: modalColors.textMuted }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slides grid */}
      <div
        className={`flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin ${ui.scrollbar} space-y-1.5`}
      >
        {visibleSlides.map((slide, visibleIndex) => {
          // Get the original index from the full slides array
          const originalIndex = slides.indexOf(slide);
          return (
            <button
              key={originalIndex}
              ref={currentSlide === originalIndex ? activeRef : undefined}
              onClick={() => onSlideClick(originalIndex)}
              onContextMenu={(e) => openMenu(e, originalIndex)}
              className="w-full group relative"
            >
              <div
                className="aspect-video overflow-hidden rounded ring-1 pointer-events-none transition-shadow duration-200"
                style={{
                  boxShadow: currentSlide === originalIndex
                    ? `0 0 0 2.5px ${modalColors.accent}, 0 6px 16px -4px ${modalColors.accent}66`
                    : undefined,
                  ["--tw-ring-color" as string]: currentSlide === originalIndex
                    ? modalColors.accent
                    : modalColors.border,
                  willChange: "box-shadow",
                }}
              >
                {renderSlide(slide, originalIndex, false)}
              </div>
              <div
                className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold transition-colors"
                style={{
                  backgroundColor: currentSlide === originalIndex
                    ? modalColors.accent
                    : modalColors.isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)",
                  color: currentSlide === originalIndex ? "#ffffff" : modalColors.text,
                }}
              >
                {originalIndex + 1}
              </div>
            </button>
          );
        })}
      </div>
      {renderContextMenu()}
    </aside>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Palette,
  Sparkles,
  Copy,
  MoveUp,
  MoveDown,
  Trash2,
  PlusCircle,
  ImagePlus,
  LayoutGrid,
  Link2,
  Loader2,
  Send,
  BarChart3,
  Wand2,
  Lock,
} from "lucide-react";
import { type LayoutType } from "~/lib/slide-layouts";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "./ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// ============================================================================
// TYPES
// ============================================================================

interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

interface SlideContent {
  type?: "title" | "content";
  title: string;
  subtitle?: string;
  bullets?: string[];
  sections?: Array<{ heading: string; description: string }>;
  introText?: string;
  tagline?: string;
  layout?: LayoutType;
  image?: SlideImage | null;
  images?: SlideImage[];
}

interface SlideMenuProps {
  index: number;
  totalSlides: number;
  imageCount: number;
  hasChart?: boolean;
  slideContent?: SlideContent;
  speakerNotes?: string[];
  theme?: Theme;
  currentAnimation?: string;
  onChangeContentLayout?: () => void;
  onDuplicate: () => void;
  onAddSlide: () => void;
  onAddImage: () => void;
  onAddChart?: () => void;
  onRemoveChart?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAIEdit?: (editedSlide: SlideContent) => void;
  onAddNote?: (note: string) => void;
  onEditNote?: (noteIndex: number, note: string) => void;
  onDeleteNote?: (noteIndex: number) => void;
  onOpenAnimationPicker?: () => void;
  isAIEditing?: boolean;
  onAIEditingChange?: (isEditing: boolean) => void;
  subscriptionPlan?: string | null;
  onUpgrade?: () => void;
}

type ActivePanel = "none" | "more" | "styling" | "ai";

// Theme colors helper
interface ThemeColors {
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  surface: string;
  hoverBg: string;
  divider: string;
}

function getThemeColors(theme?: Theme): ThemeColors {
  if (!theme) {
    return {
      bg: "#ffffff",
      border: "rgba(226, 232, 240, 0.8)",
      text: "#334155",
      textMuted: "#94a3b8",
      surface: "#f1f5f9",
      hoverBg: "#f1f5f9",
      divider: "#f1f5f9",
    };
  }
  
  const colors = getModalColors(theme);
  
  return {
    bg: colors.bg,
    border: colors.border,
    text: colors.text,
    textMuted: colors.textMuted,
    surface: colors.surface,
    hoverBg: colors.hoverBg,
    divider: colors.border,
  };
}

// ============================================================================
// PANEL COMPONENTS
// ============================================================================

interface MorePanelProps {
  index: number;
  totalSlides: number;
  colors: ThemeColors;
  t: Record<string, string>;
  onDuplicate: () => void;
  onAddSlide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}

function MorePanel({
  index,
  totalSlides,
  colors,
  t,
  onDuplicate,
  onAddSlide,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCopyLink,
  onClose,
}: MorePanelProps) {
  return (
    <div 
      className="rounded-xl shadow-2xl p-2 min-w-[180px]"
      style={{ 
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="space-y-0.5">
        <MenuButton
          icon={<Copy size={15} />}
          label={t.duplicate || "Duplicate"}
          colors={colors}
          onClick={() => { onDuplicate(); onClose(); }}
        />
        <MenuButton
          icon={<PlusCircle size={15} />}
          label={t.addSlideBelow || "Add slide below"}
          colors={colors}
          onClick={() => { onAddSlide(); onClose(); }}
        />
        <MenuButton
          icon={<Link2 size={15} />}
          label={t.copyLinkSlide || "Copy link"}
          colors={colors}
          onClick={() => { onCopyLink(); onClose(); }}
        />
        <div className="h-px my-1.5" style={{ backgroundColor: colors.divider }} />
        <MenuButton
          icon={<MoveUp size={15} />}
          label={t.moveUp || "Move up"}
          colors={colors}
          onClick={onMoveUp}
          disabled={index === 0}
        />
        <MenuButton
          icon={<MoveDown size={15} />}
          label={t.moveDown || "Move down"}
          colors={colors}
          onClick={onMoveDown}
          disabled={index === totalSlides - 1}
        />
        <div className="h-px my-1.5" style={{ backgroundColor: colors.divider }} />
        <MenuButton
          icon={<Trash2 size={15} />}
          label={t.delete || "Delete"}
          colors={colors}
          onClick={() => { onDelete(); onClose(); }}
          disabled={totalSlides <= 1}
          danger
        />
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  colors,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  colors: ThemeColors;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
      style={{
        color: disabled ? colors.textMuted : danger ? "#dc2626" : colors.text,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = danger ? "rgba(254, 226, 226, 0.5)" : colors.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface StylingPanelProps {
  imageCount: number;
  hasChart?: boolean;
  slideType?: "title" | "content";
  currentAnimation?: string;
  colors: ThemeColors;
  t: Record<string, string>;
  onChangeContentLayout?: () => void;
  onAddImage: () => void;
  onAddChart?: () => void;
  onRemoveChart?: () => void;
  onOpenAnimationPicker?: () => void;
  onClose: () => void;
}

function StylingPanel({
  imageCount,
  hasChart,
  slideType,
  currentAnimation,
  colors,
  t,
  onChangeContentLayout,
  onAddImage,
  onAddChart,
  onRemoveChart,
  onOpenAnimationPicker,
  onClose,
}: StylingPanelProps) {
  const handleAction = (action: () => void) => () => {
    action();
    onClose();
  };

  const showContentLayout = slideType !== "title" && onChangeContentLayout;
  // Title slides pick a cover composition via the same panel (cover mode).
  const showCoverStyle = slideType === "title" && onChangeContentLayout;

  // Get animation display name
  const getAnimationName = (animationId?: string) => {
    if (!animationId || animationId === "none") return t.noAnimation || "None";
    if (animationId === "fade") return "Fade";
    // Capitalize first letter and replace dashes with spaces
    return animationId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div 
      className="rounded-xl shadow-2xl p-2 min-w-[200px]"
      style={{ 
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="space-y-0.5">
        {showContentLayout && (
          <MenuButton
            icon={<LayoutGrid size={15} />}
            label={t.contentLayout || "Content layout"}
            colors={colors}
            onClick={handleAction(onChangeContentLayout)}
          />
        )}
        {showCoverStyle && (
          <MenuButton
            icon={<LayoutGrid size={15} />}
            label={t.coverStyle || "Cover style"}
            colors={colors}
            onClick={handleAction(onChangeContentLayout)}
          />
        )}
        <MenuButton
          icon={<ImagePlus size={15} />}
          label={imageCount > 0 ? `${t.imagesCount || "Images"} (${imageCount})` : (t.addImageBtn || "Add image")}
          colors={colors}
          onClick={handleAction(onAddImage)}
        />
        {onAddChart && (
          <MenuButton
            icon={<BarChart3 size={15} />}
            label={hasChart ? (t.editChartSlide || "Edit chart") : (t.addChartSlide || "Add chart")}
            colors={colors}
            onClick={handleAction(onAddChart)}
          />
        )}
        {onOpenAnimationPicker && (
          <>
            <div className="h-px my-1.5" style={{ backgroundColor: colors.divider }} />
            <MenuButton
              icon={<Wand2 size={15} />}
              label={`${t.animation || "Animation"}: ${getAnimationName(currentAnimation)}`}
              colors={colors}
              onClick={handleAction(onOpenAnimationPicker)}
            />
          </>
        )}
        {hasChart && onRemoveChart && (
          <MenuButton
            icon={<Trash2 size={15} />}
            label={t.removeChart || "Remove chart"}
            colors={colors}
            onClick={handleAction(onRemoveChart)}
            danger
          />
        )}
      </div>
    </div>
  );
}

interface AIPanelProps {
  slideContent?: SlideContent;
  colors: ThemeColors;
  t: Record<string, string>;
  onAIEdit?: (editedSlide: SlideContent) => void;
  onClose: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  isFreeUser?: boolean;
  onUpgrade?: () => void;
}

function AIPanel({
  slideContent,
  colors,
  t,
  onAIEdit,
  onClose,
  onLoadingChange,
  isFreeUser = false,
  onUpgrade,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || !slideContent || !onAIEdit || isFreeUser) return;
    
    if (isFreeUser) {
      onUpgrade?.();
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/edit-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide: slideContent,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to edit slide");
      }

      const data = await response.json();
      if (data.success && data.slide) {
        onAIEdit(data.slide);
        setPrompt("");
        onClose();
      } else {
        throw new Error("No edited content returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit slide");
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    { key: "addRelevantImage", fallback: "Add a relevant image" },
    { key: "makeMoreProfessional", fallback: "Make it more professional" },
    { key: "addMoreBulletPoints", fallback: "Add more bullet points" },
    { key: "simplifyContentBtn", fallback: "Simplify the content" },
  ];

  return (
    <div
      className="rounded-xl shadow-2xl p-3 w-[320px]"
      style={{ 
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.text }}>{t.editWithAIBtn || "Edit with AI"}</p>
          <p className="text-[11px]" style={{ color: colors.textMuted }}>
            {isFreeUser ? "Upgrade to unlock" : (t.creditsPerEdit || "2 credits per edit")}
          </p>
        </div>
      </div>

      {isFreeUser && (
        <div className="mb-2 px-3 py-2 text-xs bg-blue-50 rounded-lg flex items-center gap-2" style={{ color: colors.text }}>
          <Lock size={12} />
          <span>Upgrade to use AI editing features</span>
        </div>
      )}

      {error && (
        <div className="mb-2 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => e.stopPropagation()}
          placeholder={t.howEditSlide || "How would you like to edit this slide?"}
          className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
          style={{ 
            backgroundColor: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
          rows={2}
          disabled={isLoading}
        />
        <button
          className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          onClick={() => isFreeUser ? onUpgrade?.() : handleSubmit()}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <Loader2 size={14} className="text-white animate-spin" />
          ) : isFreeUser ? (
            <Lock size={14} className="text-white" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.key}
            onClick={() => setPrompt(t[suggestion.key] || suggestion.fallback)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs rounded-full transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: colors.surface,
              color: colors.textMuted,
            }}
          >
            {t[suggestion.key] || suggestion.fallback}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SlideMenu({
  index,
  totalSlides,
  imageCount,
  hasChart,
  slideContent,
  theme,
  currentAnimation,
  onChangeContentLayout,
  onDuplicate,
  onAddSlide,
  onAddImage,
  onAddChart,
  onRemoveChart,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAIEdit,
  onAIEditingChange,
  onOpenAnimationPicker,
  subscriptionPlan,
  onUpgrade,
}: SlideMenuProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  // Get theme colors
  const colors = getThemeColors(theme);

  // Check if user is free
  const isFreeUser = !subscriptionPlan || subscriptionPlan.toLowerCase() === 'free';

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-slide-toolbar]") && !target.closest("[data-slide-panel]")) {
        setActivePanel("none");
      }
    };
    if (activePanel !== "none") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activePanel]);

  const openPanel = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setActivePanel("none");
      return;
    }

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }
    setActivePanel(panel);
  };

  const handleCopyLink = () => {
    const url = `${window.location.href}#slide-${index + 1}`;
    navigator.clipboard.writeText(url);
  };

  const closePanel = () => setActivePanel("none");

  const renderPanel = () => {
    if (activePanel === "none" || !portalContainer) return null;

    const panelContent = (() => {
      switch (activePanel) {
        case "more":
          return (
            <MorePanel
              index={index}
              totalSlides={totalSlides}
              colors={colors}
              t={t}
              onDuplicate={onDuplicate}
              onAddSlide={onAddSlide}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onDelete}
              onCopyLink={handleCopyLink}
              onClose={closePanel}
            />
          );
        case "styling":
          return (
            <StylingPanel
              imageCount={imageCount}
              hasChart={hasChart}
              slideType={slideContent?.type}
              currentAnimation={currentAnimation}
              colors={colors}
              t={t}
              onChangeContentLayout={onChangeContentLayout}
              onAddImage={onAddImage}
              onAddChart={onAddChart}
              onRemoveChart={onRemoveChart}
              onOpenAnimationPicker={onOpenAnimationPicker}
              onClose={closePanel}
            />
          );
        case "ai":
          return (
            <AIPanel
              slideContent={slideContent}
              colors={colors}
              t={t}
              onAIEdit={onAIEdit}
              onClose={closePanel}
              onLoadingChange={onAIEditingChange}
              isFreeUser={isFreeUser}
              onUpgrade={onUpgrade}
            />
          );
        default:
          return null;
      }
    })();

    return createPortal(
      <div
        data-slide-panel
        className="fixed z-[99999]"
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          transform: "translateX(-100%)",
        }}
      >
        {panelContent}
      </div>,
      portalContainer
    );
  };

  return (
    <>
      {/* Redesigned Toolbar - Clean, modern look */}
      <div
        ref={toolbarRef}
        data-slide-toolbar
        data-slide-menu
        className="absolute top-3 right-3 z-30"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-300 ring-1 ring-black/10">
          {/* More Options */}
          <button
            onClick={() => openPanel("more")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              activePanel === "more"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
            title={t.moreOptions || "More options"}
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Styling */}
          <button
            onClick={() => openPanel("styling")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              activePanel === "styling"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
            title={t.styling || "Styling"}
          >
            <Palette size={16} />
          </button>

          {/* AI Edit */}
          <button
            onClick={() => openPanel("ai")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              activePanel === "ai"
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                : isFreeUser
                  ? "text-slate-400 hover:bg-slate-100 cursor-not-allowed"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            }`}
            title={isFreeUser ? "Upgrade to unlock AI editing" : (t.editWithAIBtn || "Edit with AI")}
          >
            {isFreeUser ? <Lock size={16} /> : <Sparkles size={16} />}
          </button>
        </div>
      </div>

      {renderPanel()}
    </>
  );
}

"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
import { X, Sparkles, Play, Check, Layers, Crown, Lock } from "lucide-react";
import {
  ANIMATION_PRESETS,
  getAnimationCategories,
  type AnimationPreset,
  type AnimationCategory,
} from "~/lib/animations";
import type { Theme } from "~/lib/themes";
import { useLanguage } from "~/contexts/LanguageContext";

interface AnimationPickerProps {
  isOpen: boolean;
  currentAnimation?: string;
  contentAnimation?: boolean;
  theme: Theme;
  isPaidUser?: boolean;
  subscriptionPlan?: string | null;
  onSelect: (animationId: string) => void;
  onContentAnimationChange?: (enabled: boolean) => void;
  onUpgrade?: () => void;
  onClose: () => void;
}

// Helper to determine if theme is dark
function isThemeDark(theme: Theme): boolean {
  const hex = theme.colors.background.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Animation preview component
function AnimationPreview({
  animation,
  isSelected,
  isPlaying,
  isPremium,
  isLocked,
  accentColor,
  cardTextBg,
  textPrimary,
  textSecondary,
  premiumBadgeText,
  effectsBadgeText,
  onPlay,
  onSelect,
}: {
  animation: AnimationPreset;
  isSelected: boolean;
  isPlaying: boolean;
  isPremium: boolean;
  isLocked: boolean;
  accentColor: string;
  cardTextBg: string;
  textPrimary: string;
  textSecondary: string;
  premiumBadgeText: string;
  effectsBadgeText: string;
  onPlay: () => void;
  onSelect: () => void;
}) {
  const [key, setKey] = useState(0);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKey((k) => k + 1);
    onPlay();
  };

  const handleSelect = () => {
    if (!isLocked) {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={`relative group rounded-xl overflow-hidden transition-all ${
        isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"
      } ${
        isSelected
          ? "ring-2 ring-offset-2 ring-offset-slate-900"
          : "hover:ring-2 hover:ring-white/20"
      }`}
      style={{
        ...(isSelected ? { "--tw-ring-color": accentColor } as React.CSSProperties : {}),
      }}
    >
      {/* Preview Card */}
      <div
        className="aspect-video w-full relative"
        style={{
          background:
            animation.previewGradient ||
            "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        }}
      >
        {/* Animated preview content */}
        <motion.div
          key={key}
          className="absolute inset-4 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
          initial={isPlaying ? animation.enterAnimation.initial : { opacity: 1 }}
          animate={isPlaying ? animation.enterAnimation.animate : { opacity: 1 }}
          transition={animation.enterAnimation.transition as Transition}
        >
          <div className="text-center">
            <div className="w-8 h-1 bg-white/60 rounded mb-2 mx-auto" />
            <div className="w-12 h-1 bg-white/40 rounded mx-auto" />
          </div>
        </motion.div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          {isLocked ? (
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
          ) : (
            <button
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </button>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Check size={14} className="text-white" />
          </div>
        )}

        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[10px] font-bold text-black flex items-center gap-1">
            <Crown size={10} />
            {premiumBadgeText}
          </div>
        )}

        {/* Effects badge (only show if not premium) */}
        {animation.hasEffects && !isPremium && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white">
            ✨ {effectsBadgeText}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="p-2" style={{ backgroundColor: cardTextBg }}>
        <p className="text-xs font-medium truncate" style={{ color: textPrimary }}>{animation.name}</p>
        <p className="text-[10px] truncate" style={{ color: textSecondary }}>{animation.description}</p>
      </div>
    </div>
  );
}

export default function AnimationPicker({
  isOpen,
  currentAnimation = "fade",
  contentAnimation = true,
  theme,
  isPaidUser = false,
  subscriptionPlan,
  onSelect,
  onContentAnimationChange,
  onUpgrade,
  onClose,
}: AnimationPickerProps) {
  const { t } = useLanguage();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | "all">("all");

  const categories = getAnimationCategories();
  const isDark = isThemeDark(theme);
  const accentColor = theme.colors.accent;

  const userPlan = (subscriptionPlan || "free").toLowerCase();
  const hasProPlus = ["pro", "ultra"].includes(userPlan);
  const hasPlusPlus = ["plus", "pro", "ultra"].includes(userPlan);

  const filteredAnimations =
    selectedCategory === "all"
      ? ANIMATION_PRESETS
      : ANIMATION_PRESETS.filter((a) => a.category === selectedCategory);

  // Category name translations map
  const categoryTranslations: Record<string, string> = {
    all: t.animationCategoryAll || "All",
    fade: t.animationCategoryFade || "Fade",
    slide: t.animationCategorySlide || "Slide",
    zoom: t.animationCategoryZoom || "Zoom",
    flip: t.animationCategoryFlip || "Flip",
    creative: t.animationCategoryCreative || "Creative",
    cinematic: t.animationCategoryCinematic || "Cinematic",
    particles: t.animationCategoryParticles || "Particles",
    premium: t.animationCategoryPremium || "Premium ✨",
  };

  if (!isOpen) return null;

  // Theme-aware colors - use actual theme colors
  const bgPrimary = theme.colors.background;
  // If pageBackground is a gradient, use background color instead for modal
  const isGradient = theme.pageBackground?.includes("gradient");
  const bgSecondary = isGradient ? theme.colors.backgroundAlt || theme.colors.background : (theme.pageBackground || theme.colors.background);
  const textPrimary = theme.colors.heading;
  const textSecondary = theme.colors.textMuted || theme.colors.text;
  const borderColor = `${theme.colors.accent}30`;
  
  // Card background for animation preview labels
  const cardTextBg = isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.9)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b flex-shrink-0"
          style={{ borderColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`,
              }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                {t.animationPickerTitle || "Slide Animation"}
              </h2>
              <p className="text-sm" style={{ color: textSecondary }}>
                {t.animationPickerSubtitle || "Choose how this slide appears during presentation"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div
          className="px-5 py-3 border-b overflow-x-auto flex-shrink-0"
          style={{ borderColor }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor:
                  selectedCategory === "all" ? accentColor : "rgba(255,255,255,0.05)",
                color: selectedCategory === "all" ? "#ffffff" : textSecondary,
              }}
            >
              {categoryTranslations.all}
            </button>
            {categories
              .filter((c) => c.category !== "none")
              .map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
                  style={{
                    backgroundColor:
                      selectedCategory === cat.category
                        ? accentColor
                        : "rgba(255,255,255,0.05)",
                    color: selectedCategory === cat.category ? "#ffffff" : textSecondary,
                  }}
                >
                  {cat.category === "premium" && <Crown size={14} />}
                  {categoryTranslations[cat.category] || cat.name}
                  <span className="text-xs opacity-60">({cat.animations.length})</span>
                </button>
              ))}
          </div>
        </div>

        {/* Animation Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredAnimations.map((animation) => {
              const followsProTier = animation.isPro === true;
              const followsPlusTier = animation.isPremium === true;
              
              let isLocked = false;
              if (followsProTier) {
                isLocked = !hasProPlus;
              } else if (followsPlusTier) {
                isLocked = !hasPlusPlus;
              }

              return (
                <AnimationPreview
                  key={animation.id}
                  animation={animation}
                  isSelected={currentAnimation === animation.id}
                  isPlaying={playingId === animation.id}
                  isPremium={followsPlusTier || followsProTier}
                  isLocked={isLocked}
                  accentColor={accentColor}
                  cardTextBg={cardTextBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  premiumBadgeText={followsProTier ? "PRO" : (t.animationPremiumBadge || "PREMIUM")}
                  effectsBadgeText={t.animationEffectsBadge || "FX"}
                  onPlay={() => {
                    setPlayingId(animation.id);
                    setTimeout(() => setPlayingId(null), animation.duration + 100);
                  }}
                  onSelect={() => {
                    if (isLocked && onUpgrade) {
                      onUpgrade();
                    } else {
                      onSelect(animation.id);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Content Animation Toggle */}
        <div
          className="px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor, backgroundColor: `${bgSecondary}80` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, #a855f7 0%, #ec4899 100%)`,
                }}
              >
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: textPrimary }}>
                  {t.animationContentToggle || "Content Animation"}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {t.animationContentToggleDesc || "Animate bullets, boxes, and other content items"}
                </p>
              </div>
            </div>
            <button
              onClick={() => onContentAnimationChange?.(!contentAnimation)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: contentAnimation ? accentColor : "#475569",
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{
                  left: contentAnimation ? "28px" : "4px",
                }}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t flex-shrink-0"
          style={{ borderColor, backgroundColor: `${bgSecondary}50` }}
        >
          <p className="text-xs" style={{ color: textSecondary }}>
            {t.animationFooterNote || "Animations play when navigating between slides in present mode"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: textSecondary }}
            >
              {t.animationCancel || "Cancel"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {t.animationDone || "Done"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

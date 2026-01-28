"use client";

import type { CSSProperties } from "react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState } from "./types";
import EditableText from "./EditableText";
import { CONTENT_FONT_SIZE } from "./slide-typography";
import { removeWordCounts } from "./slide-content-utils";

interface BaseTextProps {
  slide: SlideData;
  theme: Theme;
  colors: {
    text: string;
    textMuted?: string;
    accentMuted?: string;
    indicatorMuted?: string;
    hoverAccent?: string;
  };
  isEditing: boolean;
  editingText: EditingState | null;
  canEdit: boolean;
  isHovered: boolean;
  index: number;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  getSpotlightStyle: (contentIndex: number) => CSSProperties;
}

interface TitleBlockProps extends BaseTextProps {
  isTitleSlide: boolean;
  onDeleteTitle?: (slideIndex: number) => void;
  onDeleteSubtitle?: (slideIndex: number) => void;
  className?: string;
  align?: "left" | "center" | "right";
  showSubtitle?: boolean;
}

export function TitleBlock({
  slide,
  theme,
  colors,
  isEditing,
  editingText,
  canEdit,
  isHovered,
  index,
  onStartEditing,
  onUpdateContent,
  onFinishEditing,
  onDeleteTitle,
  onDeleteSubtitle,
  getSpotlightStyle,
  isTitleSlide,
  className = "",
  align = "left",
  showSubtitle = false,
}: TitleBlockProps) {
  return (
    <div className={showSubtitle ? "space-y-2 md:space-y-4" : ""}>
      <div style={getSpotlightStyle(0)}>
        <EditableText
          value={slide.title}
          isEditing={isEditing && editingText?.field === "title"}
          onStartEdit={() => onStartEditing(index, "title")}
          onChange={(val) => onUpdateContent(index, "title", val)}
          onFinish={onFinishEditing}
          onDelete={onDeleteTitle ? () => onDeleteTitle(index) : undefined}
          className={`font-bold leading-tight ${className}`}
          style={{
            fontFamily: theme.fonts.heading.family,
            color: colors.text,
            letterSpacing: "-0.03em",
            textAlign: align,
            fontSize: showSubtitle && isTitleSlide ? "clamp(1.5rem, 4vw + 0.5rem, 4rem)" : "clamp(0.875rem, 2.5vw + 0.25rem, 2.5rem)",
          }}
          isOwner={canEdit}
          isHovered={isHovered}
        />
      </div>
      {showSubtitle && slide.subtitle && (
        <div style={getSpotlightStyle(1)}>
          <EditableText
            value={slide.subtitle}
            isEditing={isEditing && editingText?.field === "subtitle"}
            onStartEdit={() => onStartEditing(index, "subtitle")}
            onChange={(val) => onUpdateContent(index, "subtitle", val)}
            onFinish={onFinishEditing}
            onDelete={onDeleteSubtitle ? () => onDeleteSubtitle(index) : undefined}
            className="opacity-80"
            style={{
              fontFamily: theme.fonts.body.family,
              color: colors.textMuted,
              textAlign: align,
              fontSize: "clamp(0.875rem, 1.5vw + 0.25rem, 1.5rem)",
            }}
            isOwner={canEdit}
            isHovered={isHovered}
          />
        </div>
      )}
    </div>
  );
}

interface SlideDescriptionBlockProps extends BaseTextProps {
  className?: string;
  align?: "left" | "center" | "right";
  isTitleSlide: boolean;
}

export function SlideDescriptionBlock({
  slide,
  theme,
  colors,
  isEditing,
  editingText,
  canEdit,
  isHovered,
  index,
  onStartEditing,
  onUpdateContent,
  onFinishEditing,
  getSpotlightStyle,
  className = "",
  align = "left",
  isTitleSlide,
}: SlideDescriptionBlockProps) {
  if (!slide.slideDescription) return null;
  return (
    <div>
      <EditableText
        value={slide.slideDescription}
        isEditing={isEditing && editingText?.field === "slideDescription"}
        onStartEdit={() => onStartEditing(index, "slideDescription")}
        onChange={(val) => onUpdateContent(index, "slideDescription", val)}
        onFinish={onFinishEditing}
        className={`text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-5 ${className}`}
        style={{
          fontFamily: theme.fonts.body.family,
          color: colors.textMuted || colors.text,
          opacity: 0.8,
          textAlign: align,
          ...getSpotlightStyle(1),
        }}
        isOwner={canEdit}
        isHovered={isHovered}
      />
    </div>
  );
}

interface BulletPointsBlockProps extends BaseTextProps {
  bulletPoints: string[];
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  compact?: boolean;
  isCustomTheme: boolean;
}

export function BulletPointsBlock({
  slide: _slide,
  theme,
  colors,
  isEditing,
  editingText,
  canEdit,
  isHovered,
  index,
  onStartEditing,
  onUpdateContent,
  onFinishEditing,
  getSpotlightStyle,
  bulletPoints,
  onAddBullet,
  onDeleteBullet,
  compact = false,
  isCustomTheme,
}: BulletPointsBlockProps) {
  const bulletDotStyle = isCustomTheme ? { backgroundColor: theme.colors.primary } : {};

  const parsedBullets = bulletPoints.map((bullet) => {
    const cleanBullet = removeWordCounts(bullet);
    const colonIndex = cleanBullet.indexOf(":");
    if (colonIndex > 0 && colonIndex < 50) {
      const label = cleanBullet.substring(0, colonIndex).trim();
      const text = cleanBullet.substring(colonIndex + 1).trim();
      if (label && text) {
        return { label, text, full: cleanBullet };
      }
    }
    return { label: null, text: cleanBullet, full: cleanBullet };
  });

  return (
    <div className={compact ? "space-y-2 sm:space-y-3" : "space-y-3 sm:space-y-4"}>
      {parsedBullets.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2 sm:gap-3 group/bullet"
          style={getSpotlightStyle(i + 2)}
        >
          <div className={`${compact ? "mt-1.5" : "mt-2"} flex items-center gap-1 sm:gap-2 shrink-0`}>
            <div
              className={`${compact ? "w-1.5 h-1.5 sm:w-2 sm:h-2" : "w-2 h-2 sm:w-2.5 sm:h-2.5"} rounded-full ${!isCustomTheme ? colors.accentMuted : ""}`}
              style={bulletDotStyle}
            />
          </div>
          <div className="flex-1">
            {item.label ? (
              <div>
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `bullet-label-${i}`}
                  onStartEdit={() => onStartEditing(index, `bullet-label-${i}`)}
                  onChange={(val) => onUpdateContent(index, "bullet", `${val}: ${item.text}`, i)}
                  onFinish={onFinishEditing}
                  className={`font-semibold ${compact ? "text-sm mb-0.5" : "text-base mb-1"}`}
                  style={{ color: colors.text, fontFamily: theme.fonts.heading.family }}
                  isOwner={canEdit}
                  isHovered={isHovered}
                />
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                  onStartEdit={() => onStartEditing(index, "bullet", i)}
                  onChange={(val) => onUpdateContent(index, "bullet", `${item.label}: ${val}`, i)}
                  onFinish={onFinishEditing}
                  className="leading-relaxed"
                  style={{
                    fontFamily: theme.fonts.body.family,
                    color: colors.textMuted,
                    fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
                  }}
                  isOwner={canEdit}
                  isHovered={isHovered}
                  onDelete={() => onDeleteBullet(index, i)}
                />
              </div>
            ) : (
              <EditableText
                value={item.text}
                isEditing={isEditing && editingText?.field === "bullet" && editingText?.bulletIndex === i}
                onStartEdit={() => onStartEditing(index, "bullet", i)}
                onChange={(val) => onUpdateContent(index, "bullet", val, i)}
                onFinish={onFinishEditing}
                className="leading-relaxed"
                style={{
                  fontFamily: theme.fonts.body.family,
                  color: colors.textMuted,
                  fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
                }}
                isOwner={canEdit}
                isHovered={isHovered}
                onDelete={() => onDeleteBullet(index, i)}
              />
            )}
          </div>
        </div>
      ))}
      {canEdit && (
        <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button
            onClick={() => onAddBullet(index)}
            className={`flex items-center gap-1 sm:gap-2 ${colors.indicatorMuted} ${colors.hoverAccent} transition-colors ml-4 sm:ml-5`}
            style={{ fontSize: "clamp(0.625rem, 1.2vw + 0.15rem, 0.875rem)" }}
            tabIndex={isHovered ? 0 : -1}
          >
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add point</span>
          </button>
        </div>
      )}
    </div>
  );
}

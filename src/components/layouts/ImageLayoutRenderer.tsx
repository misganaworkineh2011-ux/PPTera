"use client";

import React from "react";
import { ImageIcon } from "lucide-react";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import { calculateImageGridDimensions } from "~/lib/layouts/content/images";
import type { Theme } from "~/lib/themes";
import EditableText from "~/components/presentation/EditableText";

// Theme styles type
interface ThemeStyles {
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#047857";

  if (!theme) {
    return {
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
    };
  }

  const cardBox = theme.cardBox;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  return {
    accentColor: accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

interface ImageLayoutRendererProps {
  layoutId: ImageLayoutType;
  items: ImageContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
  // Editing props
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
}

export function ImageLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  onDeleteItem,
  isOwner = false,
  isHovered = false,
}: ImageLayoutRendererProps) {
  const displayItems = items.slice(0, 6);
  const { columns } = calculateImageGridDimensions(displayItems.length, isNarrowSpace);
  const themeStyles = getThemeStyles(theme, accentColor);

  // Style 1: Small rounded square left, text right (horizontal layout per item)
  if (layoutId === "image-style-1") {
    return (
      <div
        className={`grid gap-6 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
              style={{
                backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
              }}
            >
              {item.image ? (
                <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={24} style={{ color: `${themeStyles.accentColor}50` }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                    onStartEdit={() => onStartEditLabel(idx)}
                    onChange={(val) => onUpdateLabel?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-base font-semibold mb-1" style={{ color: themeStyles.titleColor }}>
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                  onStartEdit={() => onStartEditText(idx)}
                  onChange={(val) => onUpdateText?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 2: Larger rounded square top, text below
  if (layoutId === "image-style-2") {
    return (
      <div
        className={`grid gap-6 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div
              className="w-full aspect-square rounded-2xl overflow-hidden mb-4"
              style={{
                backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
                maxWidth: "180px",
              }}
            >
              {item.image ? (
                <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={40} style={{ color: `${themeStyles.accentColor}50` }} />
                </div>
              )}
            </div>
            <div>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                    onStartEdit={() => onStartEditLabel(idx)}
                    onChange={(val) => onUpdateLabel?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-lg font-semibold mb-2"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                  onStartEdit={() => onStartEditText(idx)}
                  onChange={(val) => onUpdateText?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 3: Large circle top, text below centered
  if (layoutId === "image-style-3") {
    return (
      <div
        className={`grid gap-8 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div
              className="w-40 h-40 rounded-full overflow-hidden mb-4 flex-shrink-0"
              style={{
                backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
              }}
            >
              {item.image ? (
                <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} style={{ color: `${themeStyles.accentColor}50` }} />
                </div>
              )}
            </div>
            <div>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                    onStartEdit={() => onStartEditLabel(idx)}
                    onChange={(val) => onUpdateLabel?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-lg font-semibold mb-2"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                  onStartEdit={() => onStartEditText(idx)}
                  onChange={(val) => onUpdateText?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-sm leading-relaxed max-w-[250px]"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm leading-relaxed max-w-[250px]" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Style 4: Large rounded rectangle top, text below centered
  return (
    <div
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {displayItems.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center text-center">
          <div
            className="w-full rounded-2xl overflow-hidden mb-4"
            style={{
              aspectRatio: "4/3",
              maxWidth: "280px",
              backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
              border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
            }}
          >
            {item.image ? (
              <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={48} style={{ color: `${themeStyles.accentColor}50` }} />
              </div>
            )}
          </div>
          <div>
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                  onStartEdit={() => onStartEditLabel(idx)}
                  onChange={(val) => onUpdateLabel?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-lg font-semibold mb-2"
                  style={{ color: themeStyles.titleColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                  {item.label}
                </h3>
              )
            )}
            {onStartEditText ? (
              <EditableText
                value={item.text}
                isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                onStartEdit={() => onStartEditText(idx)}
                onChange={(val) => onUpdateText?.(idx, val)}
                onFinish={onFinishEditing || (() => {})}
                onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                className="text-sm leading-relaxed max-w-[280px]"
                style={{ color: themeStyles.bodyColor }}
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: themeStyles.bodyColor }}>
                {item.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageLayoutRenderer;

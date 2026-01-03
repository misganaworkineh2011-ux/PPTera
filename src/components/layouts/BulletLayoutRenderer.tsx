"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import type { BulletLayoutType, BulletContentItem } from "~/lib/layouts/content/bullets";
import { calculateBulletGridDimensions } from "~/lib/layouts/content/bullets";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string) {
  const defaultAccent = accentColor || "#047857";
  
  if (!theme) {
    return {
      // For shapes - use visible accent with good opacity
      shapeBgColor: `${defaultAccent}20`,
      shapeBorderColor: `${defaultAccent}40`,
      // For cards - more visible
      cardBgColor: `${defaultAccent}15`,
      cardBorderColor: `${defaultAccent}30`,
      // Accent for bullets, icons
      accentColor: defaultAccent,
      // Text colors - default slate
      titleColor: "#1e293b",
      bodyColor: "#64748b",
    };
  }

  const cardBox = theme.cardBox;
  const layoutElements = theme.layoutElements;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  // Use layoutElements if available for better theme consistency
  const bgColor = layoutElements?.background || `${accent}15`;
  const borderColor = layoutElements?.borderColor || `${accent}30`;

  return {
    // For shapes (pyramids, arrows, etc.) - use theme's layout element colors or accent
    shapeBgColor: bgColor,
    shapeBorderColor: borderColor,
    // For cards - use theme's layout element colors
    cardBgColor: bgColor,
    cardBorderColor: borderColor,
    // Accent color for bullets, icons, highlights
    accentColor: accent,
    // Text colors from theme
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

// Theme styles type
interface ThemeStyles {
  shapeBgColor: string;
  shapeBorderColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

interface BulletLayoutRendererProps {
  layoutId: BulletLayoutType;
  items: BulletContentItem[];
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
  isOwner?: boolean;
  isHovered?: boolean;
}

export function BulletLayoutRenderer({
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
  isOwner = false,
  isHovered = false,
}: BulletLayoutRendererProps) {
  const displayItems = items.slice(0, 8);
  const themeStyles = getThemeStyles(theme, accentColor);

  // Style 1: Cards with filled circle bullets, grid layout
  if (layoutId === "bullet-style-1") {
    return (
      <CardBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  // Style 2: Simple text with filled circle bullets, no cards
  if (layoutId === "bullet-style-2") {
    return (
      <SimpleBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  // Style 3: Checkmark bullets in cards
  if (layoutId === "bullet-style-3") {
    return (
      <CardBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="checkmark"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  // Style 4: Arrow bullets, minimal list
  return (
    <ArrowBullets
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
      isNarrowSpace={isNarrowSpace}
      isEditing={isEditing}
      editingText={editingText}
      onStartEditLabel={onStartEditLabel}
      onStartEditText={onStartEditText}
      onUpdateLabel={onUpdateLabel}
      onUpdateText={onUpdateText}
      onFinishEditing={onFinishEditing}
      isOwner={isOwner}
      isHovered={isHovered}
    />
  );
}

// Theme styles type
interface ThemeStyles {
  shapeBgColor: string;
  shapeBorderColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

// Card Bullets Component (Style 1 & 3)
function CardBullets({
  items,
  themeStyles,
  bulletType,
  className,
  isNarrowSpace,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  bulletType: "circle" | "checkmark";
  className: string;
  isNarrowSpace: boolean;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  const { columns, specialLayout } = calculateBulletGridDimensions(items.length, isNarrowSpace);

  // Special 2-1 layout for 3 items
  if (specialLayout === "2-1" && items.length === 3) {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-4">
          {items.slice(0, 2).map((item, idx) => (
            <BulletCard
              key={idx}
              item={item}
              index={idx}
              themeStyles={themeStyles}
              bulletType={bulletType}
              isEditing={isEditing}
              editingText={editingText}
              onStartEditLabel={onStartEditLabel}
              onStartEditText={onStartEditText}
              onUpdateLabel={onUpdateLabel}
              onUpdateText={onUpdateText}
              onFinishEditing={onFinishEditing}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ))}
        </div>
        {/* Bottom row - 1 full-width item */}
        <div>
          <BulletCard
            item={items[2]!}
            index={2}
            themeStyles={themeStyles}
            bulletType={bulletType}
            isEditing={isEditing}
            editingText={editingText}
            onStartEditLabel={onStartEditLabel}
            onStartEditText={onStartEditText}
            onUpdateLabel={onUpdateLabel}
            onUpdateText={onUpdateText}
            onFinishEditing={onFinishEditing}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <BulletCard
          key={idx}
          item={item}
          index={idx}
          themeStyles={themeStyles}
          bulletType={bulletType}
          isEditing={isEditing}
          editingText={editingText}
          onStartEditLabel={onStartEditLabel}
          onStartEditText={onStartEditText}
          onUpdateLabel={onUpdateLabel}
          onUpdateText={onUpdateText}
          onFinishEditing={onFinishEditing}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ))}
    </div>
  );
}

// Single Bullet Card
function BulletCard({
  item,
  index,
  themeStyles,
  bulletType,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  item: BulletContentItem;
  index: number;
  themeStyles: ThemeStyles;
  bulletType: "circle" | "checkmark";
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: themeStyles.cardBgColor,
        border: `1px solid ${themeStyles.cardBorderColor}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Bullet */}
        <div className="flex-shrink-0 mt-1">
          {bulletType === "circle" ? (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: themeStyles.accentColor }}
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeStyles.accentColor}20` }}
            >
              <Check size={12} style={{ color: themeStyles.accentColor }} strokeWidth={3} />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1">
          {item.label && (
            onStartEditLabel ? (
              <EditableText
                value={item.label}
                isEditing={isEditing && editingText?.field === `content-label-${index}`}
                onStartEdit={() => onStartEditLabel(index)}
                onChange={(val) => onUpdateLabel?.(index, val)}
                onFinish={onFinishEditing || (() => {})}
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
              isEditing={isEditing && editingText?.field === `content-text-${index}`}
              onStartEdit={() => onStartEditText(index)}
              onChange={(val) => onUpdateText?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
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
    </div>
  );
}

// Simple Bullets Component (Style 2)
function SimpleBullets({
  items,
  themeStyles,
  bulletType,
  className,
  isNarrowSpace,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  bulletType: "circle";
  className: string;
  isNarrowSpace: boolean;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  // For 3 items: 2 columns on top row, 1 on bottom
  if (items.length === 3 && !isNarrowSpace) {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-8">
          {items.slice(0, 2).map((item, idx) => (
            <SimpleBulletItem
              key={idx}
              item={item}
              index={idx}
              themeStyles={themeStyles}
              isEditing={isEditing}
              editingText={editingText}
              onStartEditLabel={onStartEditLabel}
              onStartEditText={onStartEditText}
              onUpdateLabel={onUpdateLabel}
              onUpdateText={onUpdateText}
              onFinishEditing={onFinishEditing}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ))}
        </div>
        {/* Bottom row - 1 item */}
        <div>
          <SimpleBulletItem
            item={items[2]!}
            index={2}
            themeStyles={themeStyles}
            isEditing={isEditing}
            editingText={editingText}
            onStartEditLabel={onStartEditLabel}
            onStartEditText={onStartEditText}
            onUpdateLabel={onUpdateLabel}
            onUpdateText={onUpdateText}
            onFinishEditing={onFinishEditing}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        </div>
      </div>
    );
  }

  // Default: columns based on item count
  const columns = isNarrowSpace ? 1 : items.length <= 2 ? items.length : 2;

  return (
    <div
      className={`grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <SimpleBulletItem
          key={idx}
          item={item}
          index={idx}
          themeStyles={themeStyles}
          isEditing={isEditing}
          editingText={editingText}
          onStartEditLabel={onStartEditLabel}
          onStartEditText={onStartEditText}
          onUpdateLabel={onUpdateLabel}
          onUpdateText={onUpdateText}
          onFinishEditing={onFinishEditing}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ))}
    </div>
  );
}

// Single Simple Bullet Item
function SimpleBulletItem({
  item,
  index,
  themeStyles,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  item: BulletContentItem;
  index: number;
  themeStyles: ThemeStyles;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Bullet */}
      <div className="flex-shrink-0 mt-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeStyles.accentColor }}
        />
      </div>
      {/* Content */}
      <div className="flex-1">
        {item.label && (
          onStartEditLabel ? (
            <EditableText
              value={item.label}
              isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)}
              onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              className="text-lg font-semibold mb-1"
              style={{ color: themeStyles.titleColor }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h3 className="text-lg font-semibold mb-1" style={{ color: themeStyles.titleColor }}>
              {item.label}
            </h3>
          )
        )}
        {onStartEditText ? (
          <EditableText
            value={item.text}
            isEditing={isEditing && editingText?.field === `content-text-${index}`}
            onStartEdit={() => onStartEditText(index)}
            onChange={(val) => onUpdateText?.(index, val)}
            onFinish={onFinishEditing || (() => {})}
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
  );
}

// Arrow Bullets Component (Style 4)
function ArrowBullets({
  items,
  themeStyles,
  className,
  isNarrowSpace,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isNarrowSpace: boolean;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  // Vertical list layout
  const columns = isNarrowSpace ? 1 : items.length <= 4 ? 1 : 2;

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          {/* Arrow bullet */}
          <div className="flex-shrink-0 mt-1">
            <ChevronRight size={18} style={{ color: themeStyles.accentColor }} strokeWidth={2.5} />
          </div>
          {/* Content */}
          <div className="flex-1">
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                  onStartEdit={() => onStartEditLabel(idx)}
                  onChange={(val) => onUpdateLabel?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
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

export default BulletLayoutRenderer;

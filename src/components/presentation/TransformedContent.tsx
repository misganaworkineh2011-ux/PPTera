"use client";

import type { TransformedContent } from "~/lib/presentation/types";
import { type Theme } from "~/lib/themes";

interface TransformedContentRendererProps {
  content: TransformedContent;
  theme: Theme;
  compact?: boolean;
  isEditing?: boolean;
  onEdit?: (itemIndex: number, newText: string) => void;
}

/**
 * Renders transformed content with intro paragraphs and labeled items
 */
export default function TransformedContentRenderer({ 
  content, 
  theme, 
  compact = false,
  isEditing = false,
  onEdit
}: TransformedContentRendererProps) {
  const { intro, items } = content;
  const accentColor = theme.colors.accent;
  const textColor = theme.colors.text;

  if (items.length === 0 && !intro) {
    return null;
  }

  return (
    <div className={`space-y-${compact ? "3" : "4"}`}>
      {/* Intro paragraph */}
      {intro && (
        <p 
          className={`${compact ? "text-sm" : "text-base"} leading-relaxed opacity-90`}
          style={{ color: textColor }}
        >
          {intro}
        </p>
      )}
      
      {/* Transformed items */}
      <div className={`space-y-${compact ? "2" : "3"}`}>
        {items.map((item, i) => (
          <TransformedItem 
            key={i}
            item={item}
            index={i}
            accentColor={accentColor}
            textColor={textColor}
            compact={compact}
            isEditing={isEditing}
            onEdit={onEdit ? (text) => onEdit(i, text) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// Individual transformed item component
function TransformedItem({
  item,
  index,
  accentColor,
  textColor,
  compact,
  isEditing,
  onEdit
}: {
  item: { label?: string; text: string };
  index: number;
  accentColor: string;
  textColor: string;
  compact: boolean;
  isEditing: boolean;
  onEdit?: (text: string) => void;
}) {
  // If item has a label, render as label + text
  if (item.label) {
    return (
      <div className="flex items-start gap-3">
        {/* Label badge */}
        <div 
          className={`${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} rounded-lg font-semibold shrink-0`}
          style={{ 
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}
        >
          {item.label}
        </div>
        
        {/* Text content */}
        <div 
          className={`flex-1 ${compact ? "text-sm" : "text-base"} leading-relaxed`}
          style={{ color: textColor }}
        >
          {item.text}
        </div>
      </div>
    );
  }

  // Standard bullet point style
  return (
    <div className="flex items-start gap-3">
      {/* Bullet dot */}
      <div 
        className={`${compact ? "w-1.5 h-1.5 mt-2" : "w-2 h-2 mt-2.5"} rounded-full shrink-0`}
        style={{ backgroundColor: accentColor }}
      />
      
      {/* Text content */}
      <div 
        className={`flex-1 ${compact ? "text-sm" : "text-base"} leading-relaxed`}
        style={{ color: textColor }}
      >
        {item.text}
      </div>
    </div>
  );
}

/**
 * Utility component to decide whether to render transformed content or original bullets
 */
export function ContentRenderer({
  transformedContent,
  bulletPoints,
  theme,
  compact = false,
  renderBullets
}: {
  transformedContent?: TransformedContent;
  bulletPoints?: string[];
  theme: Theme;
  compact?: boolean;
  renderBullets: () => React.ReactNode;
}) {
  // Prefer transformed content if available
  if (transformedContent && transformedContent.items.length > 0) {
    return (
      <TransformedContentRenderer 
        content={transformedContent} 
        theme={theme} 
        compact={compact}
      />
    );
  }

  // Fall back to original bullets
  if (bulletPoints && bulletPoints.length > 0) {
    return <>{renderBullets()}</>;
  }

  return null;
}


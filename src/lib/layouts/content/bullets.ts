// Bullet Layout Definitions
// 4 specific bullet point styles

import type { Theme } from "~/lib/themes";

// Content item structure for bullet layouts
export interface BulletContentItem {
  label?: string; // Title/heading
  text: string; // Description
}

// Bullet layout type identifier
export type BulletLayoutType =
  | "bullet-style-1" // Cards with filled circle bullets, grid layout
  | "bullet-style-2" // Simple text with filled circle bullets, no cards
  | "bullet-style-3" // Checkmark bullets in cards
  | "bullet-style-4"; // Arrow bullets, minimal style

// Bullet layout definition interface
export interface BulletLayout {
  id: BulletLayoutType;
  name: string;
  description: string;
  category: "bullets";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  // Preview configuration
  preview: {
    bulletStyle: "filled-circle" | "checkmark" | "arrow" | "dash";
    hasCards: boolean;
    arrangement: "grid" | "columns" | "list";
  };
}

// 4 Specific Bullet Layout Definitions
export const bulletLayouts: BulletLayout[] = [
  // Style 1: Cards with filled circle bullets (from image 1)
  {
    id: "bullet-style-1",
    name: "Card Bullets",
    description: "Bullet points in rounded cards arranged in a grid",
    category: "bullets",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      bulletStyle: "filled-circle",
      hasCards: true,
      arrangement: "grid",
    },
  },

  // Style 2: Simple text with filled circle bullets (from image 2)
  {
    id: "bullet-style-2",
    name: "Simple Bullets",
    description: "Clean bullet points without cards, arranged in columns",
    category: "bullets",
    minItems: 1,
    maxItems: 8,
    idealItems: 3,
    adaptive: true,
    preview: {
      bulletStyle: "filled-circle",
      hasCards: false,
      arrangement: "columns",
    },
  },

  // Style 3: Checkmark bullets in cards
  {
    id: "bullet-style-3",
    name: "Checklist",
    description: "Checkmark bullets in cards for task-like content",
    category: "bullets",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      bulletStyle: "checkmark",
      hasCards: true,
      arrangement: "grid",
    },
  },

  // Style 4: Arrow bullets, minimal style
  {
    id: "bullet-style-4",
    name: "Arrow List",
    description: "Arrow bullets with minimal styling in a vertical list",
    category: "bullets",
    minItems: 1,
    maxItems: 8,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "arrow",
      hasCards: false,
      arrangement: "list",
    },
  },
];

// Get bullet layout by ID
export function getBulletLayoutById(id: BulletLayoutType): BulletLayout | undefined {
  return bulletLayouts.find((layout) => layout.id === id);
}

// Get all bullet layouts
export function getAllBulletLayouts(): BulletLayout[] {
  return bulletLayouts;
}

// Get recommended layout based on content count
export function getRecommendedBulletLayout(itemCount: number): BulletLayout {
  if (itemCount <= 3) return bulletLayouts[0]!; // Card Bullets
  return bulletLayouts[1]!; // Simple Bullets for more items
}

// Calculate grid dimensions for card bullets
export function calculateBulletGridDimensions(
  itemCount: number,
  isNarrowSpace: boolean = false
): { columns: number; rows: number; specialLayout?: "2-1" } {
  if (isNarrowSpace) {
    // Narrow space - stack vertically
    if (itemCount <= 2) return { columns: itemCount, rows: 1 };
    return { columns: 1, rows: itemCount };
  }
  
  // Wide space
  if (itemCount === 3) {
    return { columns: 2, rows: 2, specialLayout: "2-1" }; // 2 on top, 1 full-width below
  }
  if (itemCount <= 2) return { columns: itemCount, rows: 1 };
  if (itemCount <= 4) return { columns: 2, rows: 2 };
  if (itemCount <= 6) return { columns: 3, rows: 2 };
  return { columns: 2, rows: Math.ceil(itemCount / 2) };
}

// Base styles helper
export function getBaseBulletStyles(theme: Theme) {
  const cardBox = theme.cardBox;
  return {
    bgColor: cardBox?.background || `${theme.colors.surface}80`,
    borderColor: cardBox?.borderColor || theme.colors.border,
    accentColor: cardBox?.accentColor || theme.colors.accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    bulletColor: cardBox?.accentColor || theme.colors.accent,
  };
}

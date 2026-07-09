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
  | "bullet-style-4" // Arrow bullets, minimal style
  | "bullet-style-5" // Diamond markers with hairline stems, airy two-column
  | "bullet-style-6" // Highlighter sweep behind each lead-in
  | "bullet-style-7" // Inline bold lead-ins with an accent dash
  | "bullet-style-8" // Cards with a clipped accent corner notch
  | "bullet-style-9" // Oversized keyword typography with accent periods
  | "bullet-style-10" // Mono double-slash markers, developer aesthetic
  | "bullet-style-11" // Label pills alternating solid and soft accent
  | "bullet-style-12" // Thin numerals standing on a shared baseline rule
  | "bullet-style-13"; // Checkerboard of tinted and hairline cells

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
    bulletStyle: "filled-circle" | "checkmark" | "arrow" | "dash" | "diamond" | "highlight" | "leadin" | "notch" | "keyword" | "slash" | "pill" | "baseline" | "checker";
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

  // Style 5: Diamond markers with hairline stems, airy two-column
  {
    id: "bullet-style-5",
    name: "Diamond Markers",
    description: "Rotated diamond markers with hairline stems in an airy two-column spread",
    category: "bullets",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "diamond",
      hasCards: false,
      arrangement: "columns",
    },
  },

  // Style 6: Highlighter sweep behind each lead-in
  {
    id: "bullet-style-6",
    name: "Highlight Lines",
    description: "A marker-pen highlight sweep behind each bold lead-in",
    category: "bullets",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "highlight",
      hasCards: false,
      arrangement: "list",
    },
  },

  // Style 7: Inline bold lead-ins with an accent dash
  {
    id: "bullet-style-7",
    name: "Lead-in Dash",
    description: "Bold inline lead-ins joined to their text by an accent dash",
    category: "bullets",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "leadin",
      hasCards: false,
      arrangement: "columns",
    },
  },

  // Style 8: Cards with a clipped accent corner notch
  {
    id: "bullet-style-8",
    name: "Notch Cards",
    description: "Cards with a clipped corner and an accent notch fill",
    category: "bullets",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "notch",
      hasCards: true,
      arrangement: "grid",
    },
  },

  // Style 9: Oversized keyword typography with accent periods
  {
    id: "bullet-style-9",
    name: "Keyword Blocks",
    description: "Oversized keyword typography with an accent period signature",
    category: "bullets",
    minItems: 3,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    preview: {
      bulletStyle: "keyword",
      hasCards: false,
      arrangement: "columns",
    },
  },

  // Style 10: Mono double-slash markers, developer aesthetic
  {
    id: "bullet-style-10",
    name: "Slash List",
    description: "Mono double-slash markers with an indent guide, developer aesthetic",
    category: "bullets",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "slash",
      hasCards: false,
      arrangement: "list",
    },
  },

  // Style 11: Label pills alternating solid and soft accent
  {
    id: "bullet-style-11",
    name: "Pill Rows",
    description: "Lead-in labels in accent pills alternating solid and soft",
    category: "bullets",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "pill",
      hasCards: false,
      arrangement: "list",
    },
  },

  // Style 12: Thin numerals standing on a shared baseline rule
  {
    id: "bullet-style-12",
    name: "Baseline Numbers",
    description: "Thin oversized numerals standing on one continuous baseline rule",
    category: "bullets",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "baseline",
      hasCards: false,
      arrangement: "columns",
    },
  },

  // Style 13: Checkerboard of tinted and hairline cells
  {
    id: "bullet-style-13",
    name: "Checker Tints",
    description: "A checkerboard rhythm of soft accent tints and hairline cells",
    category: "bullets",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: {
      bulletStyle: "checker",
      hasCards: true,
      arrangement: "grid",
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

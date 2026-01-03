// Box Layout Definitions
// 4 specific adaptive card styles as requested

import type { Theme } from "~/lib/themes";

// Content item structure for box layouts
export interface BoxContentItem {
  label?: string;
  text: string;
  icon?: string;
}

// Box layout type identifier - corresponding to the 4 requested styles
export type BoxLayoutType =
  | "box-style-1" // Side accent bar
  | "box-style-2" // Minimal clean
  | "box-style-3" // Icon on top
  | "box-style-4"; // Header accent

// Box layout definition interface
export interface BoxLayout {
  id: BoxLayoutType;
  name: string;
  description: string;
  category: "boxes";
  // All styles use adaptive grid
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: boolean;
  // Preview configuration
  preview: {
    columns: number;
    rows: number;
  };
}

// 4 Specific Box Layout Definitions
export const boxLayouts: BoxLayout[] = [
  // Style 1: Side accent bar, no icons (from image 1)
  {
    id: "box-style-1",
    name: "Side Accent",
    description: "Clean card with a colored accent bar on the left",
    category: "boxes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    supportsIcons: false,
    preview: {
      columns: 3,
      rows: 1,
    },
  },

  // Style 2: Minimal clean, no icons (from image 2)
  {
    id: "box-style-2",
    name: "Minimal",
    description: "Simple, elegant card with centered text",
    category: "boxes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    supportsIcons: false,
    preview: {
      columns: 3,
      rows: 1,
    },
  },

  // Style 3: Icon on top (from image 3)
  {
    id: "box-style-3",
    name: "Icon Focus",
    description: "Card with a centered icon in a circle above the title",
    category: "boxes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: {
      columns: 3,
      rows: 1,
    },
  },

  // Style 4: Header accent (from image 4)
  {
    id: "box-style-4",
    name: "Header Accent",
    description: "Card with a top accent bar and overlapping icon",
    category: "boxes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: {
      columns: 3,
      rows: 1,
    },
  },
];

// Get box layout by ID
export function getBoxLayoutById(id: BoxLayoutType): BoxLayout | undefined {
  return boxLayouts.find((layout) => layout.id === id);
}

// Get all box layouts
export function getAllBoxLayouts(): BoxLayout[] {
  return boxLayouts;
}

// Get recommended layout based on content count
export function getRecommendedBoxLayout(itemCount: number): BoxLayout {
  return boxLayouts[0]; // Default to first style
}

// Calculate adaptive grid dimensions based on available space
export function calculateBoxGridDimensions(
  itemCount: number,
  isNarrowSpace: boolean = false // true when image is left/right, false when top/bottom
): { columns: number; rows: number; specialLayout?: "narrow-3" } {
  // Special case: 3 items in narrow space (image left/right)
  if (itemCount === 3 && isNarrowSpace) {
    return { columns: 2, rows: 2, specialLayout: "narrow-3" }; // 2 on top, 1 full-width below
  }
  
  // Wide space (image top/bottom) - can use horizontal layout
  if (!isNarrowSpace) {
    if (itemCount <= 2) return { columns: itemCount, rows: 1 };
    if (itemCount <= 3) return { columns: 3, rows: 1 };
    if (itemCount <= 4) return { columns: 2, rows: 2 };
    if (itemCount <= 6) return { columns: 3, rows: 2 };
    return { columns: 3, rows: Math.ceil(itemCount / 3) };
  }
  
  // Narrow space (image left/right) - use vertical-friendly layout
  if (itemCount <= 2) return { columns: itemCount, rows: 1 };
  if (itemCount <= 4) return { columns: 2, rows: 2 };
  if (itemCount <= 6) return { columns: 2, rows: 3 };
  return { columns: 2, rows: Math.ceil(itemCount / 2) };
}

// Get CSS grid template with context awareness
export function getBoxLayoutGridTemplate(
  itemCount: number,
  isNarrowSpace: boolean = false
): { gridTemplateColumns: string; gridTemplateRows: string; gap: string; specialLayout?: "narrow-3" } {
  const { columns, rows, specialLayout } = calculateBoxGridDimensions(itemCount, isNarrowSpace);
  
  // Special layout for 3 items in narrow space
  if (specialLayout === "narrow-3") {
    return {
      gridTemplateColumns: "1fr 1fr", // 2 columns for top row
      gridTemplateRows: "auto auto", // 2 rows
      gap: "1.25rem",
      specialLayout: "narrow-3",
    };
  }
  
  return {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, auto)`, // auto height for flexible content
    gap: "1.25rem",
  };
}

// Base styles helper - for layout elements inside slides
export function getBaseBoxStyles(theme: Theme) {
  // Use layoutElements for inner cards/boxes (better contrast)
  // Fall back to cardBox if layoutElements not defined
  const layoutElements = theme.layoutElements;
  const cardBox = theme.cardBox;
  
  return {
    // Layout elements use the layoutElements colors for good contrast
    bgColor: layoutElements?.background || cardBox?.background || theme.colors.surface,
    borderColor: layoutElements?.borderColor || cardBox?.borderColor || theme.colors.border,
    // Text colors still come from cardBox
    accentColor: cardBox?.accentColor || theme.colors.accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    shadow: cardBox?.shadow || theme.design.shadows.small,
    borderRadius: theme.design.borderRadius.medium,
  };
}

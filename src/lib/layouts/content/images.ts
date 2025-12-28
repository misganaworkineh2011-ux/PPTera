// Images Layout Definitions
// 4 specific image gallery styles for content with images

import type { Theme } from "~/lib/themes";

// Content item structure for image layouts
export interface ImageContentItem {
  label?: string; // Title
  text: string; // Description
  image?: string; // Image URL - optional, shows placeholder if not provided
}

// Image layout type identifier
export type ImageLayoutType =
  | "image-style-1" // Small rounded square left, text right (horizontal)
  | "image-style-2" // Larger rounded square top, text below (vertical)
  | "image-style-3" // Large circle top, text below centered
  | "image-style-4"; // Large rounded rectangle top, text below centered

// Image layout definition interface
export interface ImageLayout {
  id: ImageLayoutType;
  name: string;
  description: string;
  category: "images";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  // Preview configuration
  preview: {
    imageShape: "square-small" | "square-large" | "circle" | "rectangle";
    arrangement: "horizontal" | "vertical";
    textPosition: "right" | "below";
  };
}

// 4 Specific Image Layout Definitions
export const imageLayouts: ImageLayout[] = [
  // Style 1: Small rounded square on left, text on right
  {
    id: "image-style-1",
    name: "Compact Gallery",
    description: "Small rounded images on the left with title and description on the right",
    category: "images",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      imageShape: "square-small",
      arrangement: "horizontal",
      textPosition: "right",
    },
  },

  // Style 2: Larger rounded square on top, text below
  {
    id: "image-style-2",
    name: "Card Gallery",
    description: "Larger rounded square images on top with text below",
    category: "images",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      imageShape: "square-large",
      arrangement: "vertical",
      textPosition: "below",
    },
  },

  // Style 3: Large circle on top, text below centered
  {
    id: "image-style-3",
    name: "Circle Gallery",
    description: "Large circular images on top with centered text below",
    category: "images",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      imageShape: "circle",
      arrangement: "vertical",
      textPosition: "below",
    },
  },

  // Style 4: Large rounded rectangle on top, text below centered
  {
    id: "image-style-4",
    name: "Feature Gallery",
    description: "Large rounded rectangle images on top with centered text below",
    category: "images",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      imageShape: "rectangle",
      arrangement: "vertical",
      textPosition: "below",
    },
  },
];

// Get image layout by ID
export function getImageLayoutById(id: ImageLayoutType): ImageLayout | undefined {
  return imageLayouts.find((layout) => layout.id === id);
}

// Get all image layouts
export function getAllImageLayouts(): ImageLayout[] {
  return imageLayouts;
}

// Get recommended layout based on content count
export function getRecommendedImageLayout(itemCount: number): ImageLayout {
  return imageLayouts[1]!; // Default to Card Gallery
}

// Calculate grid dimensions based on item count and space
export function calculateImageGridDimensions(
  itemCount: number,
  isNarrowSpace: boolean = false
): { columns: number; rows: number } {
  if (isNarrowSpace) {
    // Narrow space - stack vertically or 2 columns max
    if (itemCount <= 2) return { columns: itemCount, rows: 1 };
    if (itemCount <= 4) return { columns: 2, rows: Math.ceil(itemCount / 2) };
    return { columns: 2, rows: Math.ceil(itemCount / 2) };
  }
  
  // Wide space - can use more columns
  if (itemCount <= 3) return { columns: itemCount, rows: 1 };
  if (itemCount <= 4) return { columns: 2, rows: 2 };
  if (itemCount <= 6) return { columns: 3, rows: 2 };
  return { columns: 3, rows: Math.ceil(itemCount / 3) };
}

// Base styles helper
export function getBaseImageStyles(theme: Theme) {
  const cardBox = theme.cardBox;
  return {
    bgColor: cardBox?.background || `${theme.colors.surface}80`,
    borderColor: cardBox?.borderColor || theme.colors.border,
    accentColor: cardBox?.accentColor || theme.colors.accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    shadow: cardBox?.shadow || theme.design.shadows.small,
    borderRadius: theme.design.borderRadius.medium,
    placeholderBg: `${cardBox?.accentColor || theme.colors.accent}15`,
  };
}

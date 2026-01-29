// Comparison Layout Definitions
// Vertical split comparison with items on both sides

import type { Theme } from "~/lib/themes";

// Content item structure for comparison layouts
export interface ComparisonContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon
  side?: "left" | "right"; // Which side this item belongs to
}

// Comparison layout type identifier
export type ComparisonLayoutType = "comparison-split";

// Comparison layout definition interface
export interface ComparisonLayout {
  id: ComparisonLayoutType;
  name: string;
  description: string;
  category: "comparison";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style: "vertical-split";
  };
}

// Comparison Layout Definition
export const comparisonLayouts: ComparisonLayout[] = [
  {
    id: "comparison-split",
    name: "VS Comparison",
    description: "Vertical split comparison with items on both sides",
    category: "comparison",
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true,
    supportsIcons: true,
    preview: {
      style: "vertical-split",
    },
  },
];

// Get comparison layout by ID
export function getComparisonLayoutById(id: ComparisonLayoutType): ComparisonLayout | undefined {
  return comparisonLayouts.find((layout) => layout.id === id);
}

// Get all comparison layouts
export function getAllComparisonLayouts(): ComparisonLayout[] {
  return comparisonLayouts;
}

// Base styles helper for comparison components
export function getBaseComparisonStyles(theme: Theme, accentColor?: string) {
  const primaryColor = accentColor || theme.colors.accent || "#14b8a6"; // Teal for left
  const secondaryColor = theme.colors.secondary || theme.colors.primary || "#f97316"; // Orange for right
  
  return {
    leftColor: primaryColor,
    rightColor: secondaryColor,
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    iconBg: theme.colors.background || "#ffffff",
    iconBorder: theme.colors.border || "#e5e7eb",
  };
}

// Split items into left and right
export function splitLeftAndRight(items: ComparisonContentItem[]): {
  left: ComparisonContentItem[];
  right: ComparisonContentItem[];
} {
  // If items have explicit side property, use that
  const explicitLeft = items.filter(item => item.side === "left");
  const explicitRight = items.filter(item => item.side === "right");
  
  if (explicitLeft.length > 0 || explicitRight.length > 0) {
    return { left: explicitLeft, right: explicitRight };
  }
  
  // Otherwise, split evenly
  const midpoint = Math.ceil(items.length / 2);
  return {
    left: items.slice(0, midpoint),
    right: items.slice(midpoint),
  };
}

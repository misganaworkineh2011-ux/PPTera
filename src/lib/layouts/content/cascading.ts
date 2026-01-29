// Cascading Layout Definitions
// Staggered workflow layout with numbered items and connecting lines

import type { Theme } from "~/lib/themes";

// Content item structure for cascading layouts
export interface CascadingContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon - leave blank/placeholder if not provided
}

// Cascading layout type identifier
export type CascadingLayoutType = "cascading-workflow";

// Cascading layout definition interface
export interface CascadingLayout {
  id: CascadingLayoutType;
  name: string;
  description: string;
  category: "cascading";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style: "staggered";
  };
}

// Cascading Layout Definition
export const cascadingLayouts: CascadingLayout[] = [
  {
    id: "cascading-workflow",
    name: "Cascading Workflow",
    description: "Staggered boxes with numbered items and connecting lines",
    category: "cascading",
    minItems: 2,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: {
      style: "staggered",
    },
  },
];

// Get cascading layout by ID
export function getCascadingLayoutById(id: CascadingLayoutType): CascadingLayout | undefined {
  return cascadingLayouts.find((layout) => layout.id === id);
}

// Get all cascading layouts
export function getAllCascadingLayouts(): CascadingLayout[] {
  return cascadingLayouts;
}

// Base styles helper for cascading components
export function getBaseCascadingStyles(theme: Theme) {
  return {
    lineColor: theme.colors.border || "#cbd5e1",
    dotColor: theme.colors.accent || "#06b6d4",
    boxBg: theme.colors.surface || "#ffffff",
    boxBorder: theme.colors.border || "#e2e8f0",
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    numberBg: theme.colors.heading || "#1e293b",
    numberText: theme.colors.background || "#ffffff",
  };
}

// Generate gradient colors for boxes (matching reference design)
export function getCascadingBoxColors(index: number, totalItems: number): {
  bg: string;
  border: string;
} {
  // Color progression from bright green to dark blue (matching reference)
  const colors = [
    { bg: "#86efac", border: "#4ade80" }, // Bright green
    { bg: "#14b8a6", border: "#0d9488" }, // Teal
    { bg: "#0891b2", border: "#0e7490" }, // Cyan
    { bg: "#1e3a8a", border: "#1e40af" }, // Dark blue
  ];
  
  return colors[index % colors.length]!;
}

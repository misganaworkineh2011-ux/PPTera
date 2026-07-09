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
// comparison-split: arc diagram with left vs right items around two big circles
// comparison-style-2: Two Columns — headed left/right columns split by VS
// comparison-style-3: Row Face-off — paired left-vs-right rows with a VS gutter
// comparison-style-4: Head to Head — two contender cards facing off
// comparison-style-5: Center Spine — a center VS line with items alternating
// comparison-style-6: Diagonal Split — a diagonal versus panel
// comparison-style-7: Tinted Columns — two accent-tinted comparison columns
// comparison-style-8: Battle Cards — two stacked contender cards with badges
// comparison-style-9: Scorecard — numbered rows on each side
// comparison-style-10: Ribbon VS — banner headers over two lists
export type ComparisonLayoutType =
  | "comparison-split"
  | "comparison-style-2"
  | "comparison-style-3"
  | "comparison-style-4"
  | "comparison-style-5"
  | "comparison-style-6"
  | "comparison-style-7"
  | "comparison-style-8"
  | "comparison-style-9"
  | "comparison-style-10";

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
  ...(["comparison-style-2","comparison-style-3","comparison-style-4","comparison-style-5","comparison-style-6","comparison-style-7","comparison-style-8","comparison-style-9","comparison-style-10"] as const).map((id, i) => ({
    id,
    name: ["Two Columns","Row Face-off","Head to Head","Center Spine","Diagonal Split","Tinted Columns","Battle Cards","Scorecard","Ribbon VS"][i]!,
    description: ["Headed left and right columns split by VS","Paired left-vs-right rows with a VS gutter","Two contender cards facing off","A center VS line with items alternating","A diagonal versus panel","Two accent-tinted comparison columns","Two stacked contender cards with badges","Numbered rows on each side","Banner headers over two lists"][i]!,
    category: "comparison" as const,
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true as const,
    supportsIcons: true as const,
    preview: { style: "vertical-split" as const },
  })),
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

// Before & After Layout Definitions
// Circular comparison diagram with items on both sides

import type { Theme } from "~/lib/themes";

// Content item structure for before/after layouts
export interface BeforeAfterContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon
  side?: "before" | "after"; // Which side this item belongs to
}

// Before/After layout type identifier
// beforeafter-circle: hub with before arc on the left, after arc on the right
// beforeafter-style-2: Split Panel — muted BEFORE panel, accent AFTER panel, arrow
// beforeafter-style-3: Arrow Transform — before items → big arrow → after items
// beforeafter-style-4: Two Columns — BEFORE column vs AFTER column with headers
// beforeafter-style-5: Ledger Rows — paired before → after rows
// beforeafter-style-6: Diagonal Split — a diagonal before/after split
// beforeafter-style-7: Metric Deltas — before value → after value with a delta
// beforeafter-style-8: Stacked Compare — before card stacked above after per item
// beforeafter-style-9: Slider — a before/after divider with a center handle
// beforeafter-style-10: Timeline Transform — before → transformation → after
// beforeafter-style-11: Mirror Split — mirrored before/after with a center seam
// beforeafter-style-12: Toggle Cards — dim before cards brightening to after
export type BeforeAfterLayoutType =
  | "beforeafter-circle"
  | "beforeafter-style-2"
  | "beforeafter-style-3"
  | "beforeafter-style-4"
  | "beforeafter-style-5"
  | "beforeafter-style-6"
  | "beforeafter-style-7"
  | "beforeafter-style-8"
  | "beforeafter-style-9"
  | "beforeafter-style-10"
  | "beforeafter-style-11"
  | "beforeafter-style-12";

// Before/After layout definition interface
export interface BeforeAfterLayout {
  id: BeforeAfterLayoutType;
  name: string;
  description: string;
  category: "beforeafter";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style: "circle-comparison";
  };
}

// Before/After Layout Definition
export const beforeAfterLayouts: BeforeAfterLayout[] = [
  {
    id: "beforeafter-circle",
    name: "Before & After",
    description: "Circular comparison diagram with before and after states",
    category: "beforeafter",
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true,
    supportsIcons: true,
    preview: {
      style: "circle-comparison",
    },
  },
  ...(["beforeafter-style-2","beforeafter-style-3","beforeafter-style-4","beforeafter-style-5","beforeafter-style-6","beforeafter-style-7","beforeafter-style-8","beforeafter-style-9","beforeafter-style-10","beforeafter-style-11","beforeafter-style-12"] as const).map((id, i) => ({
    id,
    name: ["Split Panel","Arrow Transform","Two Columns","Ledger Rows","Diagonal Split","Metric Deltas","Stacked Compare","Slider","Timeline Transform","Mirror Split","Toggle Cards"][i]!,
    description: ["Muted before panel and accent after panel with an arrow","Before items flow through a big arrow into after items","Before column versus after column with headers","Paired before → after rows","A diagonal before/after split","Before value → after value with a delta","A before card stacked above the after card","A before/after divider with a center handle","Before → transformation → after in a timeline","Mirrored before/after with a center seam","Dim before cards brightening into after"][i]!,
    category: "beforeafter" as const,
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true as const,
    supportsIcons: true as const,
    preview: { style: "circle-comparison" as const },
  })),
];

// Get before/after layout by ID
export function getBeforeAfterLayoutById(id: BeforeAfterLayoutType): BeforeAfterLayout | undefined {
  return beforeAfterLayouts.find((layout) => layout.id === id);
}

// Get all before/after layouts
export function getAllBeforeAfterLayouts(): BeforeAfterLayout[] {
  return beforeAfterLayouts;
}

// Base styles helper for before/after components
export function getBaseBeforeAfterStyles(theme: Theme, accentColor?: string) {
  const primaryColor = accentColor || theme.colors.accent || "#f97316"; // Orange for before
  const secondaryColor = theme.colors.secondary || theme.colors.primary || "#14b8a6"; // Teal for after
  
  return {
    beforeColor: primaryColor,
    afterColor: secondaryColor,
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    iconBg: theme.colors.background || "#ffffff",
    iconBorder: theme.colors.border || "#e5e7eb",
  };
}

// Split items into before and after
export function splitBeforeAndAfter(items: BeforeAfterContentItem[]): {
  before: BeforeAfterContentItem[];
  after: BeforeAfterContentItem[];
} {
  // If items have explicit side property, use that
  const explicitBefore = items.filter(item => item.side === "before");
  const explicitAfter = items.filter(item => item.side === "after");
  
  if (explicitBefore.length > 0 || explicitAfter.length > 0) {
    return { before: explicitBefore, after: explicitAfter };
  }
  
  // Otherwise, split evenly
  const midpoint = Math.ceil(items.length / 2);
  return {
    before: items.slice(0, midpoint),
    after: items.slice(midpoint),
  };
}

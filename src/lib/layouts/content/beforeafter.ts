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
export type BeforeAfterLayoutType = "beforeafter-circle";

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

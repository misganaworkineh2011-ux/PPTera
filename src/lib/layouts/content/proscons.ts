// Pros and Cons Layout Definitions
// Split circle diagram with items on both sides

import type { Theme } from "~/lib/themes";

// Content item structure for pros/cons layouts
export interface ProsConsContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon
  side?: "pros" | "cons"; // Which side this item belongs to
}

// Pros/Cons layout type identifier
export type ProsConsLayoutType = "proscons-split";

// Pros/Cons layout definition interface
export interface ProsConsLayout {
  id: ProsConsLayoutType;
  name: string;
  description: string;
  category: "proscons";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style: "split-circle";
  };
}

// Pros/Cons Layout Definition
export const prosConsLayouts: ProsConsLayout[] = [
  {
    id: "proscons-split",
    name: "Pros & Cons",
    description: "Split circle diagram with pros and cons on each side",
    category: "proscons",
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true,
    supportsIcons: true,
    preview: {
      style: "split-circle",
    },
  },
];

// Get pros/cons layout by ID
export function getProsConsLayoutById(id: ProsConsLayoutType): ProsConsLayout | undefined {
  return prosConsLayouts.find((layout) => layout.id === id);
}

// Get all pros/cons layouts
export function getAllProsConsLayouts(): ProsConsLayout[] {
  return prosConsLayouts;
}

// Base styles helper for pros/cons components
export function getBaseProsConsStyles(theme: Theme) {
  return {
    prosColor: "#14b8a6", // Teal for pros
    consColor: "#fb923c", // Orange for cons
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    iconBg: theme.colors.background || "#ffffff",
    iconBorder: theme.colors.border || "#e5e7eb",
  };
}

// Split items into pros and cons
export function splitProsAndCons(items: ProsConsContentItem[]): {
  pros: ProsConsContentItem[];
  cons: ProsConsContentItem[];
} {
  // If items have explicit side property, use that
  const explicitPros = items.filter(item => item.side === "pros");
  const explicitCons = items.filter(item => item.side === "cons");
  
  if (explicitPros.length > 0 || explicitCons.length > 0) {
    return { pros: explicitPros, cons: explicitCons };
  }
  
  // Otherwise, split evenly
  const midpoint = Math.ceil(items.length / 2);
  return {
    pros: items.slice(0, midpoint),
    cons: items.slice(midpoint),
  };
}

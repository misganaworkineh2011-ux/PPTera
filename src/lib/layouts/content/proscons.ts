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
// proscons-split: puzzle-circle center with pros left / cons right
// proscons-style-2: Two Columns — ✓ pros column vs ✗ cons column
// proscons-style-3: Balance Scale — a scale weighing pros against cons
// proscons-style-4: Ledger — a plus/minus ledger with hairline rows
// proscons-style-5: VS Split — a diagonal split with a VS badge
// proscons-style-6: Thumbs — 👍 pros / 👎 cons columns of cards
// proscons-style-7: Checklist Duo — two check/cross checklist cards
// proscons-style-8: Weighted Bars — pros/cons as weighted count bars
// proscons-style-9: Card Stacks — tinted green pros and red cons card stacks
// proscons-style-10: Plus/Minus Grid — paired pro-vs-con rows
// proscons-style-11: Tug of War — a bar pulled left by pros, right by cons
// proscons-style-12: Sticky Columns — sticky-note pros and cons columns
export type ProsConsLayoutType =
  | "proscons-split"
  | "proscons-style-2"
  | "proscons-style-3"
  | "proscons-style-4"
  | "proscons-style-5"
  | "proscons-style-6"
  | "proscons-style-7"
  | "proscons-style-8"
  | "proscons-style-9"
  | "proscons-style-10"
  | "proscons-style-11"
  | "proscons-style-12";

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
  ...(["proscons-style-2","proscons-style-3","proscons-style-4","proscons-style-5","proscons-style-6","proscons-style-7","proscons-style-8","proscons-style-9","proscons-style-10","proscons-style-11","proscons-style-12"] as const).map((id, i) => ({
    id,
    name: ["Two Columns","Balance Scale","Ledger","VS Split","Thumbs","Checklist Duo","Weighted Bars","Card Stacks","Plus/Minus Grid","Tug of War","Sticky Columns"][i]!,
    description: ["Green pros and red cons in two clean columns","A scale weighing pros against cons","A plus/minus ledger with hairline rows","A diagonal split with a VS badge","Thumbs-up pros and thumbs-down cons cards","Two check and cross checklist cards","Pros and cons as weighted count bars","Tinted green pros and red cons card stacks","Paired pro-vs-con rows","A bar pulled left by pros and right by cons","Sticky-note pros and cons columns"][i]!,
    category: "proscons" as const,
    minItems: 4,
    maxItems: 12,
    idealItems: 8,
    adaptive: true as const,
    supportsIcons: true as const,
    preview: { style: "split-circle" as const },
  })),
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

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
// cascading-workflow: staggered boxes with numbered items and connecting lines
// cascading-style-2: Terrace Steps — leading blocks grow row by row
// cascading-style-3: Hanging Tags — cards on strings at staggered depths
// cascading-style-4: Elbow Branch — L-connectors stepping down-right
// cascading-style-5: Diagonal Rail — cards docked along one diagonal line
// cascading-style-6: Paper Fan — overlapping sheets stepping down-right
// cascading-style-7: Indent Returns — code-style tab stops with return arrows
// cascading-style-8: Ripple Drop — ripple nodes descending diagonally
export type CascadingLayoutType =
  | "cascading-workflow"
  | "cascading-style-2"
  | "cascading-style-3"
  | "cascading-style-4"
  | "cascading-style-5"
  | "cascading-style-6"
  | "cascading-style-7"
  | "cascading-style-8";

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
    style: "staggered" | "terrace" | "tags" | "elbow" | "diagonal" | "fan" | "indent" | "ripple";
  };
}

// Cascading Layout Definitions
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
  {
    id: "cascading-style-2",
    name: "Terrace Steps",
    description: "Leading accent blocks that grow row by row into terraces",
    category: "cascading",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "terrace" },
  },
  {
    id: "cascading-style-3",
    name: "Hanging Tags",
    description: "Tag cards hanging from a rail at staggered depths",
    category: "cascading",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "tags" },
  },
  {
    id: "cascading-style-4",
    name: "Elbow Branch",
    description: "Numbered nodes stepping down-right on elbow connectors",
    category: "cascading",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "elbow" },
  },
  {
    id: "cascading-style-5",
    name: "Diagonal Rail",
    description: "Cards docked along one diagonal accent line",
    category: "cascading",
    minItems: 3,
    maxItems: 4,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "diagonal" },
  },
  {
    id: "cascading-style-6",
    name: "Paper Fan",
    description: "Overlapping tilted sheets stepping down-right",
    category: "cascading",
    minItems: 3,
    maxItems: 4,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "fan" },
  },
  {
    id: "cascading-style-7",
    name: "Indent Returns",
    description: "Code-style tab stops with return arrows and mono numbering",
    category: "cascading",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "indent" },
  },
  {
    id: "cascading-style-8",
    name: "Ripple Drop",
    description: "Ripple-ring nodes descending diagonally with content beside",
    category: "cascading",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "ripple" },
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

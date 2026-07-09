// Chevron Layout Definitions
// Continuous flow steps with chevron/arrow shapes

import type { Theme } from "~/lib/themes";

// Content item structure for chevron layouts
export interface ChevronContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon - leave blank/placeholder if not provided
}

// Chevron layout type identifier
// chevron-flow: horizontal overlapping SVG chevrons, content below
// chevron-style-2: Solid Arrow Row — filled accent arrow segments in a row
// chevron-style-3: Chevron Stack — downward-pointing chevron bars stacked
// chevron-style-4: Arrow Cards — cards clipped into right-pointing arrows
// chevron-style-5: Angle Brackets — text blocks split by big accent chevrons
// chevron-style-6: Chevron Rail — numbered chevron pills on a patterned rail
// chevron-style-7: Zigzag Tabs — alternating up/down chevron-notched tabs
// chevron-style-8: Ascending Steps — chevron blocks rising like a staircase
// chevron-style-9: Double Chevron — mono » markers, indented list
// chevron-style-10: Signpost Chevrons — directional sign boards pointing right
// chevron-style-11: Outline Chevrons — stroke-only chevron segments, content inside
// chevron-style-12: Ribbon Banners — forked-tail pennant strips in a row
// chevron-style-13: Gradient Merge — one continuous gradient across arrow segments
// chevron-style-14: Dot Timeline — baseline dots joined by ›› marks, content below
// chevron-style-15: Nested Chevrons — » »» »»» acceleration list
// chevron-style-16: Chevron Grid — 2-column cards with a chevron corner clip
// chevron-style-17: Pennant Flags — triangular flags on a top string
// chevron-style-18: Boomerang Stack — wide angle-bracket shapes stacked
// chevron-style-19: Chevron Progress — one segmented notched bar, labels below
// chevron-style-20: Directional Tiles — tiles with a big chevron watermark
// chevron-style-21: Chevron Milestones — vertical rail of » badges + content cards
// chevron-style-22: Chevron Columns — full-height chevron-topped columns
// chevron-style-23: Inset Arrows — arrow segments with an inset number well
// chevron-style-24: Chevron Path — a rising chevron trail with milestone cards
// chevron-style-25: Split Chevrons — two-tone arrow halves per step
// chevron-style-26: Arrow Ladder — vertical downward arrows joined head to tail
// chevron-style-27: Neon Chevrons — glowing outlined chevrons on a dark wash
// chevron-style-28: Chevron Fold — accordion-like folded chevron panels
// chevron-style-29: Compact Arrows — a dense single-line arrow strip with tooltips-style captions
// chevron-style-30: Chevron Spotlight — one emphasized arrow among quiet ones
export type ChevronLayoutType =
  | "chevron-flow"
  | "chevron-style-2"
  | "chevron-style-3"
  | "chevron-style-4"
  | "chevron-style-5"
  | "chevron-style-6"
  | "chevron-style-7"
  | "chevron-style-8"
  | "chevron-style-9"
  | "chevron-style-10"
  | "chevron-style-11"
  | "chevron-style-12"
  | "chevron-style-13"
  | "chevron-style-14"
  | "chevron-style-15"
  | "chevron-style-16"
  | "chevron-style-17"
  | "chevron-style-18"
  | "chevron-style-19"
  | "chevron-style-20"
  | "chevron-style-21"
  | "chevron-style-22"
  | "chevron-style-23"
  | "chevron-style-24"
  | "chevron-style-25"
  | "chevron-style-26"
  | "chevron-style-27"
  | "chevron-style-28"
  | "chevron-style-29"
  | "chevron-style-30";

// Chevron layout definition interface
export interface ChevronLayout {
  id: ChevronLayoutType;
  name: string;
  description: string;
  category: "chevron";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style:
      | "horizontal-chevron"
      | "arrow-row"
      | "stack"
      | "arrow-cards"
      | "brackets"
      | "rail"
      | "zigzag"
      | "ascending"
      | "double"
      | "signpost"
      | "outline"
      | "ribbon"
      | "gradient"
      | "dot-timeline"
      | "nested"
      | "grid"
      | "pennant"
      | "boomerang"
      | "progress"
      | "tiles"
      | "milestones";
  };
}

// Chevron Layout Definitions
export const chevronLayouts: ChevronLayout[] = [
  {
    id: "chevron-flow",
    name: "Chevron Flow",
    description: "Horizontal chevron arrows with numbered steps and icons",
    category: "chevron",
    minItems: 3,
    maxItems: 6,
    idealItems: 5,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "horizontal-chevron" },
  },
  {
    id: "chevron-style-2",
    name: "Solid Arrow Row",
    description: "Filled accent arrow segments flowing left to right",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "arrow-row" },
  },
  {
    id: "chevron-style-3",
    name: "Chevron Stack",
    description: "Downward-pointing chevron bars stacked vertically",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "stack" },
  },
  {
    id: "chevron-style-4",
    name: "Arrow Cards",
    description: "Cards clipped into right-pointing arrows, alternating tint",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "arrow-cards" },
  },
  {
    id: "chevron-style-5",
    name: "Angle Brackets",
    description: "Text blocks separated by oversized accent chevron glyphs",
    category: "chevron",
    minItems: 3,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "brackets" },
  },
  {
    id: "chevron-style-6",
    name: "Chevron Rail",
    description: "Numbered chevron pills riding a chevron-patterned rail",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "rail" },
  },
  {
    id: "chevron-style-7",
    name: "Zigzag Tabs",
    description: "Alternating up and down chevron-notched tabs",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "zigzag" },
  },
  {
    id: "chevron-style-8",
    name: "Ascending Steps",
    description: "Chevron blocks rising like a staircase, labels below",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "ascending" },
  },
  {
    id: "chevron-style-9",
    name: "Double Chevron",
    description: "Mono double-chevron markers in an indented list",
    category: "chevron",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "double" },
  },
  {
    id: "chevron-style-10",
    name: "Signpost Chevrons",
    description: "Directional sign boards ending in a chevron point",
    category: "chevron",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { style: "signpost" },
  },
  {
    id: "chevron-style-11",
    name: "Outline Chevrons",
    description: "Stroke-only chevron segments with content inside",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "outline" },
  },
  {
    id: "chevron-style-12",
    name: "Ribbon Banners",
    description: "Forked-tail pennant ribbon strips flowing in a row",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "ribbon" },
  },
  {
    id: "chevron-style-13",
    name: "Gradient Merge",
    description: "One continuous gradient flowing across arrow segments",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "gradient" },
  },
  {
    id: "chevron-style-14",
    name: "Chevron Timeline",
    description: "Baseline dots joined by chevron marks, content below",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "dot-timeline" },
  },
  {
    id: "chevron-style-15",
    name: "Nested Chevrons",
    description: "Growing » »» »»» markers indicating acceleration",
    category: "chevron",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "nested" },
  },
  {
    id: "chevron-style-16",
    name: "Chevron Grid",
    description: "Two-column cards each with a clipped chevron corner",
    category: "chevron",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "grid" },
  },
  {
    id: "chevron-style-17",
    name: "Pennant Flags",
    description: "Triangular pennant flags hanging from a top string",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "pennant" },
  },
  {
    id: "chevron-style-18",
    name: "Boomerang Stack",
    description: "Wide angle-bracket boomerang shapes stacked vertically",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "boomerang" },
  },
  {
    id: "chevron-style-19",
    name: "Chevron Progress",
    description: "One segmented notched progress bar with labels below",
    category: "chevron",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "progress" },
  },
  {
    id: "chevron-style-20",
    name: "Directional Tiles",
    description: "Tiles with a large translucent chevron watermark",
    category: "chevron",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "tiles" },
  },
  {
    id: "chevron-style-21",
    name: "Chevron Milestones",
    description: "Vertical rail of chevron badges beside content cards",
    category: "chevron",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { style: "milestones" },
  },
];

// Get chevron layout by ID
export function getChevronLayoutById(id: ChevronLayoutType): ChevronLayout | undefined {
  return chevronLayouts.find((layout) => layout.id === id);
}

// Get all chevron layouts
export function getAllChevronLayouts(): ChevronLayout[] {
  return chevronLayouts;
}

// Base styles helper for chevron components
export function getBaseChevronStyles(theme: Theme) {
  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    numberColor: "#ffffff",
    iconColor: "#ffffff",
  };
}

// Generate gradient colors for chevrons using theme colors
export function getChevronColors(index: number, totalItems: number, accentColor?: string, secondaryColor?: string): {
  bg: string;
  text: string;
} {
  // If theme colors provided, create gradient from accent to secondary
  if (accentColor && secondaryColor) {
    // Interpolate between accent and secondary color
    const ratio = totalItems > 1 ? index / (totalItems - 1) : 0;
    // For now, use accent color with varying opacity/brightness
    return {
      bg: accentColor,
      text: "#ffffff",
    };
  }
  
  // Fallback: Color progression from bright green to dark navy (matching reference)
  const colors = [
    { bg: "#22c55e", text: "#ffffff" }, // Bright green
    { bg: "#10b981", text: "#ffffff" }, // Green
    { bg: "#14b8a6", text: "#ffffff" }, // Teal
    { bg: "#0891b2", text: "#ffffff" }, // Cyan
    { bg: "#0e7490", text: "#ffffff" }, // Dark cyan
    { bg: "#1e3a8a", text: "#ffffff" }, // Dark navy
  ];
  
  return colors[index % colors.length]!;
}

// Generate SVG path for chevron shape
export function getChevronPath(
  width: number,
  height: number,
  arrowWidth: number = 30
): string {
  // Create a chevron/arrow shape pointing right
  // The shape is a rectangle with a triangular arrow on the right side
  
  const points = [
    `0,0`, // Top left
    `${width - arrowWidth},0`, // Top right (before arrow)
    `${width},${height / 2}`, // Arrow tip (middle right)
    `${width - arrowWidth},${height}`, // Bottom right (after arrow)
    `0,${height}`, // Bottom left
    `${arrowWidth},${height / 2}`, // Left arrow indent (middle left)
  ];
  
  return `M ${points.join(" L ")} Z`;
}

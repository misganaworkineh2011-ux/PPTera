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
export type ChevronLayoutType = "chevron-flow";

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
    style: "horizontal-chevron";
  };
}

// Chevron Layout Definition
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
    preview: {
      style: "horizontal-chevron",
    },
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

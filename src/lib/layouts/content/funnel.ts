// Funnel Layout Definitions
// Funnel-style steps with rounded pill bars and side content

import type { Theme } from "~/lib/themes";

// Content item structure for funnel layouts
export interface FunnelContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon - leave blank/placeholder if not provided
}

// Funnel layout type identifier
export type FunnelLayoutType = "funnel-steps";

// Funnel layout definition interface
export interface FunnelLayout {
  id: FunnelLayoutType;
  name: string;
  description: string;
  category: "funnel";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true;
  // Preview configuration
  preview: {
    style: "funnel-bars";
  };
}

// Funnel Layout Definition
export const funnelLayouts: FunnelLayout[] = [
  {
    id: "funnel-steps",
    name: "Funnel Steps",
    description: "Funnel-style bars with icons and side content",
    category: "funnel",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: {
      style: "funnel-bars",
    },
  },
];

// Get funnel layout by ID
export function getFunnelLayoutById(id: FunnelLayoutType): FunnelLayout | undefined {
  return funnelLayouts.find((layout) => layout.id === id);
}

// Get all funnel layouts
export function getAllFunnelLayouts(): FunnelLayout[] {
  return funnelLayouts;
}

// Base styles helper for funnel components
export function getBaseFunnelStyles(theme: Theme) {
  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    iconBg: "#ffffff",
    iconBorder: "#e5e7eb",
  };
}

// Generate gradient colors for funnel bars using theme colors
export function getFunnelColors(index: number, totalItems: number, accentColor?: string, secondaryColor?: string): {
  bg: string;
  text: string;
} {
  // If theme colors provided, use them
  if (accentColor) {
    return {
      bg: `linear-gradient(135deg, ${accentColor}cc 0%, ${accentColor} 100%)`,
      text: "#ffffff",
    };
  }
  
  // Fallback: Color progression from teal → cyan → blue → orange (matching reference)
  const colors = [
    { bg: "linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)", text: "#1e293b" }, // Teal
    { bg: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", text: "#1e293b" }, // Cyan
    { bg: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", text: "#ffffff" }, // Blue
    { bg: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)", text: "#1e293b" }, // Orange
    { bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", text: "#1e293b" }, // Amber
    { bg: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", text: "#ffffff" }, // Purple
  ];
  
  return colors[index % colors.length]!;
}

// Calculate bar width based on funnel effect (each bar gets progressively smaller)
export function getFunnelBarWidth(index: number, totalItems: number): number {
  // Start at 90% and decrease by 12% for each step
  const baseWidth = 90;
  const decreasePerStep = 12;
  return Math.max(baseWidth - (index * decreasePerStep), 35); // Minimum 35%
}

// Circle Layout Definitions
// 2 specific circular arrangement styles

import type { Theme } from "~/lib/themes";

// Content item structure for circle layouts
export interface CircleContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon - leave blank/placeholder if not provided
}

// Circle layout type identifier
export type CircleLayoutType =
  | "circle-arc" // Arc/semi-circle with 3 segments, content around edges
  | "circle-ring"; // Full ring with 3 segments, content on sides

// Circle layout definition interface
export interface CircleLayout {
  id: CircleLayoutType;
  name: string;
  description: string;
  category: "circles";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true; // All circle layouts support optional icons
  // Preview configuration
  preview: {
    shape: "arc" | "ring";
    segments: number;
  };
}

// 2 Specific Circle Layout Definitions
export const circleLayouts: CircleLayout[] = [
  // Style 1: Arc Layout (from image 1)
  // 3 curved segments forming an arc, content positioned around (left, top, right)
  {
    id: "circle-arc",
    name: "Arc Flow",
    description: "Three curved segments in an arc with content positioned around the edges",
    category: "circles",
    minItems: 2,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: {
      shape: "arc",
      segments: 3,
    },
  },

  // Style 2: Ring Layout (from image 2)
  // 3 segments forming a complete ring, content on left and right sides
  {
    id: "circle-ring",
    name: "Ring Cycle",
    description: "Three segments forming a ring with content on the sides",
    category: "circles",
    minItems: 2,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: {
      shape: "ring",
      segments: 3,
    },
  },
];

// Get circle layout by ID
export function getCircleLayoutById(id: CircleLayoutType): CircleLayout | undefined {
  return circleLayouts.find((layout) => layout.id === id);
}

// Get all circle layouts
export function getAllCircleLayouts(): CircleLayout[] {
  return circleLayouts;
}

// Get recommended layout based on content count and available space
export function getRecommendedCircleLayout(
  itemCount: number,
  isNarrowSpace: boolean = false
): CircleLayout {
  // Ring layout works better in narrow spaces (vertical arrangement)
  if (isNarrowSpace) {
    return circleLayouts[1]!; // Ring
  }
  // Arc layout for wider spaces
  return circleLayouts[0]!; // Arc
}

// Base styles helper for circle components
export function getBaseCircleStyles(theme: Theme) {
  const cardBox = theme.cardBox;
  return {
    // Segment colors
    segmentBg: cardBox?.background || `${theme.colors.surface}90`,
    segmentBorder: cardBox?.borderColor || theme.colors.border,
    // Icon placeholder
    iconBg: `${cardBox?.accentColor || theme.colors.accent}15`,
    iconColor: cardBox?.accentColor || theme.colors.accent,
    // Text colors
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    // Shadows
    shadow: cardBox?.shadow || theme.design.shadows.small,
  };
}

// SVG path generators for the arc segments
export function getArcSegmentPath(
  index: number,
  totalSegments: number = 3,
  outerRadius: number = 150,
  innerRadius: number = 80,
  gapAngle: number = 8 // degrees gap between segments
): string {
  // Arc spans from -180 to 0 degrees (bottom half of circle, opening upward)
  const totalArcAngle = 180 - (totalSegments - 1) * gapAngle;
  const segmentAngle = totalArcAngle / totalSegments;
  
  const startAngle = -180 + index * (segmentAngle + gapAngle);
  const endAngle = startAngle + segmentAngle;
  
  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const outerStart = {
    x: outerRadius * Math.cos(startRad),
    y: outerRadius * Math.sin(startRad),
  };
  const outerEnd = {
    x: outerRadius * Math.cos(endRad),
    y: outerRadius * Math.sin(endRad),
  };
  const innerStart = {
    x: innerRadius * Math.cos(startRad),
    y: innerRadius * Math.sin(startRad),
  };
  const innerEnd = {
    x: innerRadius * Math.cos(endRad),
    y: innerRadius * Math.sin(endRad),
  };
  
  // Create path: outer arc, line to inner, inner arc (reverse), close
  const largeArc = segmentAngle > 180 ? 1 : 0;
  
  return `
    M ${outerStart.x} ${outerStart.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
    Z
  `.trim();
}

// SVG path generators for the ring segments
export function getRingSegmentPath(
  index: number,
  totalSegments: number = 3,
  outerRadius: number = 120,
  innerRadius: number = 60,
  gapAngle: number = 12 // degrees gap between segments
): string {
  // Full circle divided into segments
  const totalAngle = 360 - totalSegments * gapAngle;
  const segmentAngle = totalAngle / totalSegments;
  
  // Start from top (-90 degrees) and go clockwise
  const startAngle = -90 + index * (segmentAngle + gapAngle);
  const endAngle = startAngle + segmentAngle;
  
  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const outerStart = {
    x: outerRadius * Math.cos(startRad),
    y: outerRadius * Math.sin(startRad),
  };
  const outerEnd = {
    x: outerRadius * Math.cos(endRad),
    y: outerRadius * Math.sin(endRad),
  };
  const innerStart = {
    x: innerRadius * Math.cos(startRad),
    y: innerRadius * Math.sin(startRad),
  };
  const innerEnd = {
    x: innerRadius * Math.cos(endRad),
    y: innerRadius * Math.sin(endRad),
  };
  
  const largeArc = segmentAngle > 180 ? 1 : 0;
  
  return `
    M ${outerStart.x} ${outerStart.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
    Z
  `.trim();
}

// Get icon position for arc layout (where to place the icon on each segment)
export function getArcIconPosition(
  index: number,
  totalSegments: number = 3,
  radius: number = 115 // midpoint between inner and outer
): { x: number; y: number } {
  const totalArcAngle = 180 - (totalSegments - 1) * 8;
  const segmentAngle = totalArcAngle / totalSegments;
  const midAngle = -180 + index * (segmentAngle + 8) + segmentAngle / 2;
  const rad = (midAngle * Math.PI) / 180;
  
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

// Get icon position for ring layout
export function getRingIconPosition(
  index: number,
  totalSegments: number = 3,
  radius: number = 90 // midpoint between inner and outer
): { x: number; y: number } {
  const totalAngle = 360 - totalSegments * 12;
  const segmentAngle = totalAngle / totalSegments;
  const midAngle = -90 + index * (segmentAngle + 12) + segmentAngle / 2;
  const rad = (midAngle * Math.PI) / 180;
  
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

// Get content position for arc layout (where to place text content)
export function getArcContentPosition(
  index: number,
  totalSegments: number = 3
): { position: "left" | "top" | "right"; alignment: "left" | "center" | "right" } {
  // For 3 segments: left, top, right
  if (totalSegments === 3) {
    if (index === 0) return { position: "left", alignment: "right" };
    if (index === 1) return { position: "top", alignment: "center" };
    return { position: "right", alignment: "left" };
  }
  // For 2 segments: left, right
  if (totalSegments === 2) {
    return index === 0 
      ? { position: "left", alignment: "right" }
      : { position: "right", alignment: "left" };
  }
  // For 4 segments: left, top-left, top-right, right
  if (index === 0) return { position: "left", alignment: "right" };
  if (index === 3) return { position: "right", alignment: "left" };
  return { position: "top", alignment: "center" };
}

// Get content position for ring layout
export function getRingContentPosition(
  index: number,
  totalSegments: number = 3
): { position: "left" | "right"; items: number[] } {
  // For 3 segments: 1 on left (index 0), 2 on right (index 1, 2)
  if (totalSegments === 3) {
    if (index === 0) return { position: "left", items: [0] };
    return { position: "right", items: [1, 2] };
  }
  // For 2 segments: 1 on each side
  return index === 0 
    ? { position: "left", items: [0] }
    : { position: "right", items: [1] };
}

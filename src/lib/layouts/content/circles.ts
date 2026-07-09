// Circle Layout Definitions
// 1 specific circular arrangement style - FULLY DYNAMIC for any item count

import type { Theme } from "~/lib/themes";

// Content item structure for circle layouts
export interface CircleContentItem {
  label?: string;
  text: string;
  icon?: string; // Optional icon - leave blank/placeholder if not provided
}

// Circle layout type identifier
// circle-style-6: Orbit Nodes — numbered nodes evenly spaced on a dashed ring
// circle-style-7: Pie Segments — a filled pie split into wedges, legend beside
// circle-style-8: Donut Legend — a donut chart with a centered core and legend
// circle-style-9: Radial Bars — bars radiating from a hub like a sunburst
// circle-style-10: Concentric Rings — items as nested rings around a core
// circle-style-11: Compass — cardinal-point nodes on a compass rose
// circle-style-12: Segmented Wheel — a colour wheel of segments with a hub label
// circle-style-13: Bubble Ring — soft bubble nodes ringing a central bubble
// circle-style-14: Clock Steps — numbered steps around a clock-face dial
export type CircleLayoutType =
  | "circle-arc" // Arc/semi-circle with dynamic segments, content around edges
  | "circle-ring" // Full ring with dynamic segments, content distributed around
  | "circle-workflow" // Circular workflow with arrows and numbered steps
  | "circle-focus" // Core focus areas with radiating segments and callouts
  | "circle-petal" // Iterative cycle with overlapping petal circles
  | "circle-style-6"
  | "circle-style-7"
  | "circle-style-8"
  | "circle-style-9"
  | "circle-style-10"
  | "circle-style-11"
  | "circle-style-12"
  | "circle-style-13"
  | "circle-style-14";

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

// Specific Circle Layout Definitions - Now fully dynamic
export const circleLayouts: CircleLayout[] = [
  // Style 1: Ring Layout - Dynamic segments
  {
    id: "circle-ring",
    name: "Ring Cycle",
    description: "Dynamic segments forming a ring with content distributed around",
    category: "circles",
    minItems: 1,
    maxItems: 8, // Now supports up to 8 items
    idealItems: 3,
    adaptive: true,
    supportsIcons: true,
    preview: {
      shape: "ring",
      segments: 3,
    },
  },
  // Style 2: Workflow Layout - Circular process with arrows
  {
    id: "circle-workflow",
    name: "Workflow Process",
    description: "Circular workflow with arrows and numbered steps on the side",
    category: "circles",
    minItems: 2,
    maxItems: 6,
    idealItems: 5,
    adaptive: true,
    supportsIcons: true,
    preview: {
      shape: "ring",
      segments: 5,
    },
  },
  // Style 3: Focus Areas - Radiating segments with callouts
  {
    id: "circle-focus",
    name: "Core Focus Areas",
    description: "Radiating segments from center with numbered callout boxes",
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
  // Style 4: Petal Cycle - Overlapping circles in flower pattern
  {
    id: "circle-petal",
    name: "Iterative Cycle",
    description: "Overlapping petal circles with side content boxes for cyclical processes",
    category: "circles",
    minItems: 3,
    maxItems: 5,
    idealItems: 5,
    adaptive: true,
    supportsIcons: true,
    preview: {
      shape: "ring",
      segments: 5,
    },
  },
  {
    id: "circle-style-6",
    name: "Orbit Nodes",
    description: "Numbered nodes evenly spaced on a dashed ring",
    category: "circles",
    minItems: 3, maxItems: 8, idealItems: 5,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 6 },
  },
  {
    id: "circle-style-7",
    name: "Pie Segments",
    description: "A filled pie split into wedges with a legend beside",
    category: "circles",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 4 },
  },
  {
    id: "circle-style-8",
    name: "Donut Legend",
    description: "A donut chart with a centered core and a legend",
    category: "circles",
    minItems: 3, maxItems: 6, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 4 },
  },
  {
    id: "circle-style-9",
    name: "Radial Bars",
    description: "Bars radiating from a hub like a sunburst",
    category: "circles",
    minItems: 3, maxItems: 8, idealItems: 6,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 6 },
  },
  {
    id: "circle-style-10",
    name: "Concentric Rings",
    description: "Items as nested rings around a core",
    category: "circles",
    minItems: 3, maxItems: 5, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 4 },
  },
  {
    id: "circle-style-11",
    name: "Compass",
    description: "Cardinal-point nodes on a compass rose",
    category: "circles",
    minItems: 3, maxItems: 4, idealItems: 4,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 4 },
  },
  {
    id: "circle-style-12",
    name: "Segmented Wheel",
    description: "A colour wheel of segments with a hub label",
    category: "circles",
    minItems: 3, maxItems: 8, idealItems: 6,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 6 },
  },
  {
    id: "circle-style-13",
    name: "Bubble Ring",
    description: "Soft bubble nodes ringing a central bubble",
    category: "circles",
    minItems: 3, maxItems: 7, idealItems: 5,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 5 },
  },
  {
    id: "circle-style-14",
    name: "Clock Steps",
    description: "Numbered steps around a clock-face dial",
    category: "circles",
    minItems: 3, maxItems: 8, idealItems: 6,
    adaptive: true, supportsIcons: true,
    preview: { shape: "ring", segments: 6 },
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
  return circleLayouts[0]!; // Ring
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

// SVG path generators for arc segments with arrow-shaped gaps (matching reference design)
export function getArcSegmentPath(
  index: number,
  totalSegments: number = 3,
  outerRadius: number = 300,
  innerRadius: number = 160,
  gapAngle: number = 4 // small gap between segments
): string {
  // Full circle divided into arc segments
  const totalAngle = 360 - totalSegments * gapAngle;
  const segmentAngle = totalAngle / totalSegments;
  
  // Start from top (-90 degrees) and go clockwise
  const startAngle = -90 + index * (segmentAngle + gapAngle);
  const endAngle = startAngle + segmentAngle;
  
  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate the 4 corner points of a basic arc
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
  
  // Arrow-shaped gap: create chevron points at the midpoint of the radial edges
  const midRadius = (outerRadius + innerRadius) / 2;
  const chevronDepth = gapAngle * 0.8; // How far the chevron points inward (in degrees)
  
  // Start edge: chevron points INWARD (receiving the previous segment's arrow)
  const startChevronRad = ((startAngle + chevronDepth) * Math.PI) / 180;
  const startChevron = {
    x: midRadius * Math.cos(startChevronRad),
    y: midRadius * Math.sin(startChevronRad),
  };
  
  // End edge: chevron points OUTWARD (arrow tip pointing to next segment)
  const endChevronRad = ((endAngle - chevronDepth) * Math.PI) / 180;
  const endChevron = {
    x: midRadius * Math.cos(endChevronRad),
    y: midRadius * Math.sin(endChevronRad),
  };
  
  const largeArc = segmentAngle > 180 ? 1 : 0;
  
  // Path with arrow-shaped edges:
  // Start: outer corner -> chevron point -> inner corner
  // End: inner corner -> chevron point -> outer corner
  return `
    M ${outerStart.x} ${outerStart.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
    L ${endChevron.x} ${endChevron.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
    L ${startChevron.x} ${startChevron.y}
    Z
  `.trim();
}

// SVG path generators for ring segments with arrow-shaped gaps (matching reference design)
export function getRingSegmentPath(
  index: number,
  totalSegments: number = 3,
  outerRadius: number = 240,
  innerRadius: number = 120,
  gapAngle: number = 4, // small gap between segments
  startOffset: number = -90 // rotation offset (default: start from top)
): string {
  // Full circle divided into arc segments
  const totalAngle = 360 - totalSegments * gapAngle;
  const segmentAngle = totalAngle / totalSegments;
  
  // Start from specified offset and go clockwise
  const startAngle = startOffset + index * (segmentAngle + gapAngle);
  const endAngle = startAngle + segmentAngle;
  
  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate the 4 corner points of a basic arc
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
  
  // Arrow-shaped gap: create chevron points at the midpoint of the radial edges
  const midRadius = (outerRadius + innerRadius) / 2;
  const chevronDepth = gapAngle * 0.8; // How far the chevron points inward (in degrees)
  
  // Start edge: chevron points INWARD (receiving the previous segment's arrow)
  const startChevronRad = ((startAngle + chevronDepth) * Math.PI) / 180;
  const startChevron = {
    x: midRadius * Math.cos(startChevronRad),
    y: midRadius * Math.sin(startChevronRad),
  };
  
  // End edge: chevron points OUTWARD (arrow tip pointing to next segment)
  const endChevronRad = ((endAngle - chevronDepth) * Math.PI) / 180;
  const endChevron = {
    x: midRadius * Math.cos(endChevronRad),
    y: midRadius * Math.sin(endChevronRad),
  };
  
  const largeArc = segmentAngle > 180 ? 1 : 0;
  
  // Path with arrow-shaped edges:
  // Start: outer corner -> chevron point -> inner corner
  // End: inner corner -> chevron point -> outer corner
  return `
    M ${outerStart.x} ${outerStart.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
    L ${endChevron.x} ${endChevron.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
    L ${startChevron.x} ${startChevron.y}
    Z
  `.trim();
}

// Get icon position for arc layout (where to place the icon on each segment)
export function getArcIconPosition(
  index: number,
  totalSegments: number = 3,
  radius: number = 230,
  gapAngle: number = 4
): { x: number; y: number } {
  const totalAngle = 360 - totalSegments * gapAngle;
  const segmentAngle = totalAngle / totalSegments;
  const startAngle = -90 + index * (segmentAngle + gapAngle);
  const midAngle = startAngle + segmentAngle / 2;
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
  radius: number = 180,
  gapAngle: number = 4,
  startOffset: number = -90
): { x: number; y: number } {
  const totalAngle = 360 - totalSegments * gapAngle;
  const segmentAngle = totalAngle / totalSegments;
  const startAngle = startOffset + index * (segmentAngle + gapAngle);
  const midAngle = startAngle + segmentAngle / 2;
  const rad = (midAngle * Math.PI) / 180;
  
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

// Get content position for arc layout (where to place text content)
// Now fully dynamic for any number of segments
export function getArcContentPosition(
  index: number,
  totalSegments: number = 3
): { position: "left" | "top" | "right" | "top-left" | "top-right"; alignment: "left" | "center" | "right" } {
  // Calculate position based on segment angle
  const totalArcAngle = 180;
  const segmentAngle = totalArcAngle / totalSegments;
  const midAngle = -180 + index * segmentAngle + segmentAngle / 2;
  
  // Determine position based on angle
  // -180 to -135: left
  // -135 to -45: top (with variations)
  // -45 to 0: right
  if (midAngle <= -135) {
    return { position: "left", alignment: "right" };
  } else if (midAngle >= -45) {
    return { position: "right", alignment: "left" };
  } else if (midAngle <= -112.5) {
    return { position: "top-left", alignment: "right" };
  } else if (midAngle >= -67.5) {
    return { position: "top-right", alignment: "left" };
  } else {
    return { position: "top", alignment: "center" };
  }
}

// Get content position for ring layout - now returns angle-based position
export function getRingContentPosition(
  index: number,
  totalSegments: number = 3
): { angle: number; position: "left" | "right" | "top" | "bottom" } {
  const totalAngle = 360;
  const segmentAngle = totalAngle / totalSegments;
  // Start from top (-90 degrees) and go clockwise
  const midAngle = -90 + index * segmentAngle + segmentAngle / 2;
  
  // Normalize angle to 0-360
  const normalizedAngle = ((midAngle % 360) + 360) % 360;
  
  // Determine quadrant
  let position: "left" | "right" | "top" | "bottom";
  if (normalizedAngle >= 315 || normalizedAngle < 45) {
    position = "top";
  } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
    position = "right";
  } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
    position = "bottom";
  } else {
    position = "left";
  }
  
  return { angle: midAngle, position };
}

// Calculate grid layout for content items around the circle
export function calculateCircleContentGrid(itemCount: number): {
  columns: number;
  rows: number;
  layout: "around" | "sides" | "grid";
} {
  if (itemCount <= 3) {
    return { columns: 3, rows: 1, layout: "around" };
  } else if (itemCount <= 4) {
    return { columns: 2, rows: 2, layout: "sides" };
  } else if (itemCount <= 6) {
    return { columns: 3, rows: 2, layout: "grid" };
  } else {
    return { columns: 4, rows: Math.ceil(itemCount / 4), layout: "grid" };
  }
}

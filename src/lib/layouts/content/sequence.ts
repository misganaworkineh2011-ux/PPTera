// Sequence Layout Definitions
// 4 specific sequence/timeline styles as requested

import type { Theme } from "~/lib/themes";

// Content item structure for sequence layouts (same as boxes)
export interface SequenceContentItem {
  label?: string;
  text: string;
  icon?: string;
}

// Sequence layout type identifier
export type SequenceLayoutType =
  | "sequence-style-1" // Horizontal Top Process
  | "sequence-style-2" // Horizontal Timeline
  | "sequence-style-3" // Vertical List
  | "sequence-style-4" // Vertical Alternating
  | "sequence-style-5" // Wave Flow — nodes at alternating heights on a flowing polyline
  | "sequence-style-6" // Hop Arcs — dotted arcs hopping node to node with arrowheads
  | "sequence-style-7" // Paper Chain — cards joined by interlocked chain rings
  | "sequence-style-8" // Handoff Lanes — indented bars passing the baton downward
  | "sequence-style-9" // Breadcrumb Trail — chips flowing with › separators
  | "sequence-style-10" // Fold Ribbon — a folded ribbon strip of alternating facets
  | "sequence-style-11"; // Signal Path — dashed line with amplifier nodes, mono numbering

// Sequence layout definition interface
export interface SequenceLayout {
  id: SequenceLayoutType;
  name: string;
  description: string;
  category: "sequence";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  supportsIcons: true; // All sequence layouts support icons/dots
  // Preview configuration
  preview: {
    orientation: "horizontal" | "vertical";
    style: "top" | "center" | "left" | "alternating" | "wave" | "hops" | "chain" | "handoff" | "breadcrumb" | "fold" | "signal";
  };
}

// 4 Specific Sequence Layout Definitions
export const sequenceLayouts: SequenceLayout[] = [
  // Style 1: Horizontal Top Process (from image 1)
  {
    id: "sequence-style-1",
    name: "Process Flow",
    description: "Horizontal sequence with connecting line at the top",
    category: "sequence",
    minItems: 2,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: {
      orientation: "horizontal",
      style: "top",
    },
  },

  // Style 2: Horizontal Timeline (from image 2)
  {
    id: "sequence-style-2",
    name: "Timeline",
    description: "Horizontal timeline with centered nodes",
    category: "sequence",
    minItems: 2,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: {
      orientation: "horizontal",
      style: "center",
    },
  },

  // Style 3: Vertical List (from image 3)
  {
    id: "sequence-style-3",
    name: "Vertical Steps",
    description: "Vertical sequence list with line on the left",
    category: "sequence",
    minItems: 2,
    maxItems: 8,
    idealItems: 5,
    adaptive: true,
    supportsIcons: true,
    preview: {
      orientation: "vertical",
      style: "left",
    },
  },

  // Style 4: Vertical Alternating (from image 4)
  {
    id: "sequence-style-4",
    name: "Vertical Journey",
    description: "Vertical timeline with alternating content",
    category: "sequence",
    minItems: 2,
    maxItems: 8,
    idealItems: 5,
    adaptive: true,
    supportsIcons: true,
    preview: {
      orientation: "vertical",
      style: "alternating",
    },
  },

  // Style 5: Wave Flow — nodes at alternating heights on a flowing polyline
  {
    id: "sequence-style-5",
    name: "Wave Flow",
    description: "Numbered nodes riding a flowing wave connector",
    category: "sequence",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "wave" },
  },

  // Style 6: Hop Arcs — dotted arcs hopping node to node
  {
    id: "sequence-style-6",
    name: "Hop Arcs",
    description: "Dotted arcs hopping from node to node with arrowheads",
    category: "sequence",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "hops" },
  },

  // Style 7: Paper Chain — cards joined by interlocked rings
  {
    id: "sequence-style-7",
    name: "Paper Chain",
    description: "Cards joined by interlocked chain-link rings",
    category: "sequence",
    minItems: 3,
    maxItems: 4,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "chain" },
  },

  // Style 8: Handoff Lanes — indented bars passing the baton downward
  {
    id: "sequence-style-8",
    name: "Handoff Lanes",
    description: "Indented bars passing the baton with corner connectors",
    category: "sequence",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "vertical", style: "handoff" },
  },

  // Style 9: Breadcrumb Trail — chips flowing with › separators
  {
    id: "sequence-style-9",
    name: "Breadcrumb Trail",
    description: "Soft chips flowing left to right with accent separators",
    category: "sequence",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "breadcrumb" },
  },

  // Style 10: Fold Ribbon — a folded ribbon strip of alternating facets
  {
    id: "sequence-style-10",
    name: "Fold Ribbon",
    description: "A folded ribbon strip whose facets alternate light and dark",
    category: "sequence",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "fold" },
  },

  // Style 11: Signal Path — dashed line with amplifier nodes
  {
    id: "sequence-style-11",
    name: "Signal Path",
    description: "A dashed signal line through amplifier nodes, mono numbering",
    category: "sequence",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    supportsIcons: true,
    preview: { orientation: "horizontal", style: "signal" },
  },
];

// Get sequence layout by ID
export function getSequenceLayoutById(id: SequenceLayoutType): SequenceLayout | undefined {
  return sequenceLayouts.find((layout) => layout.id === id);
}

// Get all sequence layouts
export function getAllSequenceLayouts(): SequenceLayout[] {
  return sequenceLayouts;
}

// Get recommended layout based on content count and available space
export function getRecommendedSequenceLayout(
  itemCount: number,
  isNarrowSpace: boolean = false
): SequenceLayout {
  // If narrow space (e.g., image on side), prefer vertical layouts
  if (isNarrowSpace) {
    return sequenceLayouts[2]!; // Vertical Steps
  }
  // Otherwise default to Horizontal Process
  return sequenceLayouts[0]!;
}

// Helper to determine orientation based on layout ID and space
export function getSequenceOrientation(
  layoutId: SequenceLayoutType,
  isNarrowSpace: boolean
): "horizontal" | "vertical" {
  // If forced narrow space, vertical layouts might be preferred or required
  // But strictly following the ID:
  if (layoutId === "sequence-style-1" || layoutId === "sequence-style-2") {
    return isNarrowSpace ? "vertical" : "horizontal"; // Adapt horizontal to vertical in narrow spaces?
  }
  return "vertical";
}

// Base styles helper for sequence components
export function getBaseSequenceStyles(theme: Theme) {
  return {
    lineColor: theme.colors.accent,
    dotColor: theme.colors.accent,
    textColor: theme.colors.text,
    dimColor: theme.colors.textMuted,
    backgroundColor: "transparent", // Sequences usually sit on slide bg
  };
}


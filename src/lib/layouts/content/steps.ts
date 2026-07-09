// Steps Layout Definitions
// 4 specific step-by-step process flow styles

import type { Theme } from "~/lib/themes";

// Content item structure for steps layouts
export interface StepContentItem {
  label?: string; // Title/heading
  text: string; // Description
}

// Steps layout type identifier
export type StepsLayoutType =
  | "steps-pyramid" // Inverted pyramid with numbers, content on right
  | "steps-arrows" // Vertical arrows pointing down between steps
  | "steps-cards" // Simple cards in horizontal row with left accent
  | "steps-bars" // Horizontal bars with step numbers on left
  | "steps-ladder" // Cards on stair blocks rising step by step
  | "steps-circuit" // Right-angle circuit traces between alternating cards
  | "steps-pipeline" // Segmented chevron pipeline with cards below
  | "steps-blueprint" // Dashed technical-drawing cards with corner marks
  | "steps-stairline" // A staircase line climbing tread by tread
  | "steps-hexchain" // Hexagon nodes linked in a chain with cards below
  | "steps-dotmeter" // Dot meters filling up step by step above each card
  | "steps-brackets"; // Editorial bracket-framed steps with mono numbering

// Steps layout definition interface
export interface StepsLayout {
  id: StepsLayoutType;
  name: string;
  description: string;
  category: "steps";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  // Preview configuration
  preview: {
    style: "pyramid" | "arrows" | "cards" | "bars" | "ladder" | "circuit" | "pipeline" | "blueprint" | "stairline" | "hexchain" | "dotmeter" | "brackets";
    orientation: "vertical" | "horizontal";
    hasNumbers: boolean;
  };
}

// 4 Specific Steps Layout Definitions
export const stepsLayouts: StepsLayout[] = [
  // Style 1: Pyramid with numbers (from image 1)
  {
    id: "steps-pyramid",
    name: "Pyramid Steps",
    description: "Inverted pyramid with numbered steps expanding downward",
    category: "steps",
    minItems: 2,
    maxItems: 5,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "pyramid",
      orientation: "vertical",
      hasNumbers: true,
    },
  },

  // Style 2: Arrow flow (from image 2)
  {
    id: "steps-arrows",
    name: "Arrow Flow",
    description: "Vertical flow with arrows pointing down between steps",
    category: "steps",
    minItems: 2,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "arrows",
      orientation: "vertical",
      hasNumbers: false,
    },
  },

  // Style 3: Cards row (from image 3)
  {
    id: "steps-cards",
    name: "Step Cards",
    description: "Simple cards in a row with left border accent",
    category: "steps",
    minItems: 2,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "cards",
      orientation: "horizontal",
      hasNumbers: false,
    },
  },

  // Style 4: Numbered bars (from image 4)
  {
    id: "steps-bars",
    name: "Numbered Bars",
    description: "Horizontal bars with step numbers on the left side",
    category: "steps",
    minItems: 2,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "bars",
      orientation: "vertical",
      hasNumbers: true,
    },
  },

  // Style 5: Ascending ladder — cards on stair blocks rising step by step
  {
    id: "steps-ladder",
    name: "Ascending Ladder",
    description: "Cards standing on stair blocks that rise step by step",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "ladder",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 6: Circuit path — right-angle traces between alternating cards
  {
    id: "steps-circuit",
    name: "Circuit Path",
    description: "Right-angle circuit traces connecting alternating step cards",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "circuit",
      orientation: "vertical",
      hasNumbers: true,
    },
  },

  // Style 7: Pipeline segments — one segmented chevron bar with cards below
  {
    id: "steps-pipeline",
    name: "Pipeline Segments",
    description: "A segmented chevron pipeline with description cards below",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "pipeline",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 8: Blueprint steps — dashed technical-drawing cards with corner marks
  {
    id: "steps-blueprint",
    name: "Blueprint Steps",
    description: "Dashed technical-drawing cards with corner marks and mono step tags",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "blueprint",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 9: Staircase line — a step-function line climbing tread by tread
  {
    id: "steps-stairline",
    name: "Staircase Line",
    description: "A staircase line climbing tread by tread with numbered landings",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "stairline",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 10: Hex chain — hexagon nodes linked in a chain
  {
    id: "steps-hexchain",
    name: "Hex Chain",
    description: "Hexagon nodes linked in a chain with description cards below",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "hexchain",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 11: Dot meter — progress dots filling step by step
  {
    id: "steps-dotmeter",
    name: "Dot Meter",
    description: "Progress dots that fill step by step above each card",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "dotmeter",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },

  // Style 12: Bracket steps — editorial brackets with mono numbering
  {
    id: "steps-brackets",
    name: "Bracket Steps",
    description: "Editorial bracket-framed steps with oversized mono numbering",
    category: "steps",
    minItems: 3,
    maxItems: 5,
    idealItems: 4,
    adaptive: true,
    preview: {
      style: "brackets",
      orientation: "horizontal",
      hasNumbers: true,
    },
  },
];

// Get steps layout by ID
export function getStepsLayoutById(id: StepsLayoutType): StepsLayout | undefined {
  return stepsLayouts.find((layout) => layout.id === id);
}

// Get all steps layouts
export function getAllStepsLayouts(): StepsLayout[] {
  return stepsLayouts;
}

// Get recommended layout based on content count
export function getRecommendedStepsLayout(itemCount: number): StepsLayout {
  if (itemCount <= 3) return stepsLayouts[0]!; // Pyramid
  return stepsLayouts[3]!; // Bars for more items
}

// Base styles helper
export function getBaseStepsStyles(theme: Theme) {
  const cardBox = theme.cardBox;
  return {
    bgColor: cardBox?.background || `${theme.colors.surface}80`,
    borderColor: cardBox?.borderColor || theme.colors.border,
    accentColor: cardBox?.accentColor || theme.colors.accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    numberColor: cardBox?.titleColor || theme.colors.heading,
  };
}

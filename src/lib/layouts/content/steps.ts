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
  | "steps-bars"; // Horizontal bars with step numbers on left

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
    style: "pyramid" | "arrows" | "cards" | "bars";
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

// Content validation utilities for layout constraints
// Ensures AI-generated content meets word count and item limits

import type { ContentLayoutType } from "~/components/presentation/types";
import { CIRCLE_CONSTRAINTS } from "./circles";
import { CASCADING_CONSTRAINTS } from "./cascading";
import { CHEVRON_CONSTRAINTS } from "./chevron";
import { FUNNEL_CONSTRAINTS } from "./funnel";
import { PROSCONS_CONSTRAINTS } from "./proscons";
import { COMPARISON_CONSTRAINTS } from "./comparison";
import { BEFOREAFTER_CONSTRAINTS } from "./beforeafter";

// Word counting utility
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Remove extra whitespace and split by spaces
  return text.trim().split(/\s+/).length;
}

// Truncate text to max word count
export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

// Get constraints for a specific layout
export function getLayoutConstraints(layoutId: ContentLayoutType) {
  if (layoutId.startsWith("circle-")) return CIRCLE_CONSTRAINTS;
  if (layoutId.startsWith("cascading-")) return CASCADING_CONSTRAINTS;
  if (layoutId.startsWith("chevron-")) return CHEVRON_CONSTRAINTS;
  if (layoutId.startsWith("funnel-")) return FUNNEL_CONSTRAINTS;
  if (layoutId.startsWith("proscons-")) return PROSCONS_CONSTRAINTS;
  if (layoutId.startsWith("comparison-")) return COMPARISON_CONSTRAINTS;
  if (layoutId.startsWith("beforeafter-")) return BEFOREAFTER_CONSTRAINTS;
  
  // Default constraints for other layouts
  return {
    maxPoints: 8,
    maxLabelWords: 10,
    maxDescriptionWords: 30,
  };
}

// Validate a single content item
export interface ContentItem {
  label?: string;
  text: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateContentItem(
  item: ContentItem,
  layoutId: ContentLayoutType,
  itemIndex: number
): ValidationResult {
  const constraints = getLayoutConstraints(layoutId);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate label word count
  if (item.label) {
    const labelWords = countWords(item.label);
    if (labelWords > constraints.maxLabelWords) {
      errors.push(
        `Item ${itemIndex + 1} label exceeds ${constraints.maxLabelWords} words (has ${labelWords})`
      );
    }
  }

  // Validate description word count
  if (item.text) {
    const textWords = countWords(item.text);
    if (constraints.maxDescriptionWords > 0 && textWords > constraints.maxDescriptionWords) {
      errors.push(
        `Item ${itemIndex + 1} description exceeds ${constraints.maxDescriptionWords} words (has ${textWords})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate all content items for a layout
export function validateContentItems(
  items: ContentItem[],
  layoutId: ContentLayoutType
): ValidationResult {
  const constraints = getLayoutConstraints(layoutId);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check item count
  if (items.length > constraints.maxPoints) {
    errors.push(
      `Too many items: ${items.length} (max ${constraints.maxPoints} for ${layoutId})`
    );
  }

  // Validate each item
  items.forEach((item, index) => {
    const itemValidation = validateContentItem(item, layoutId, index);
    errors.push(...itemValidation.errors);
    warnings.push(...itemValidation.warnings);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Auto-fix content to meet constraints
export function fixContentItems(
  items: ContentItem[],
  layoutId: ContentLayoutType
): ContentItem[] {
  const constraints = getLayoutConstraints(layoutId);
  
  // Truncate to max items
  const fixedItems = items.slice(0, constraints.maxPoints);
  
  // Fix each item
  return fixedItems.map((item) => ({
    label: item.label
      ? truncateToWords(item.label, constraints.maxLabelWords)
      : item.label,
    text:
      constraints.maxDescriptionWords > 0
        ? truncateToWords(item.text, constraints.maxDescriptionWords)
        : item.text,
  }));
}

// Generate AI prompt instructions for a specific layout
export function getAIPromptInstructions(layoutId: ContentLayoutType): string {
  const constraints = getLayoutConstraints(layoutId);
  
  let instructions = `STRICT CONTENT LIMITS for ${layoutId}:\n`;
  instructions += `- Maximum ${constraints.maxPoints} items total\n`;
  instructions += `- Labels: Maximum ${constraints.maxLabelWords} words each\n`;
  
  if (constraints.maxDescriptionWords > 0) {
    instructions += `- Descriptions: Maximum ${constraints.maxDescriptionWords} words each\n`;
  } else {
    instructions += `- Descriptions: Not used in this layout\n`;
  }
  
  instructions += `\nIMPORTANT: Stop generating immediately when you reach ${constraints.maxPoints} items. Do not generate extra items.`;
  
  return instructions;
}

// Get layout-specific constraints summary
export function getConstraintsSummary(layoutId: ContentLayoutType): string {
  const constraints = getLayoutConstraints(layoutId);
  
  return `Max ${constraints.maxPoints} items | Labels: ${constraints.maxLabelWords}w | Descriptions: ${constraints.maxDescriptionWords > 0 ? `${constraints.maxDescriptionWords}w` : "N/A"}`;
}

// Export all constraints for reference
export const ALL_LAYOUT_CONSTRAINTS = {
  circle: CIRCLE_CONSTRAINTS,
  cascading: CASCADING_CONSTRAINTS,
  chevron: CHEVRON_CONSTRAINTS,
  funnel: FUNNEL_CONSTRAINTS,
  proscons: PROSCONS_CONSTRAINTS,
  comparison: COMPARISON_CONSTRAINTS,
  beforeafter: BEFOREAFTER_CONSTRAINTS,
} as const;

// Quotes Layout Definitions
// 2 specific quote/testimonial display styles

import type { Theme } from "~/lib/themes";

// Content item structure for quotes layouts
export interface QuoteContentItem {
  label?: string; // Title/heading
  text: string; // Quote text or description
  author?: string; // Optional author name
}

// Quotes layout type identifier
export type QuotesLayoutType =
  | "quote-bubble" // Speech bubble style cards with tails
  | "quote-marks"; // Cards with quotation marks at corners

// Quotes layout definition interface
export interface QuotesLayout {
  id: QuotesLayoutType;
  name: string;
  description: string;
  category: "quotes";
  minItems: number;
  maxItems: number;
  idealItems: number;
  adaptive: true;
  preview: {
    style: "bubble" | "marks";
    hasQuotationMarks: boolean;
  };
}

// 2 Specific Quotes Layout Definitions
export const quotesLayouts: QuotesLayout[] = [
  // Style 1: Thought Bubble - Speech bubble cards with tails
  {
    id: "quote-bubble",
    name: "Thought Bubble",
    description: "Speech bubble style cards with directional tails",
    category: "quotes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "bubble",
      hasQuotationMarks: false,
    },
  },

  // Style 2: Quote Marks - Cards with quotation marks at corners
  {
    id: "quote-marks",
    name: "Quote Cards",
    description: "Elegant cards with quotation marks at corners",
    category: "quotes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: {
      style: "marks",
      hasQuotationMarks: true,
    },
  },
];

// Get quotes layout by ID
export function getQuotesLayoutById(id: QuotesLayoutType): QuotesLayout | undefined {
  return quotesLayouts.find((layout) => layout.id === id);
}

// Get all quotes layouts
export function getAllQuotesLayouts(): QuotesLayout[] {
  return quotesLayouts;
}

// Get recommended layout based on content count
export function getRecommendedQuotesLayout(itemCount: number): QuotesLayout {
  if (itemCount <= 3) return quotesLayouts[0]!; // Bubble
  return quotesLayouts[1]!; // Marks for more items
}

// Base styles helper
export function getBaseQuotesStyles(theme: Theme) {
  const cardBox = theme.cardBox;
  return {
    bgColor: cardBox?.background || `${theme.colors.surface}80`,
    borderColor: cardBox?.borderColor || theme.colors.border,
    accentColor: cardBox?.accentColor || theme.colors.accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

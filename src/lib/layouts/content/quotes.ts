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
// quote-bubble: speech-bubble cards with directional tails
// quote-marks: cards with quotation marks at the corners
// quote-style-3: Big Quote — one hero centered pull-quote with a giant mark
// quote-style-4: Author Card — quote card with an avatar chip and author footer
// quote-style-5: Side Portrait — avatar circle left, quote right, author beneath
// quote-style-6: Minimal Line — chromeless quote with an accent left rule
// quote-style-7: Rating Card — star row above the quote with author
// quote-style-8: Gradient Quote — accent-gradient card, white text, big mark
// quote-style-9: Ghost Mark — a huge ghost quotation mark behind the quote
// quote-style-10: Speech Rows — alternating speech-bubble rows with avatar chips
// quote-style-11: Editorial Pull — oversized pull-quote with hairline rules
// quote-style-12: Compact Grid — tighter testimonial cards with mark and author
export type QuotesLayoutType =
  | "quote-bubble"
  | "quote-marks"
  | "quote-style-3"
  | "quote-style-4"
  | "quote-style-5"
  | "quote-style-6"
  | "quote-style-7"
  | "quote-style-8"
  | "quote-style-9"
  | "quote-style-10"
  | "quote-style-11"
  | "quote-style-12";

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
    style:
      | "bubble"
      | "marks"
      | "big"
      | "author"
      | "portrait"
      | "minimal"
      | "rating"
      | "gradient"
      | "ghost"
      | "speech"
      | "editorial"
      | "compact";
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
  {
    id: "quote-style-3",
    name: "Big Quote",
    description: "One hero centered pull-quote with a giant opening mark",
    category: "quotes",
    minItems: 1,
    maxItems: 1,
    idealItems: 1,
    adaptive: true,
    preview: { style: "big", hasQuotationMarks: true },
  },
  {
    id: "quote-style-4",
    name: "Author Card",
    description: "Quote card with an avatar chip and an author footer",
    category: "quotes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: { style: "author", hasQuotationMarks: true },
  },
  {
    id: "quote-style-5",
    name: "Side Portrait",
    description: "Avatar circle on the left, quote on the right, author beneath",
    category: "quotes",
    minItems: 1,
    maxItems: 4,
    idealItems: 2,
    adaptive: true,
    preview: { style: "portrait", hasQuotationMarks: false },
  },
  {
    id: "quote-style-6",
    name: "Minimal Line",
    description: "Chromeless italic quote with an accent left rule",
    category: "quotes",
    minItems: 1,
    maxItems: 4,
    idealItems: 3,
    adaptive: true,
    preview: { style: "minimal", hasQuotationMarks: false },
  },
  {
    id: "quote-style-7",
    name: "Rating Card",
    description: "A five-star row above the quote with the author",
    category: "quotes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: { style: "rating", hasQuotationMarks: false },
  },
  {
    id: "quote-style-8",
    name: "Gradient Quote",
    description: "Accent-gradient card with white text and a big mark",
    category: "quotes",
    minItems: 1,
    maxItems: 6,
    idealItems: 3,
    adaptive: true,
    preview: { style: "gradient", hasQuotationMarks: true },
  },
  {
    id: "quote-style-9",
    name: "Ghost Mark",
    description: "A huge ghost quotation mark behind the quote text",
    category: "quotes",
    minItems: 1,
    maxItems: 4,
    idealItems: 2,
    adaptive: true,
    preview: { style: "ghost", hasQuotationMarks: true },
  },
  {
    id: "quote-style-10",
    name: "Speech Rows",
    description: "Alternating speech-bubble rows with avatar chips",
    category: "quotes",
    minItems: 2,
    maxItems: 5,
    idealItems: 3,
    adaptive: true,
    preview: { style: "speech", hasQuotationMarks: false },
  },
  {
    id: "quote-style-11",
    name: "Editorial Pull",
    description: "An oversized pull-quote framed by hairline rules",
    category: "quotes",
    minItems: 1,
    maxItems: 1,
    idealItems: 1,
    adaptive: true,
    preview: { style: "editorial", hasQuotationMarks: false },
  },
  {
    id: "quote-style-12",
    name: "Compact Grid",
    description: "Tighter testimonial cards with a mark and author",
    category: "quotes",
    minItems: 3,
    maxItems: 6,
    idealItems: 4,
    adaptive: true,
    preview: { style: "compact", hasQuotationMarks: true },
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

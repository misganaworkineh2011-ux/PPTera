/**
 * Shared types for presentation generation utilities
 */

import type { Slide, VisualStrategy, SlideAssets, SlideChart } from "~/lib/dashboard/hooks/useOutlineStream";

// Re-export for convenience
export type { Slide, VisualStrategy, SlideAssets, SlideChart };

// Transformed content for presentation slides
export interface TransformedBulletItem {
  label?: string; // Optional concept label (e.g., "Efficiency", "Step 1")
  text: string; // The actual content/explanation
}

export interface TransformedContent {
  intro?: string; // Optional intro paragraph (1-2 sentences)
  items: TransformedBulletItem[];
}

// Chart data structure for CSS-based rendering
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  type: string; // bar, line, pie, stacked, comparison, table, area, scatter, histogram, waterfall
  data: ChartDataPoint[];
  labels: string[];
  title?: string;
  config: {
    showLegend?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
    maxValue?: number;
    unit?: string;
  };
  css: string; // CSS classes for styling
}

// Icon placeholder structure
export interface IconPlaceholder {
  name: string; // semantic name (e.g., "efficiency", "growth", "security")
  placeholder: string; // placeholder text or symbol
  category?: string; // optional category hint
}

// Image generation result
export interface ImageResult {
  url: string;
  alt: string;
  source: "gemini" | "pexels" | "placeholder" | "none";
  photographer?: string;
  photographerUrl?: string;
  error?: string;
}

// Complete presentation slide with all transformations
export interface PresentationSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  // Original bullet points (preserved)
  bulletPoints?: string[];
  // Transformed content
  transformedContent?: TransformedContent;
  // Visual assets
  chart?: ChartData | null;
  icons?: IconPlaceholder[];
  image?: {
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: "pexels" | "ai" | "upload" | "placeholder" | "none";
  } | null;
  // Layout determined from visualStrategy
  layout?: string;
  // Content layout for box/card arrangements
  contentLayout?: string;
  // Original visual metadata (preserved for reference)
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
}

// Layout mapping from visual strategy patterns
export const LAYOUT_MAP: Record<string, string> = {
  // From visualStrategy.pattern to layout type
  "spotlight": "content-centered",
  "flow": "content-sequential",
  "cards": "content-grid",
  "split": "content-two-column",
  "timeline": "content-timeline",
  "pyramid": "content-hierarchy",
  "grid": "content-grid",
  "stairs": "content-sequential",
  "comparison": "content-two-column",
  // Default fallbacks
  "default": "content-with-bullets",
};

/**
 * Get layout type from visual strategy pattern
 */
export function getLayoutFromStrategy(pattern?: string): string {
  if (!pattern) return LAYOUT_MAP.default;
  const normalized = pattern.toLowerCase().trim();
  return LAYOUT_MAP[normalized] || LAYOUT_MAP.default;
}


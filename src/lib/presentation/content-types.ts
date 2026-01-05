/**
 * Content Types - Type definitions and mappings for layout selection
 * 
 * Defines content type enums and provides mapping to layout categories
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";

export type ContentType =
  | "TIMELINE"
  | "PROCESS"
  | "FEATURES"
  | "STATISTICS"
  | "HOW_TO"
  | "COMPARISON"
  | "TESTIMONIAL"
  | "CATEGORIES"
  | "STEPS"
  | "CYCLE"
  | "GENERIC";

/**
 * Map content type to layout category
 */
export function contentTypeToCategory(contentType: ContentType): ContentLayoutCategory {
  const mapping: Record<ContentType, ContentLayoutCategory> = {
    TIMELINE: "sequence",
    PROCESS: "sequence",
    FEATURES: "boxes",
    STATISTICS: "numbers",
    HOW_TO: "steps",
    COMPARISON: "boxes", // Comparisons often use boxes for side-by-side
    TESTIMONIAL: "quotes",
    CATEGORIES: "boxes",
    STEPS: "steps",
    CYCLE: "circles",
    GENERIC: "boxes", // Default fallback
  };

  return mapping[contentType] || "boxes";
}

/**
 * Get confidence level for content type detection
 */
export function getContentTypeConfidence(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 70) return "high";
  if (confidence >= 40) return "medium";
  return "low";
}

/**
 * Check if content type is suitable for a specific layout category
 */
export function isContentTypeSuitable(
  contentType: ContentType,
  category: ContentLayoutCategory
): boolean {
  const preferredCategory = contentTypeToCategory(contentType);
  
  // Direct match
  if (preferredCategory === category) return true;
  
  // Some types can work with multiple categories
  const flexibleTypes: Record<ContentType, ContentLayoutCategory[]> = {
    TIMELINE: ["sequence", "steps"],
    PROCESS: ["sequence", "steps"],
    FEATURES: ["boxes", "bullets"],
    STATISTICS: ["numbers", "boxes"],
    HOW_TO: ["steps", "sequence"],
    COMPARISON: ["boxes", "bullets"],
    TESTIMONIAL: ["quotes"],
    CATEGORIES: ["boxes", "bullets"],
    STEPS: ["steps", "sequence"],
    CYCLE: ["circles", "sequence"],
    GENERIC: ["boxes", "bullets"], // Generic can work with many
  };

  return flexibleTypes[contentType]?.includes(category) || false;
}


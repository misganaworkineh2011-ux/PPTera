/**
 * Context Tracker for Smart Layout Selection
 * 
 * Tracks presentation flow and maintains variety by monitoring:
 * - Previous slide layouts (last 3)
 * - Slide position (first, middle, last)
 * - Category and style usage statistics
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { LayoutSelectionContext } from "../types";

/**
 * Create a new layout selection context
 * 
 * @param slideIndex - Current slide index (0-based)
 * @param totalSlides - Total number of slides in presentation
 * @param options - Optional context configuration
 * @returns Initialized context object
 */
export function createLayoutSelectionContext(
  slideIndex: number,
  totalSlides: number,
  options?: {
    presentationTone?: string;
    presentationLanguage?: string;
    themeStyle?: "minimal" | "professional" | "creative";
  }
): LayoutSelectionContext {
  return {
    slideIndex,
    totalSlides,
    previousLayouts: [],
    presentationTone: options?.presentationTone,
    presentationLanguage: options?.presentationLanguage,
    themeStyle: options?.themeStyle,
    categoryUsage: new Map<ContentLayoutCategory, number>(),
    styleUsage: new Map<string, number>(),
  };
}

/**
 * Track a layout selection and update context
 * 
 * Updates:
 * - Adds to previousLayouts (maintains last 3)
 * - Increments category usage count
 * - Increments style usage count
 * 
 * @param context - Current context to update
 * @param slideIndex - Index of slide that was just processed
 * @param category - Selected layout category
 * @param style - Selected layout style
 * 
 * Requirements: 5.1
 */
export function trackLayoutUsage(
  context: LayoutSelectionContext,
  slideIndex: number,
  category: ContentLayoutCategory,
  style: string
): void {
  // Add to previous layouts (keep last 3)
  context.previousLayouts.push({
    slideIndex,
    category,
    style,
  });
  
  // Keep only last 3 layouts
  if (context.previousLayouts.length > 3) {
    context.previousLayouts.shift();
  }
  
  // Update category usage statistics
  const currentCategoryCount = context.categoryUsage.get(category) || 0;
  context.categoryUsage.set(category, currentCategoryCount + 1);
  
  // Update style usage statistics
  const currentStyleCount = context.styleUsage.get(style) || 0;
  context.styleUsage.set(style, currentStyleCount + 1);
}

/**
 * Get slide position classification
 * 
 * Classifies slide as:
 * - "first": slideIndex === 0
 * - "last": slideIndex === totalSlides - 1
 * - "middle": everything else
 * 
 * @param slideIndex - Current slide index (0-based)
 * @param totalSlides - Total number of slides
 * @returns Position classification
 * 
 * Requirements: 5.4, 5.5, 5.6
 */
export function getSlidePosition(
  slideIndex: number,
  totalSlides: number
): "first" | "middle" | "last" {
  if (slideIndex === 0) {
    return "first";
  }
  
  if (slideIndex === totalSlides - 1) {
    return "last";
  }
  
  return "middle";
}

/**
 * Calculate repetition penalty for a layout category
 * 
 * Checks previous layouts and applies penalties:
 * - 2 consecutive same category: -5 points
 * - 3 consecutive same category: -15 points
 * 
 * @param category - Layout category to check
 * @param previousLayouts - Array of previous layout selections
 * @returns Penalty points (negative number or 0)
 * 
 * Requirements: 5.2, 5.3
 */
export function calculateRepetitionPenalty(
  category: ContentLayoutCategory,
  previousLayouts: Array<{ slideIndex: number; category: ContentLayoutCategory; style: string }>
): number {
  if (previousLayouts.length === 0) {
    return 0;
  }
  
  // Count consecutive occurrences of this category at the end of previousLayouts
  let consecutiveCount = 0;
  
  for (let i = previousLayouts.length - 1; i >= 0; i--) {
    if (previousLayouts[i].category === category) {
      consecutiveCount++;
    } else {
      break;
    }
  }
  
  // Apply penalties based on consecutive count
  if (consecutiveCount >= 3) {
    return -15; // 3 consecutive same category
  } else if (consecutiveCount >= 2) {
    return -5; // 2 consecutive same category
  }
  
  return 0; // No penalty
}

/**
 * Get the most recently used layouts
 * 
 * @param context - Current context
 * @param count - Number of recent layouts to retrieve (default: 3)
 * @returns Array of recent layout categories
 */
export function getRecentLayouts(
  context: LayoutSelectionContext,
  count: number = 3
): ContentLayoutCategory[] {
  return context.previousLayouts
    .slice(-count)
    .map(layout => layout.category);
}

/**
 * Check if a category was used recently
 * 
 * @param category - Category to check
 * @param context - Current context
 * @param withinLast - Number of recent slides to check (default: 3)
 * @returns True if category was used within the specified range
 */
export function wasUsedRecently(
  category: ContentLayoutCategory,
  context: LayoutSelectionContext,
  withinLast: number = 3
): boolean {
  const recentLayouts = context.previousLayouts.slice(-withinLast);
  return recentLayouts.some(layout => layout.category === category);
}

/**
 * Get usage count for a category
 * 
 * @param category - Category to check
 * @param context - Current context
 * @returns Number of times this category has been used
 */
export function getCategoryUsageCount(
  category: ContentLayoutCategory,
  context: LayoutSelectionContext
): number {
  return context.categoryUsage.get(category) || 0;
}

/**
 * Get usage count for a style
 * 
 * @param style - Style to check
 * @param context - Current context
 * @returns Number of times this style has been used
 */
export function getStyleUsageCount(
  style: string,
  context: LayoutSelectionContext
): number {
  return context.styleUsage.get(style) || 0;
}

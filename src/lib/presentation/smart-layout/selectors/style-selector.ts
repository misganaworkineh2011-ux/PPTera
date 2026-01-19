/**
 * Style Selector for Smart Layout Selection
 * 
 * Chooses specific style within selected layout category based on:
 * - Content structure (bullet count)
 * - Space constraints
 * - Style variety optimization
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { 
  ContentAnalysis, 
  LayoutStyleDefinition, 
  LayoutSelectionContext 
} from "../types";
import { getLayoutStyles } from "../registry/layout-registry";

/**
 * Select the best style within a layout category
 * 
 * Matches style to content structure, applies space constraints,
 * and optimizes for variety.
 * 
 * @param category - Selected layout category
 * @param analysis - Content analysis results
 * @param isNarrowSpace - Whether the slide has narrow space constraints
 * @param context - Layout selection context for variety optimization
 * @returns Selected style ID
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export function selectStyle(
  category: ContentLayoutCategory,
  analysis: ContentAnalysis,
  isNarrowSpace: boolean,
  context?: LayoutSelectionContext
): string {
  // Get all available styles for this category
  const availableStyles = getLayoutStyles(category);
  
  if (availableStyles.length === 0) {
    // Fallback to default style naming
    return `${category}-style-1`;
  }
  
  // Filter by space constraints
  const spaceFilteredStyles = applySpaceConstraints(availableStyles, isNarrowSpace);
  
  if (spaceFilteredStyles.length === 0) {
    // If no styles match space constraints, use first available
    return availableStyles[0].id;
  }
  
  // Match styles to content structure
  const structureMatchedStyles = matchStyleToStructure(
    spaceFilteredStyles,
    analysis.bulletCount
  );
  
  if (structureMatchedStyles.length === 0) {
    // If no styles match structure, use first space-filtered style
    return spaceFilteredStyles[0].id;
  }
  
  // Optimize for variety if context is provided
  if (context) {
    const varietyOptimizedStyle = optimizeStyleVariety(
      structureMatchedStyles,
      context
    );
    
    if (varietyOptimizedStyle) {
      return varietyOptimizedStyle.id;
    }
  }
  
  // Return first matched style
  return structureMatchedStyles[0].id;
}

/**
 * Match styles to content structure based on bullet count
 * 
 * Matching rules:
 * - 2 items → 2-column style
 * - 3 items → 3-column or triangle style
 * - 4 items → 2x2 grid or 4-column style
 * - 5+ items → grid or list style
 * 
 * @param styles - Available styles to match
 * @param bulletCount - Number of bullet points
 * @returns Styles that match the content structure
 * 
 * Requirements: 6.2, 6.3
 */
export function matchStyleToStructure(
  styles: LayoutStyleDefinition[],
  bulletCount: number
): LayoutStyleDefinition[] {
  // Score each style based on how well it matches the bullet count
  const scoredStyles = styles.map(style => {
    let score = 0;
    
    // Check if bullet count is within the style's range
    if (style.bulletCountRange) {
      const { min, max } = style.bulletCountRange;
      if (bulletCount >= min && bulletCount <= max) {
        score += 10; // Within range
        
        // Bonus if it's the ideal count
        if (style.idealBulletCount && bulletCount === style.idealBulletCount) {
          score += 5;
        }
      }
    }
    
    // Check if bullet count matches ideal count
    if (style.idealBulletCount) {
      if (bulletCount === style.idealBulletCount) {
        score += 15; // Perfect match
      } else {
        // Penalize based on distance from ideal
        const distance = Math.abs(bulletCount - style.idealBulletCount);
        score -= distance * 2;
      }
    }
    
    return { style, score };
  });
  
  // Filter to styles with positive scores
  const matchedStyles = scoredStyles
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ style }) => style);
  
  // If no styles have positive scores, return all styles
  // (let caller decide fallback)
  return matchedStyles.length > 0 ? matchedStyles : styles;
}

/**
 * Apply space constraints to filter styles
 * 
 * Rules:
 * - Narrow space → vertical stack styles (narrow-compatible)
 * - Full width → horizontal grid styles (can be either)
 * 
 * @param styles - Available styles
 * @param isNarrowSpace - Whether space is narrow
 * @returns Filtered styles that match space constraints
 * 
 * Requirements: 6.4
 */
export function applySpaceConstraints(
  styles: LayoutStyleDefinition[],
  isNarrowSpace: boolean
): LayoutStyleDefinition[] {
  if (isNarrowSpace) {
    // For narrow spaces, only return narrow-compatible styles
    const narrowStyles = styles.filter(
      style => style.spaceRequirement === "narrow-compatible"
    );
    
    // If no narrow-compatible styles, return all (fallback)
    return narrowStyles.length > 0 ? narrowStyles : styles;
  }
  
  // For full width, all styles are acceptable
  return styles;
}

/**
 * Optimize style selection for variety
 * 
 * Prefers unused or less-used styles to avoid repetition.
 * Avoids repeating the same style in consecutive slides.
 * 
 * @param styles - Candidate styles (already filtered by structure and space)
 * @param context - Layout selection context with usage statistics
 * @returns Optimized style, or undefined if no optimization possible
 * 
 * Requirements: 6.5, 6.6
 */
export function optimizeStyleVariety(
  styles: LayoutStyleDefinition[],
  context: LayoutSelectionContext
): LayoutStyleDefinition | undefined {
  if (styles.length === 0) {
    return undefined;
  }
  
  // Get the most recently used style
  const recentStyles = context.previousLayouts
    .slice(-3)
    .map(layout => layout.style);
  
  const lastStyle = recentStyles[recentStyles.length - 1];
  
  // Try to avoid using the same style as the last slide
  if (lastStyle) {
    const differentStyles = styles.filter(style => style.id !== lastStyle);
    
    if (differentStyles.length > 0) {
      // Among different styles, prefer the least used
      return selectLeastUsedStyle(differentStyles, context);
    }
  }
  
  // If we can't avoid the last style, just pick the least used
  return selectLeastUsedStyle(styles, context);
}

/**
 * Select the least used style from a list
 * 
 * @param styles - Candidate styles
 * @param context - Layout selection context with usage statistics
 * @returns The least used style
 */
function selectLeastUsedStyle(
  styles: LayoutStyleDefinition[],
  context: LayoutSelectionContext
): LayoutStyleDefinition {
  // Score styles by usage (lower usage = higher score)
  const scoredStyles = styles.map(style => {
    const usageCount = context.styleUsage.get(style.id) || 0;
    
    // Invert usage count for scoring (less used = higher score)
    const score = 100 - usageCount;
    
    return { style, score };
  });
  
  // Sort by score (highest first) and return the best
  scoredStyles.sort((a, b) => b.score - a.score);
  
  return scoredStyles[0].style;
}

/**
 * Get style by ID from a category
 * 
 * Helper function to retrieve a specific style.
 * 
 * @param category - Layout category
 * @param styleId - Style ID to retrieve
 * @returns The style definition, or undefined if not found
 */
export function getStyleById(
  category: ContentLayoutCategory,
  styleId: string
): LayoutStyleDefinition | undefined {
  const styles = getLayoutStyles(category);
  return styles.find(style => style.id === styleId);
}

/**
 * Get default style for a category
 * 
 * Returns the first style in the category as a fallback.
 * 
 * @param category - Layout category
 * @returns The default style ID
 */
export function getDefaultStyle(category: ContentLayoutCategory): string {
  const styles = getLayoutStyles(category);
  
  if (styles.length === 0) {
    return `${category}-style-1`;
  }
  
  return styles[0].id;
}

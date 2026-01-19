/**
 * Image Compatibility Utilities
 * 
 * Functions for checking image compatibility with layouts and applying
 * score adjustments based on image presence.
 */

import type { LayoutDefinition } from "../types";

/**
 * Image compatibility status
 */
export interface ImageCompatibilityStatus {
  supportsImage: boolean;
  requiresImage: boolean;
  isCompatible: boolean;
  reason?: string;
}

/**
 * Check if a layout is compatible with the image presence in content
 * 
 * @param layout - The layout definition to check
 * @param hasImage - Whether the slide has an image
 * @returns Compatibility status with details
 * 
 * @example
 * ```typescript
 * const status = checkImageCompatibility(boxesLayout, true);
 * if (status.isCompatible) {
 *   // Layout can be used
 * }
 * ```
 */
export function checkImageCompatibility(
  layout: LayoutDefinition,
  hasImage: boolean
): ImageCompatibilityStatus {
  const supportsImage = layout.capacity.supportsImage;
  const requiresImage = layout.capacity.requiresImage ?? false;
  
  // Case 1: Layout requires image but slide has no image
  if (requiresImage && !hasImage) {
    return {
      supportsImage,
      requiresImage,
      isCompatible: false,
      reason: "Layout requires an image but slide has no image",
    };
  }
  
  // Case 2: Slide has image but layout doesn't support images
  if (hasImage && !supportsImage) {
    return {
      supportsImage,
      requiresImage,
      isCompatible: false,
      reason: "Slide has an image but layout does not support images",
    };
  }
  
  // Case 3: Compatible - either both have image support/presence or neither requires it
  return {
    supportsImage,
    requiresImage,
    isCompatible: true,
  };
}

/**
 * Check if a layout is image-focused (primarily for showcasing images)
 * 
 * @param layout - The layout definition to check
 * @returns True if the layout is image-focused
 */
export function isImageFocusedLayout(layout: LayoutDefinition): boolean {
  return layout.category === "images";
}

/**
 * Check if a layout is a hybrid layout (supports both image and substantial text)
 * 
 * @param layout - The layout definition to check
 * @returns True if the layout is a hybrid layout
 */
export function isHybridLayout(layout: LayoutDefinition): boolean {
  // Hybrid layouts support images and can handle substantial text (3+ bullets)
  return (
    layout.capacity.supportsImage &&
    !layout.capacity.requiresImage &&
    layout.capacity.bulletCount.max >= 3
  );
}

/**
 * Check if a layout is icon-friendly (works well with icons)
 * 
 * @param layout - The layout definition to check
 * @returns True if the layout works well with icons
 */
export function isIconFriendlyLayout(layout: LayoutDefinition): boolean {
  // Circles and boxes work particularly well with icons
  return layout.category === "circles" || layout.category === "boxes";
}

/**
 * Determine if content has substantial text (enough to warrant hybrid layout)
 * 
 * @param bulletCount - Number of bullet points
 * @param avgBulletLength - Average length of bullets in words
 * @returns True if content has substantial text
 */
export function hasSubstantialText(
  bulletCount: number,
  avgBulletLength: number
): boolean {
  // Substantial text means either:
  // - 3+ bullets, OR
  // - 2+ bullets with average length > 15 words
  return bulletCount >= 3 || (bulletCount >= 2 && avgBulletLength > 15);
}

/**
 * Apply image-based score adjustments to a layout
 * 
 * This function boosts scores for image-compatible layouts when images are present,
 * and rejects image-required layouts when no images are available.
 * 
 * @param layout - The layout definition
 * @param hasImage - Whether the slide has an image
 * @param bulletCount - Number of bullet points
 * @param avgBulletLength - Average bullet length in words
 * @returns Score adjustment (positive for boost, 0 for no change, -Infinity for rejection)
 * 
 * Requirements:
 * - 7.1: hasImage=true boosts image-compatible layouts
 * - 7.2: hasImage=false rejects image-required layouts
 * - 7.3: Prefer hybrid layouts for image + substantial text
 * 
 * @example
 * ```typescript
 * const adjustment = applyImageScoreAdjustments(layout, true, 4, 12);
 * const finalScore = baseScore + adjustment;
 * ```
 */
export function applyImageScoreAdjustments(
  layout: LayoutDefinition,
  hasImage: boolean,
  bulletCount: number,
  avgBulletLength: number
): number {
  const compatibility = checkImageCompatibility(layout, hasImage);
  
  // Reject incompatible layouts
  if (!compatibility.isCompatible) {
    // Return -Infinity to effectively set score to 0
    return -Infinity;
  }
  
  // No image present - no adjustments needed (but compatible layouts are fine)
  if (!hasImage) {
    return 0;
  }
  
  // Image is present - apply boosts
  let adjustment = 0;
  
  // Check if content has substantial text
  const substantialText = hasSubstantialText(bulletCount, avgBulletLength);
  
  if (isImageFocusedLayout(layout)) {
    // Images category gets +30 points when image is present
    adjustment += 30;
    
    // But reduce boost if there's substantial text (image-focused layouts
    // work best with minimal text)
    if (substantialText) {
      adjustment -= 10; // Net +20 for image-focused with substantial text
    }
  } else if (isHybridLayout(layout)) {
    // Hybrid layouts get +15 points when image is present
    adjustment += 15;
    
    // Extra boost if there's substantial text (hybrid layouts excel here)
    if (substantialText) {
      adjustment += 10; // Net +25 for hybrid with substantial text
    }
  } else if (layout.capacity.supportsImage) {
    // Other image-supporting layouts get +15 points
    adjustment += 15;
  }
  
  return adjustment;
}

/**
 * Apply icon-based score adjustments to a layout
 * 
 * This function boosts scores for icon-friendly layouts when icons are present.
 * 
 * @param layout - The layout definition
 * @param hasIcon - Whether the slide has icons
 * @returns Score adjustment (positive for boost, 0 for no change)
 * 
 * Requirements:
 * - 7.6: hasIcon=true boosts icon-friendly layouts
 * 
 * @example
 * ```typescript
 * const adjustment = applyIconScoreAdjustments(layout, true);
 * const finalScore = baseScore + adjustment;
 * ```
 */
export function applyIconScoreAdjustments(
  layout: LayoutDefinition,
  hasIcon: boolean
): number {
  // No icon present - no adjustments
  if (!hasIcon) {
    return 0;
  }
  
  // Icon is present - apply boosts to icon-friendly layouts
  if (layout.category === "circles") {
    // Circles work exceptionally well with icons
    return 20;
  } else if (layout.category === "boxes") {
    // Boxes also work well with icons
    return 15;
  }
  
  // Other layouts don't get icon-specific boosts
  return 0;
}

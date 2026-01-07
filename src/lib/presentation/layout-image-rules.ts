/**
 * Layout-Image Compatibility Rules
 * 
 * Defines which content layouts are compatible or incompatible with images on slides.
 * Some layouts take up the full slide space and cannot accommodate additional images.
 */

import type { ContentLayoutCategory, ContentLayoutStyle } from "~/lib/layouts/content";

/**
 * Layouts that are INCOMPATIBLE with images (cannot have slide images)
 * These layouts take up the full slide space and adding an image would create visual clutter.
 */
export const IMAGE_INCOMPATIBLE_LAYOUTS: Set<ContentLayoutCategory> = new Set([
  "circles", // Circular arrangements take full space, no room for images
  "quotes",  // Quote layouts are typically full-width/full-height focused
]);

/**
 * Layouts that are CONDITIONALLY incompatible with images
 * Some specific styles within these categories may not work well with images
 */
export const CONDITIONALLY_INCOMPATIBLE_CATEGORIES: Set<ContentLayoutCategory> = new Set([
  "sequence", // Some sequence styles (vertical, alternating) don't work with images
  "steps",    // Some step styles (pyramid, arrows) don't work with images
]);

/**
 * Specific layout styles that are incompatible with images
 * Even if the category allows images, these specific styles don't
 */
export const IMAGE_INCOMPATIBLE_STYLES: Set<ContentLayoutStyle> = new Set([
  // Sequence layouts that are incompatible
  "sequence-style-3", // Vertical Steps - takes full vertical space
  "sequence-style-4", // Vertical Journey - alternating takes full space
  
  // Steps layouts that are incompatible
  "steps-pyramid",     // Pyramid takes full space
  "steps-arrows",      // Vertical arrow flow takes full space
  "steps-bars",        // Numbered bars take full vertical space
]);

/**
 * Layouts that REQUIRE images (should always have images)
 */
export const IMAGE_REQUIRED_LAYOUTS: Set<ContentLayoutCategory> = new Set([
  "images", // Image gallery layouts obviously need images
]);

/**
 * Check if a content layout category is compatible with images
 */
export function isLayoutCategoryCompatibleWithImage(
  category: ContentLayoutCategory,
  hasImage: boolean
): boolean {
  // If no image is requested, all layouts are compatible
  if (!hasImage) {
    return true;
  }

  // Check if category is explicitly incompatible
  if (IMAGE_INCOMPATIBLE_LAYOUTS.has(category)) {
    return false;
  }

  // Check if category requires images
  if (IMAGE_REQUIRED_LAYOUTS.has(category)) {
    return true; // Compatible because it requires images
  }

  // Conditionally incompatible categories need style-level checking
  if (CONDITIONALLY_INCOMPATIBLE_CATEGORIES.has(category)) {
    return true; // Will be checked at style level
  }

  // All other categories are compatible
  return true;
}

/**
 * Check if a specific layout style is compatible with images
 */
export function isLayoutStyleCompatibleWithImage(
  style: ContentLayoutStyle,
  category: ContentLayoutCategory,
  hasImage: boolean
): boolean {
  // If no image is requested, all styles are compatible
  if (!hasImage) {
    return true;
  }

  // Check category-level incompatibility first
  if (!isLayoutCategoryCompatibleWithImage(category, hasImage)) {
    return false;
  }

  // Check if this specific style is incompatible
  if (IMAGE_INCOMPATIBLE_STYLES.has(style)) {
    return false;
  }

  // Check if category requires images
  if (IMAGE_REQUIRED_LAYOUTS.has(category)) {
    return true;
  }

  // All other cases are compatible
  return true;
}

/**
 * Get compatible layout categories when an image is required
 */
export function getImageCompatibleCategories(hasImage: boolean): ContentLayoutCategory[] {
  if (!hasImage) {
    // All categories are compatible when no image is needed
    return ["boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "images"];
  }

  // Filter out incompatible categories
  const allCategories: ContentLayoutCategory[] = [
    "boxes",
    "bullets",
    "sequence",
    "steps",
    "quotes",
    "circles",
    "numbers",
    "images",
  ];

  return allCategories.filter(
    (category) => isLayoutCategoryCompatibleWithImage(category, hasImage)
  );
}

/**
 * Get compatible layout styles for a category when an image is required
 */
export function getImageCompatibleStyles(
  category: ContentLayoutCategory,
  availableStyles: ContentLayoutStyle[],
  hasImage: boolean
): ContentLayoutStyle[] {
  if (!hasImage) {
    return availableStyles; // All styles compatible when no image
  }

  return availableStyles.filter((style) =>
    isLayoutStyleCompatibleWithImage(style, category, hasImage)
  );
}

/**
 * Determine if image should be removed based on selected layout
 * Returns true if image should be removed, false if it can stay
 */
export function shouldRemoveImageForLayout(
  category: ContentLayoutCategory,
  style: ContentLayoutStyle,
  hasImage: boolean
): boolean {
  if (!hasImage) {
    return false; // No image to remove
  }

  return !isLayoutStyleCompatibleWithImage(style, category, hasImage);
}

/**
 * Get alternative compatible categories when current category is incompatible
 */
export function getAlternativeCompatibleCategories(
  incompatibleCategory: ContentLayoutCategory,
  hasImage: boolean
): ContentLayoutCategory[] {
  const compatible = getImageCompatibleCategories(hasImage);
  
  // Remove the incompatible category and return alternatives
  return compatible.filter((cat) => cat !== incompatibleCategory);
}


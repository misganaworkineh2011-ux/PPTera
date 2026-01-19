/**
 * Layout Registry
 * 
 * Central registry for all layout definitions with lookup and filtering utilities.
 * Provides access to layout definitions and their styles.
 * 
 * Performance Optimizations (Task 16.1):
 * - Singleton pattern for layout registry
 * - Cached lookup maps for O(1) access by category
 * - Pre-computed filtered lists for common queries
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { LayoutDefinition, LayoutStyleDefinition } from "../types";
import { LAYOUT_DEFINITIONS } from "./layout-definitions";

// ============================================================================
// SINGLETON CACHE (Task 16.1)
// ============================================================================

/**
 * Cached layout registry singleton
 * Loaded once at module initialization for fast access
 */
let cachedRegistry: LayoutDefinition[] | null = null;

/**
 * Cached lookup map by category for O(1) access
 */
let categoryLookupMap: Map<ContentLayoutCategory, LayoutDefinition> | null = null;

/**
 * Cached filtered lists for common queries
 */
let cachedImageSupportingLayouts: LayoutDefinition[] | null = null;
let cachedImageRequiringLayouts: LayoutDefinition[] | null = null;
let cachedNarrowCompatibleLayouts: LayoutDefinition[] | null = null;
let cachedFullWidthLayouts: LayoutDefinition[] | null = null;
let cachedPriorityMap: Map<string, LayoutDefinition[]> | null = null;
let cachedDensityMap: Map<string, LayoutDefinition[]> | null = null;

/**
 * Initialize the cached registry and lookup maps
 * Called lazily on first access
 */
function initializeCache(): void {
  if (cachedRegistry !== null) return;
  
  // Cache the main registry
  cachedRegistry = LAYOUT_DEFINITIONS;
  
  // Build category lookup map for O(1) access
  categoryLookupMap = new Map();
  for (const layout of cachedRegistry) {
    categoryLookupMap.set(layout.category, layout);
  }
  
  // Pre-compute filtered lists
  cachedImageSupportingLayouts = cachedRegistry.filter(l => l.capacity.supportsImage);
  cachedImageRequiringLayouts = cachedRegistry.filter(l => l.capacity.requiresImage);
  cachedNarrowCompatibleLayouts = cachedRegistry.filter(l => l.capacity.spaceRequirement === "narrow-compatible");
  cachedFullWidthLayouts = cachedRegistry.filter(l => l.capacity.spaceRequirement === "full-width-only");
  
  // Pre-compute priority map
  cachedPriorityMap = new Map();
  for (const layout of cachedRegistry) {
    const existing = cachedPriorityMap.get(layout.priority) ?? [];
    existing.push(layout);
    cachedPriorityMap.set(layout.priority, existing);
  }
  
  // Pre-compute density map
  cachedDensityMap = new Map();
  for (const layout of cachedRegistry) {
    const existing = cachedDensityMap.get(layout.capacity.density) ?? [];
    existing.push(layout);
    cachedDensityMap.set(layout.capacity.density, existing);
  }
}

/**
 * Main layout registry - exported for use throughout the system
 * Uses cached singleton for performance
 */
export const LAYOUT_REGISTRY: LayoutDefinition[] = LAYOUT_DEFINITIONS;

/**
 * Get all available layouts
 * Uses cached singleton for O(1) access
 * 
 * @returns Array of all layout definitions
 */
export function getAllLayouts(): LayoutDefinition[] {
  initializeCache();
  return cachedRegistry!;
}

/**
 * Get a specific layout definition by category
 * Uses cached lookup map for O(1) access
 * 
 * @param category - The layout category to retrieve
 * @returns The layout definition, or undefined if not found
 */
export function getLayoutByCategory(
  category: ContentLayoutCategory
): LayoutDefinition | undefined {
  initializeCache();
  return categoryLookupMap!.get(category);
}

/**
 * Get all style definitions for a specific layout category
 * 
 * @param category - The layout category
 * @returns Array of style definitions, or empty array if category not found
 */
export function getLayoutStyles(
  category: ContentLayoutCategory
): LayoutStyleDefinition[] {
  const layout = getLayoutByCategory(category);
  return layout?.styles ?? [];
}

/**
 * Get a specific style definition by category and style ID
 * 
 * @param category - The layout category
 * @param styleId - The style ID within the category
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
 * Get all layouts that support images
 * Uses pre-computed cached list for O(1) access
 * 
 * @returns Array of layout definitions that support images
 */
export function getImageSupportingLayouts(): LayoutDefinition[] {
  initializeCache();
  return cachedImageSupportingLayouts!;
}

/**
 * Get all layouts that require images
 * Uses pre-computed cached list for O(1) access
 * 
 * @returns Array of layout definitions that require images
 */
export function getImageRequiringLayouts(): LayoutDefinition[] {
  initializeCache();
  return cachedImageRequiringLayouts!;
}

/**
 * Get layouts by priority level
 * Uses pre-computed cached map for O(1) access
 * 
 * @param priority - The priority level to filter by
 * @returns Array of layout definitions with the specified priority
 */
export function getLayoutsByPriority(
  priority: "high" | "medium" | "low" | "fallback"
): LayoutDefinition[] {
  initializeCache();
  return cachedPriorityMap!.get(priority) ?? [];
}

/**
 * Get layouts compatible with narrow spaces
 * Uses pre-computed cached list for O(1) access
 * 
 * @returns Array of layout definitions that work in narrow spaces
 */
export function getNarrowCompatibleLayouts(): LayoutDefinition[] {
  initializeCache();
  return cachedNarrowCompatibleLayouts!;
}

/**
 * Get layouts that require full width
 * Uses pre-computed cached list for O(1) access
 * 
 * @returns Array of layout definitions that require full width
 */
export function getFullWidthLayouts(): LayoutDefinition[] {
  initializeCache();
  return cachedFullWidthLayouts!;
}

/**
 * Get layouts by density compatibility
 * Uses pre-computed cached map for O(1) access
 * 
 * @param density - The content density level
 * @returns Array of layout definitions compatible with the density
 */
export function getLayoutsByDensity(
  density: "low" | "medium" | "high"
): LayoutDefinition[] {
  initializeCache();
  return cachedDensityMap!.get(density) ?? [];
}

/**
 * Check if a layout category exists in the registry
 * Uses cached lookup map for O(1) access
 * 
 * @param category - The layout category to check
 * @returns True if the category exists, false otherwise
 */
export function hasLayoutCategory(category: string): boolean {
  initializeCache();
  return categoryLookupMap!.has(category as ContentLayoutCategory);
}

/**
 * Get the default fallback layout
 * 
 * @returns The bullets layout (primary fallback)
 */
export function getFallbackLayout(): LayoutDefinition {
  const fallback = getLayoutByCategory("bullets");
  if (!fallback) {
    throw new Error("Fallback layout 'bullets' not found in registry");
  }
  return fallback;
}

/**
 * Get layout categories sorted by priority
 * 
 * @returns Array of layout categories in priority order (high to fallback)
 */
export function getLayoutCategoriesByPriority(): ContentLayoutCategory[] {
  const priorityOrder = { high: 0, medium: 1, low: 2, fallback: 3 };
  
  return LAYOUT_REGISTRY
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .map(layout => layout.category);
}

/**
 * Validate that the registry is properly configured
 * 
 * @throws Error if registry is invalid
 */
export function validateRegistry(): void {
  if (LAYOUT_REGISTRY.length === 0) {
    throw new Error("Layout registry is empty");
  }
  
  // Check for duplicate categories
  const categories = LAYOUT_REGISTRY.map(l => l.category);
  const uniqueCategories = new Set(categories);
  if (categories.length !== uniqueCategories.size) {
    throw new Error("Layout registry contains duplicate categories");
  }
  
  // Check that all layouts have at least one style
  LAYOUT_REGISTRY.forEach(layout => {
    if (!layout.styles || layout.styles.length === 0) {
      throw new Error(`Layout '${layout.category}' has no styles defined`);
    }
  });
  
  // Check that fallback layout exists
  const hasFallback = LAYOUT_REGISTRY.some(l => l.category === "bullets");
  if (!hasFallback) {
    throw new Error("Registry must include 'bullets' as fallback layout");
  }
}

/**
 * Clear all cached data
 * Useful for testing or when registry needs to be reloaded
 */
export function clearRegistryCache(): void {
  cachedRegistry = null;
  categoryLookupMap = null;
  cachedImageSupportingLayouts = null;
  cachedImageRequiringLayouts = null;
  cachedNarrowCompatibleLayouts = null;
  cachedFullWidthLayouts = null;
  cachedPriorityMap = null;
  cachedDensityMap = null;
}

/**
 * Get cache statistics for monitoring
 */
export function getRegistryCacheStats(): {
  isInitialized: boolean;
  layoutCount: number;
  categoryCount: number;
} {
  return {
    isInitialized: cachedRegistry !== null,
    layoutCount: cachedRegistry?.length ?? 0,
    categoryCount: categoryLookupMap?.size ?? 0,
  };
}

// Validate registry on module load
validateRegistry();

// Initialize cache eagerly for best performance
initializeCache();

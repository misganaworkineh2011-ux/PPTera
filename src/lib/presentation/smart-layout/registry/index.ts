/**
 * Layout Registry Module
 * 
 * Exports layout definitions and registry utilities
 */

export { LAYOUT_DEFINITIONS } from "./layout-definitions";
export {
  LAYOUT_REGISTRY,
  getAllLayouts,
  getLayoutByCategory,
  getLayoutStyles,
  getStyleById,
  getImageSupportingLayouts,
  getImageRequiringLayouts,
  getLayoutsByPriority,
  getNarrowCompatibleLayouts,
  getFullWidthLayouts,
  getLayoutsByDensity,
  hasLayoutCategory,
  getFallbackLayout,
  getLayoutCategoriesByPriority,
  validateRegistry,
} from "./layout-registry";

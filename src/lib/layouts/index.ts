// Layout System
// Two-part layout architecture: Content + Slide
//
// Content Layouts: How text/data is structured (boxes, bullets, steps, etc.)
// Slide Layouts: Where the image sits relative to content (left, right, top, etc.)

export * from "./content";
export * from "./slide";

// Re-export specific types for convenience
export type { BoxLayout, BoxLayoutType, BoxContentItem } from "./content/boxes";
export {
  boxLayouts,
  getBoxLayoutById,
  getAllBoxLayouts,
  getRecommendedBoxLayout,
  calculateBoxGridDimensions,
  getBoxLayoutGridTemplate,
} from "./content/boxes";
export type { SlideLayoutType, ImageSize, SlideLayoutDefinition } from "./slide";

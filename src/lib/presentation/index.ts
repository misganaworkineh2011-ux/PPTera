/**
 * Presentation Generation Utilities
 * 
 * Central exports for all presentation transformation utilities.
 */

// Type exports
export * from "./types";

// Bullet point transformation
export { 
  transformBullets, 
  transformAllSlides 
} from "./transform-bullets";

// Outline to presentation transformation (LLM-powered)
export {
  transformOutlineToPresentation,
  transformOutlineToPresentationStream,
  type OutlineSlide,
  type TransformedSlide,
  type TransformOptions,
} from "./transform-outline-to-presentation";

// Layout planner - smart layout selection
export {
  planSlideLayout,
  planDeckLayouts,
  extractPlannerInput,
  type PlannerInput,
  type PlannerOutput,
  type ContentLayoutStyle,
} from "./layout-planner";

// AI image generation
export { 
  generateGeminiImage, 
  generateImageFromSpec,
  generateImagesForSlides,
  slideRequiresImage 
} from "./generate-ai-image";

// Export modes - Gamma-style export strategy
export {
  EXPORT_STRATEGY,
  PPTX_EDITABLE_FEATURES,
  PPTX_RASTERIZE_TRIGGERS,
  shouldRasterizeForPptx,
  getSlideExportMeta,
  getRecommendedPptxMode,
  type ExportFormat,
  type PptxMode,
  type ExportConfig,
  type SlideExportMeta,
} from "./export-modes";


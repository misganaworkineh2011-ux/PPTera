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

// Content analysis - semantic analysis and pattern detection
export {
  analyzeContent,
  analyzeBulletPattern,
  extractSemanticMarkers,
  detectContentType,
  analyzeContentStructure,
  type ContentAnalysis,
  type BulletPattern,
  type SemanticMarkers,
} from "./content-analyzer";

// Content types - type definitions and mappings
export {
  contentTypeToCategory,
  getContentTypeConfidence,
  isContentTypeSuitable,
  type ContentType,
} from "./content-types";

// Layout scenarios - scenario-based rules
export {
  LAYOUT_SCENARIOS,
  getScenariosForCategory,
  getAllScenarios,
  findMatchingScenarios,
  type LayoutScenario,
  type ScenarioPriority,
  type ScenarioCondition,
} from "./layout-scenarios";

// Layout matcher - multi-signal scoring
export {
  matchLayoutScenario,
  selectBestLayout,
  getConfidenceFromScore,
  type LayoutMatch,
  type MatchingInput,
} from "./layout-matcher";

// LLM layout suggester - AI-powered layout suggestions
export {
  suggestLayoutWithLLM,
  type LLMLayoutSuggestion,
} from "./llm-layout-suggester";

// Layout-image compatibility rules
export {
  isLayoutCategoryCompatibleWithImage,
  isLayoutStyleCompatibleWithImage,
  getImageCompatibleCategories,
  getImageCompatibleStyles,
  shouldRemoveImageForLayout,
  getAlternativeCompatibleCategories,
  IMAGE_INCOMPATIBLE_LAYOUTS,
  IMAGE_REQUIRED_LAYOUTS,
  IMAGE_INCOMPATIBLE_STYLES,
} from "./layout-image-rules";

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


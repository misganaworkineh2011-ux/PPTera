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


// AI image generation
export { 
  generateGeminiImage, 
  generateImageFromSpec,
  generateImagesForSlides,
  slideRequiresImage 
} from "./generate-ai-image";


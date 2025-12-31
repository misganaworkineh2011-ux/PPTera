/**
 * Export Modes - Gamma-style export strategy
 * 
 * Defines how presentations are exported to different formats:
 * - Present Mode (HTML/CSS) is the canonical "source of truth"
 * - PNG/PDF are rendered directly from Present Mode
 * - PPTX uses a hybrid approach: editable objects + selective rasterization
 */

// Export format types
export type ExportFormat = "png" | "pdf" | "pptx";

// PPTX export modes
export type PptxMode = 
  | "pixel-perfect"  // Each slide is an image background (always matches preview)
  | "editable"       // Best-effort conversion to PPT shapes/text (may vary slightly)
  | "hybrid";        // Editable where possible, rasterized for complex layouts

// Export configuration
export interface ExportConfig {
  format: ExportFormat;
  // For PPTX
  pptxMode?: PptxMode;
  // For PNG/PDF
  quality?: "low" | "medium" | "high";
  // Include speaker notes (for PDF/PPTX)
  includeSpeakerNotes?: boolean;
}

// Slide export metadata - flags per slide for export behavior
export interface SlideExportMeta {
  // Should this slide's body be rasterized in PPTX? (complex layouts)
  rasterizeBodyForPptx?: boolean;
  // Is the layout compatible with editable PPTX?
  pptxCompatible?: boolean;
  // Any unsupported features for PPTX
  pptxUnsupportedFeatures?: string[];
}

// Features that require rasterization in PPTX
export const PPTX_RASTERIZE_TRIGGERS = [
  "circle-arc",      // Arc layouts are complex
  "circle-ring",     // Ring layouts are complex
  "clip-path-arc",   // CSS clip-path not supported in PPTX
  "gradient-text",   // Gradient text not well supported
  "blur-effects",    // CSS blur not supported
  "complex-grid",    // Grids with many items may not render correctly
] as const;

// Features that work well in editable PPTX
export const PPTX_EDITABLE_FEATURES = [
  "text-box",        // Simple text boxes
  "bullet-list",     // Bullet point lists
  "rectangle",       // Basic shapes
  "image",           // Images
  "title",           // Title text
] as const;

/**
 * Determine if a slide should be rasterized in PPTX export
 */
export function shouldRasterizeForPptx(
  contentLayoutCategory?: string,
  contentLayout?: string,
  hasComplexEffects?: boolean
): boolean {
  // Circle layouts always need rasterization
  if (contentLayoutCategory === "circles") {
    return true;
  }
  
  // Specific layouts that are complex
  if (contentLayout === "circle-arc" || contentLayout === "circle-ring") {
    return true;
  }
  
  // If slide has complex CSS effects
  if (hasComplexEffects) {
    return true;
  }
  
  return false;
}

/**
 * Get slide export metadata based on content
 */
export function getSlideExportMeta(
  contentLayoutCategory?: string,
  contentLayout?: string,
  hasClipPath?: boolean,
  hasGradientText?: boolean,
  hasBlur?: boolean
): SlideExportMeta {
  const unsupportedFeatures: string[] = [];
  
  if (contentLayoutCategory === "circles") {
    unsupportedFeatures.push("circle-arc", "circle-ring");
  }
  
  if (hasClipPath) {
    unsupportedFeatures.push("clip-path-arc");
  }
  
  if (hasGradientText) {
    unsupportedFeatures.push("gradient-text");
  }
  
  if (hasBlur) {
    unsupportedFeatures.push("blur-effects");
  }
  
  const rasterize = unsupportedFeatures.length > 0;
  
  return {
    rasterizeBodyForPptx: rasterize,
    pptxCompatible: !rasterize,
    pptxUnsupportedFeatures: unsupportedFeatures.length > 0 ? unsupportedFeatures : undefined,
  };
}

/**
 * Export pipeline strategy
 * 
 * Present Mode (HTML/CSS)
 *   ├── PNG Export: Render slides to images
 *   ├── PDF Export: Render slides to PDF pages
 *   └── PPTX Export:
 *       ├── Pixel-Perfect: Each slide as image background
 *       ├── Editable: Convert simple elements to PPT objects
 *       └── Hybrid: Mix of editable and rasterized per slide
 */
export const EXPORT_STRATEGY = {
  canonical: "present-mode",
  
  png: {
    source: "present-mode",
    method: "html-to-image",
    preservesFidelity: true,
    editable: false,
  },
  
  pdf: {
    source: "present-mode", 
    method: "html-to-pdf",
    preservesFidelity: true,
    editable: false,
    supportsSpeakerNotes: true,
  },
  
  pptx: {
    source: "present-mode",
    methods: {
      "pixel-perfect": {
        description: "Each slide rendered as image, placed as background",
        preservesFidelity: true,
        editable: false,
      },
      "editable": {
        description: "Convert to native PPT objects where possible",
        preservesFidelity: false, // May have slight differences
        editable: true,
        unsupportedFallback: "rasterize",
      },
      "hybrid": {
        description: "Editable elements + rasterized complex layouts",
        preservesFidelity: true, // For rasterized parts
        editable: "partial", // Simple elements are editable
      },
    },
    defaultMode: "hybrid" as PptxMode,
    supportsSpeakerNotes: true,
  },
} as const;

/**
 * Recommended export mode based on deck complexity
 */
export function getRecommendedPptxMode(
  slides: Array<{ contentLayoutCategory?: string; contentLayout?: string }>
): PptxMode {
  const complexSlides = slides.filter(
    s => shouldRasterizeForPptx(s.contentLayoutCategory, s.contentLayout)
  );
  
  const complexRatio = complexSlides.length / slides.length;
  
  // If most slides are complex, use pixel-perfect
  if (complexRatio > 0.5) {
    return "pixel-perfect";
  }
  
  // If some are complex, use hybrid
  if (complexRatio > 0) {
    return "hybrid";
  }
  
  // All slides are simple, use editable
  return "editable";
}


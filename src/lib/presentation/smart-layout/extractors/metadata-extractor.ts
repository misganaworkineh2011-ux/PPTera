/**
 * Metadata Extractor
 * 
 * Extracts and normalizes metadata from LLM-generated outline slides.
 * Handles both outline slides and transformed slides, providing fallback
 * values for missing metadata.
 */

import type { SlideMetadata, VisualStrategy, ImageAssetMetadata } from "../types";

/**
 * Input slide that may have metadata (from outline or transformed)
 */
interface SlideWithMetadata {
  type?: "title" | "content";
  title?: string;
  subtitle?: string;
  bulletPoints?: string[];
  
  // LLM-generated metadata (may be present)
  semanticIntent?: string;
  visualStrategy?: VisualStrategy | Partial<VisualStrategy>;
  contentLayoutHint?: string;
  
  // Image metadata (may be in different locations)
  image?: ImageAssetMetadata | Partial<ImageAssetMetadata>;
  assets?: {
    image?: ImageAssetMetadata | Partial<ImageAssetMetadata>;
  };
}

/**
 * Extracts slide metadata from an outline or transformed slide.
 * 
 * This function handles both outline slides (from LLM) and transformed slides,
 * extracting all available metadata fields. It normalizes the data structure
 * and provides fallback values for missing fields.
 * 
 * @param slide - The slide to extract metadata from
 * @returns Complete SlideMetadata object with all required fields
 * 
 * @example
 * ```typescript
 * const metadata = extractSlideMetadata(outlineSlide);
 * console.log(metadata.semanticIntent); // "inform" or LLM-provided value
 * ```
 */
export function extractSlideMetadata(slide: SlideWithMetadata): SlideMetadata {
  // Extract semantic intent (with fallback)
  const semanticIntent = normalizeSemanticIntent(slide.semanticIntent);
  
  // Extract visual strategy (with fallback)
  const visualStrategy = normalizeVisualStrategy(slide.visualStrategy);
  
  // Extract content layout hint (optional, no fallback needed)
  // Handle both undefined and null
  const contentLayoutHint = slide.contentLayoutHint || undefined;
  
  // Extract image metadata from either location
  const imageMetadata = extractImageMetadata(slide);
  
  return {
    semanticIntent,
    visualStrategy,
    contentLayoutHint,
    assets: {
      image: imageMetadata,
    },
  };
}

/**
 * Normalizes semantic intent to a standard value.
 * 
 * Converts various LLM outputs to standard semantic intent values.
 * Provides fallback to "inform" if missing or unrecognized.
 * 
 * @param intent - Raw semantic intent from LLM (may be undefined)
 * @returns Normalized semantic intent
 * 
 * @example
 * ```typescript
 * normalizeSemanticIntent("INFORM") // "inform"
 * normalizeSemanticIntent(undefined) // "inform" (fallback)
 * normalizeSemanticIntent("teach") // "instruct" (normalized)
 * ```
 */
export function normalizeSemanticIntent(intent?: string): string {
  if (!intent) {
    return "inform"; // Default fallback
  }
  
  // Normalize to lowercase
  const normalized = intent.toLowerCase().trim();
  
  // Map common variations to standard values
  const intentMap: Record<string, string> = {
    // Standard values (pass through)
    "inform": "inform",
    "compare": "compare",
    "instruct": "instruct",
    "emphasize": "emphasize",
    "narrate": "narrate",
    "analyze": "analyze",
    "demonstrate": "demonstrate",
    
    // Common variations
    "teach": "instruct",
    "explain": "inform",
    "describe": "inform",
    "show": "demonstrate",
    "tell": "narrate",
    "contrast": "compare",
    "highlight": "emphasize",
    "focus": "emphasize",
    "examine": "analyze",
    "evaluate": "analyze",
  };
  
  return intentMap[normalized] || "inform"; // Fallback to "inform" for unknown
}

/**
 * Normalizes visual strategy to a complete VisualStrategy object.
 * 
 * Ensures all required fields are present with valid values.
 * Provides fallback values for missing or partial data.
 * 
 * @param strategy - Raw visual strategy from LLM (may be undefined or partial)
 * @returns Complete VisualStrategy object
 * 
 * @example
 * ```typescript
 * normalizeVisualStrategy(undefined)
 * // { primary: "text-focused", pattern: "cards", emphasis: "clarity" }
 * 
 * normalizeVisualStrategy({ primary: "image" })
 * // { primary: "image", pattern: "cards", emphasis: "clarity" }
 * ```
 */
export function normalizeVisualStrategy(
  strategy?: VisualStrategy | Partial<VisualStrategy>
): VisualStrategy {
  // Default fallback values
  const defaults: VisualStrategy = {
    primary: "text-focused",
    pattern: "cards",
    emphasis: "clarity",
  };
  
  if (!strategy) {
    return defaults;
  }
  
  // Normalize primary
  const primary = normalizePrimary(strategy.primary);
  
  // Normalize pattern
  const pattern = normalizePattern(strategy.pattern);
  
  // Normalize emphasis
  const emphasis = normalizeEmphasis(strategy.emphasis);
  
  return {
    primary,
    pattern,
    emphasis,
  };
}

/**
 * Normalizes the primary visual strategy field
 */
function normalizePrimary(primary?: string): string {
  if (!primary) return "text-focused";
  
  const normalized = primary.toLowerCase().trim();
  const validValues = ["diagram", "image", "mixed", "text-focused"];
  
  // Map common variations
  const primaryMap: Record<string, string> = {
    "diagram": "diagram",
    "image": "image",
    "mixed": "mixed",
    "text-focused": "text-focused",
    "text": "text-focused",
    "visual": "image",
    "graphic": "diagram",
    "chart": "diagram",
    "photo": "image",
    "picture": "image",
    "hybrid": "mixed",
    "combined": "mixed",
  };
  
  return primaryMap[normalized] || "text-focused";
}

/**
 * Normalizes the pattern visual strategy field
 */
function normalizePattern(pattern?: string): string {
  if (!pattern) return "cards";
  
  const normalized = pattern.toLowerCase().trim();
  
  const patternMap: Record<string, string> = {
    "cards": "cards",
    "grid": "grid",
    "flow": "flow",
    "split": "split",
    "spotlight": "spotlight",
    "pyramid": "pyramid",
    "timeline": "timeline",
    
    // Common variations
    "boxes": "cards",
    "tiles": "grid",
    "sequence": "flow",
    "process": "flow",
    "comparison": "split",
    "versus": "split",
    "highlight": "spotlight",
    "focus": "spotlight",
    "hierarchy": "pyramid",
    "chronological": "timeline",
    "steps": "flow",
  };
  
  return patternMap[normalized] || "cards";
}

/**
 * Normalizes the emphasis visual strategy field
 */
function normalizeEmphasis(emphasis?: string): string {
  if (!emphasis) return "clarity";
  
  const normalized = emphasis.toLowerCase().trim();
  
  const emphasisMap: Record<string, string> = {
    "progression": "progression",
    "contrast": "contrast",
    "relationship": "relationship",
    "scale": "scale",
    "hierarchy": "hierarchy",
    "clarity": "clarity",
    
    // Common variations
    "sequence": "progression",
    "order": "progression",
    "flow": "progression",
    "difference": "contrast",
    "comparison": "contrast",
    "connection": "relationship",
    "link": "relationship",
    "size": "scale",
    "magnitude": "scale",
    "structure": "hierarchy",
    "organization": "hierarchy",
    "clear": "clarity",
    "simple": "clarity",
  };
  
  return emphasisMap[normalized] || "clarity";
}

/**
 * Extracts image metadata from various possible locations in the slide
 */
function extractImageMetadata(
  slide: SlideWithMetadata
): ImageAssetMetadata | undefined {
  // Check assets.image first (preferred location)
  if (slide.assets?.image) {
    return normalizeImageMetadata(slide.assets.image);
  }
  
  // Check direct image property (alternative location)
  if (slide.image) {
    return normalizeImageMetadata(slide.image);
  }
  
  // No image metadata found
  return undefined;
}

/**
 * Normalizes image metadata to ensure all required fields are present
 */
function normalizeImageMetadata(
  image: ImageAssetMetadata | Partial<ImageAssetMetadata>
): ImageAssetMetadata {
  return {
    required: image.required ?? false,
    orientation: image.orientation || "landscape",
    pexelsPromptHint: image.pexelsPromptHint || "",
    aiPromptHint: image.aiPromptHint || "",
  };
}

/**
 * Validates that metadata is complete and returns validation result.
 * 
 * Checks that all required fields are present and valid.
 * Returns warnings for any issues found.
 * 
 * @param metadata - The metadata to validate
 * @returns Validation result with warnings
 * 
 * @example
 * ```typescript
 * const result = validateMetadata(metadata);
 * if (!result.valid) {
 *   console.warn("Metadata issues:", result.warnings);
 * }
 * ```
 */
export function validateMetadata(metadata: SlideMetadata): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check semantic intent
  if (!metadata.semanticIntent) {
    warnings.push("Missing semanticIntent");
  }
  
  // Check visual strategy
  if (!metadata.visualStrategy) {
    warnings.push("Missing visualStrategy");
  } else {
    if (!metadata.visualStrategy.primary) {
      warnings.push("Missing visualStrategy.primary");
    }
    if (!metadata.visualStrategy.pattern) {
      warnings.push("Missing visualStrategy.pattern");
    }
    if (!metadata.visualStrategy.emphasis) {
      warnings.push("Missing visualStrategy.emphasis");
    }
  }
  
  // Check assets structure (should always exist, even if empty)
  if (!metadata.assets) {
    warnings.push("Missing assets object");
  }
  
  // Note: contentLayoutHint is optional, so no validation needed
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}

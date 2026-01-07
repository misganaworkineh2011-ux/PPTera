/**
 * Layout Planner - Smart layout selection for slides
 * 
 * Jointly selects image placement (slide layout) and content layout based on:
 * - Content density (bullet count, text length)
 * - Semantic intent and visual strategy hints
 * - Image requirements from outline
 * - Fallback ladder to avoid ugly combinations
 */

import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import type { SequenceLayoutType } from "~/lib/layouts/content/sequence";
import type { BulletLayoutType } from "~/lib/layouts/content/bullets";
import type { StepsLayoutType } from "~/lib/layouts/content/steps";
import type { QuotesLayoutType } from "~/lib/layouts/content/quotes";
import type { CircleLayoutType } from "~/lib/layouts/content/circles";
import type { ImageLayoutType } from "~/lib/layouts/content/images";
import { analyzeContent, type ContentAnalysis } from "./content-analyzer";
import { selectBestLayout, type MatchingInput } from "./layout-matcher";
import { contentTypeToCategory } from "./content-types";
import { suggestLayoutWithLLM, type LLMLayoutSuggestion } from "./llm-layout-suggester";
import {
  isLayoutStyleCompatibleWithImage,
  isLayoutCategoryCompatibleWithImage,
  getImageCompatibleStyles,
  getAlternativeCompatibleCategories,
  shouldRemoveImageForLayout,
} from "./layout-image-rules";

// Combined content layout style type
export type ContentLayoutStyle = 
  | BoxLayoutType 
  | SequenceLayoutType 
  | BulletLayoutType 
  | StepsLayoutType 
  | QuotesLayoutType 
  | CircleLayoutType 
  | ImageLayoutType;

// Input for the planner
export interface PlannerInput {
  type: "title" | "content";
  bulletCount: number;
  avgBulletLength: number; // average words per bullet
  maxBulletLength: number; // longest bullet in words
  hasImage: boolean; // from outline assets.image.required
  semanticIntent?: string;
  visualStrategyPattern?: string;
  contentLayoutHint?: string; // hint from outline (e.g., "boxes", "sequence")
  slideIndex: number;
  totalSlides: number;
  // New: Content analysis results
  contentAnalysis?: ContentAnalysis;
  bulletPoints?: string[]; // For content analysis
  title?: string; // Slide title for LLM suggestion
  // New: LLM layout suggestion (optional, will be fetched if not provided)
  llmSuggestion?: LLMLayoutSuggestion | null;
}

// Output from the planner
export interface PlannerOutput {
  slideLayout: SlideLayoutType;
  imageSize: ImageSize;
  imageShape: ImageShape; // Shape of the image edge (rectangle, arc, rounded, wave)
  contentLayoutCategory: ContentLayoutCategory;
  contentLayout: ContentLayoutStyle;
  // For renderer compatibility
  legacyLayout: string; // maps to existing layout variants like "left-content", "right-content"
  // Flags
  isNarrowSpace: boolean; // true when image is left/right (content area is narrow)
  rasterizeForPptx?: boolean; // mark complex layouts for rasterization in PPTX export
}

// Available image shapes for variety
const IMAGE_SHAPES: ImageShape[] = ["rectangle", "arc", "rounded", "wave"];

/**
 * Select an image shape for variety
 * Uses slide index to create visual variety across the deck
 */
function selectImageShape(slideIndex: number): ImageShape {
  // Cycle through shapes for variety, with arc as most common
  const shapeWeights: ImageShape[] = [
    "arc", "arc", "arc",      // 3x weight for arc (default/most common)
    "rounded", "rounded",     // 2x weight for rounded
    "wave",                   // 1x weight for wave
    "rectangle",              // 1x weight for rectangle
  ];
  return shapeWeights[slideIndex % shapeWeights.length]!;
}

// Density classification
type DensityLevel = "low" | "medium" | "high";

// Layout style options per category
const LAYOUT_STYLES: Record<ContentLayoutCategory, ContentLayoutStyle[]> = {
  boxes: ["box-style-1", "box-style-2", "box-style-3", "box-style-4"],
  bullets: ["bullet-style-1", "bullet-style-2", "bullet-style-3", "bullet-style-4"],
  sequence: ["sequence-style-1", "sequence-style-2", "sequence-style-3", "sequence-style-4"],
  steps: ["steps-pyramid", "steps-arrows", "steps-cards", "steps-bars"],
  quotes: ["quote-bubble", "quote-marks"],
  circles: ["circle-arc", "circle-ring"],
  images: ["image-style-1", "image-style-2", "image-style-3", "image-style-4"],
  numbers: ["box-style-1", "box-style-2"], // Numbers use box layouts
};

// Map SlideLayoutType to legacy layout string
const SLIDE_LAYOUT_TO_LEGACY: Record<SlideLayoutType, string> = {
  "image-left": "left-content",
  "image-right": "right-content",
  "image-top": "image-top",
  "image-bottom": "image-bottom",
  "image-background": "image-background",
  "image-full": "image-full",
  "no-image": "centered",
};

/**
 * Classify content density based on bullet count and text length
 */
function classifyDensity(input: PlannerInput): DensityLevel {
  const { bulletCount, avgBulletLength, maxBulletLength } = input;
  
  // High density: many items OR very long text
  if (bulletCount >= 5 || avgBulletLength > 20 || maxBulletLength > 30) {
    return "high";
  }
  
  // Medium density: moderate items and text
  if (bulletCount >= 3 || avgBulletLength > 12 || maxBulletLength > 20) {
    return "medium";
  }
  
  // Low density: few items, short text
  return "low";
}

/**
 * Get a random style from a category
 */
function getRandomStyle(category: ContentLayoutCategory): ContentLayoutStyle {
  const styles = LAYOUT_STYLES[category];
  if (!styles || styles.length === 0) {
    return "box-style-1";
  }
  return styles[Math.floor(Math.random() * styles.length)]!;
}

/**
 * Get a style suitable for narrow space (when image is left/right)
 */
function getNarrowSpaceStyle(category: ContentLayoutCategory, bulletCount: number): ContentLayoutStyle {
  switch (category) {
    case "boxes":
      // Prefer simpler box styles for narrow space
      return bulletCount <= 3 ? "box-style-2" : "box-style-1";
    case "bullets":
      // Use list-style bullets (no cards) for narrow space
      return bulletCount <= 4 ? "bullet-style-2" : "bullet-style-4";
    case "sequence":
      // Use vertical sequence for narrow space
      return "sequence-style-3"; // Vertical steps
    case "steps":
      // Use vertical steps
      return "steps-bars";
    case "quotes":
      return "quote-marks";
    case "circles":
      // Ring works better in narrow space than arc
      return "circle-ring";
    case "images":
      return "image-style-1"; // Compact gallery
    case "numbers":
      return "box-style-2";
    default:
      return "bullet-style-2";
  }
}

/**
 * Map content layout hint to category with validation
 */
function resolveCategory(hint?: string): ContentLayoutCategory {
  if (!hint) return "boxes";
  
  const normalized = hint.toLowerCase().trim();
  
  // Direct match
  if (LAYOUT_STYLES[normalized as ContentLayoutCategory]) {
    return normalized as ContentLayoutCategory;
  }
  
  // Aliases
  const aliases: Record<string, ContentLayoutCategory> = {
    "box": "boxes",
    "bullet": "bullets",
    "timeline": "sequence",
    "process": "sequence",
    "step": "steps",
    "quote": "quotes",
    "testimonial": "quotes",
    "circle": "circles",
    "arc": "circles",
    "ring": "circles",
    "image": "images",
    "gallery": "images",
    "number": "numbers",
    "stats": "numbers",
    "statistics": "numbers",
    "metric": "numbers",
  };
  
  return aliases[normalized] || "boxes";
}

/**
 * Check if a category is safe with a given slide layout
 * Returns false if the combination would look ugly
 * Enhanced with more safety rules
 */
function isSafeCombination(
  category: ContentLayoutCategory,
  slideLayout: SlideLayoutType,
  bulletCount: number
): boolean {
  const isNarrow = slideLayout === "image-left" || slideLayout === "image-right";
  const hasArcClip = slideLayout === "image-left" || slideLayout === "image-right" || 
                     slideLayout === "image-top" || slideLayout === "image-bottom";
  
  // Rule 1: Circle-arc + arc-clipped image = too many curves
  if (category === "circles" && hasArcClip) {
    return false;
  }
  
  // Rule 2: Many cards + narrow space = cramped
  if (isNarrow && bulletCount >= 5) {
    if (category === "boxes" || category === "images") {
      return false;
    }
  }
  
  // Rule 3: Steps with many items in narrow space
  if (isNarrow && bulletCount >= 5 && category === "steps") {
    return false;
  }
  
  // Rule 4: Sequence layouts with many items in narrow space
  if (isNarrow && bulletCount >= 6 && category === "sequence") {
    return false;
  }
  
  // Rule 5: Quotes with many items (quotes work best with 1-3 items)
  if (bulletCount > 4 && category === "quotes") {
    return false;
  }
  
  // Rule 6: Numbers/statistics with very few items (need at least 2)
  if (bulletCount < 2 && category === "numbers") {
    return false;
  }
  
  // Rule 7: Circles need at least 3 items
  if (bulletCount < 3 && category === "circles") {
    return false;
  }
  
  // Rule 8: Steps need at least 3 items
  if (bulletCount < 3 && category === "steps") {
    return false;
  }
  
  return true;
}

/**
 * Plan layout for a title slide
 */
function planTitleSlide(input: PlannerInput): PlannerOutput {
  // Title slides: image left or right
  const slideLayout: SlideLayoutType = Math.random() > 0.5 ? "image-left" : "image-right";
  
  return {
    slideLayout: input.hasImage ? slideLayout : "no-image",
    imageSize: "medium",
    imageShape: selectImageShape(input.slideIndex),
    contentLayoutCategory: "boxes",
    contentLayout: "box-style-1",
    legacyLayout: input.hasImage ? SLIDE_LAYOUT_TO_LEGACY[slideLayout] : "title-centered",
    isNarrowSpace: input.hasImage,
  };
}

/**
 * Main planner function - chooses layout for a content slide
 * Uses LLM suggestion as primary method, scenario matching as secondary
 */
async function planContentSlide(input: PlannerInput): Promise<PlannerOutput> {
  const density = classifyDensity(input);
  
  // Step 1: Analyze content if not already done
  let contentAnalysis = input.contentAnalysis;
  if (!contentAnalysis && input.bulletPoints) {
    contentAnalysis = analyzeContent(
      input.bulletPoints,
      input.semanticIntent,
      input.visualStrategyPattern
    );
  }
  
  // Step 2: Start with image placement (alternate left/right)
  let slideLayout: SlideLayoutType = input.hasImage ? "image-right" : "no-image";
  let imageSize: ImageSize = "medium";
  
  if (input.hasImage) {
    slideLayout = input.slideIndex % 2 === 0 ? "image-right" : "image-left";
  }
  
  // Step 3: Get LLM layout suggestion (PRIMARY METHOD)
  let llmSuggestion = input.llmSuggestion;
  if (!llmSuggestion && contentAnalysis && input.bulletPoints && input.title) {
    // Fetch LLM suggestion if not provided
    try {
      llmSuggestion = await suggestLayoutWithLLM(
        input.title,
        input.bulletPoints,
        contentAnalysis,
        input.semanticIntent,
        input.visualStrategyPattern,
        input.hasImage,
        slideLayout === "image-left" || slideLayout === "image-right"
      );
    } catch (error) {
      console.warn("[layout-planner] LLM suggestion failed, using scenario matching:", error);
    }
  }

  // Step 4: Use intelligent scenario matching (SECONDARY METHOD)
  let finalCategory: ContentLayoutCategory = "boxes"; // Default fallback
  let recommendedStyle: ContentLayoutStyle | undefined;
  let matchConfidence: "high" | "medium" | "low" = "low";
  
  // Prioritize LLM suggestion if available and high confidence
  if (llmSuggestion && llmSuggestion.confidence === "high") {
    finalCategory = llmSuggestion.category;
    recommendedStyle = llmSuggestion.specificType;
    matchConfidence = "high";
    console.log(`[layout-planner] Using LLM suggestion: ${finalCategory}/${recommendedStyle} (${llmSuggestion.reasoning})`);
  } else if (contentAnalysis) {
    // Fall back to scenario matching
    const matchingInput: MatchingInput = {
      analysis: contentAnalysis,
      bulletCount: input.bulletCount,
      avgBulletLength: input.avgBulletLength,
      maxBulletLength: input.maxBulletLength,
      density,
      semanticIntent: input.semanticIntent,
      visualStrategy: input.visualStrategyPattern,
      hasImage: input.hasImage,
      contentLayoutHint: input.contentLayoutHint,
    };
    
    const bestMatch = selectBestLayout(matchingInput, slideLayout);
    finalCategory = bestMatch.category;
    recommendedStyle = bestMatch.recommendedStyle;
    matchConfidence = bestMatch.confidence;
    
    // If LLM suggestion exists but wasn't high confidence, consider it
    if (llmSuggestion && llmSuggestion.confidence === "medium" && bestMatch.confidence === "low") {
      finalCategory = llmSuggestion.category;
      recommendedStyle = llmSuggestion.specificType;
      matchConfidence = "medium";
      console.log(`[layout-planner] Using LLM suggestion (medium confidence): ${finalCategory}/${recommendedStyle}`);
    }
  } else {
    // Fallback to hint-based if no analysis available
    finalCategory = resolveCategory(input.contentLayoutHint);
  }
  
  let rasterizeForPptx = false;
  
  // Step 5: Apply safety checks and fallbacks
  if (input.hasImage) {
    const isNarrow = slideLayout === "image-left" || slideLayout === "image-right";
    
    // Check if current combination is safe
    if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
      // Fallback 1: Try to find a safe category from content type
      if (contentAnalysis) {
        const altCategory = contentTypeToCategory(contentAnalysis.contentType);
        if (altCategory !== finalCategory && isSafeCombination(altCategory, slideLayout, input.bulletCount)) {
          finalCategory = altCategory;
        } else {
          // Fallback 2: Switch to simpler content layout (bullets)
          finalCategory = "bullets";
        }
      } else {
        finalCategory = "bullets";
      }
      
      // Fallback 3: Check again with new category
      if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
        // Fallback 4: Switch to top/bottom image
        slideLayout = "image-top";
        imageSize = "small";
      }
      
      // Fallback 5: Remove image if still unsafe
      if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
        slideLayout = "no-image";
      }
    }
    
    // High density with side image: prefer bullets if confidence is low
    if (density === "high" && isNarrow && matchConfidence === "low") {
      finalCategory = "bullets";
    }
    
    // Note: Circle layouts are now handled by image-layout compatibility rules
    // They will automatically remove images if incompatible
    if (finalCategory === "circles") {
      rasterizeForPptx = true; // Circle layouts are complex for PPTX
    }
  }
  
  // Step 6: Determine if space is narrow
  const isNarrowSpace = slideLayout === "image-left" || slideLayout === "image-right";
  
  // Step 7: Select specific style variant
  let contentLayout: ContentLayoutStyle;
  if (recommendedStyle && (matchConfidence === "high" || matchConfidence === "medium")) {
    // Use recommended style if high/medium confidence (from LLM or scenario matching)
    contentLayout = recommendedStyle;
  } else if (isNarrowSpace) {
    // Use narrow space style
    contentLayout = getNarrowSpaceStyle(finalCategory, input.bulletCount);
  } else {
    // Use random style for variety
    contentLayout = getRandomStyle(finalCategory);
  }

  // Step 8: Check image-layout compatibility and enforce rules
  if (input.hasImage && slideLayout !== "no-image") {
    // Check if the selected layout style is compatible with images
    const isCompatible = isLayoutStyleCompatibleWithImage(
      contentLayout,
      finalCategory,
      true
    );

    if (!isCompatible) {
      // Layout is incompatible with images - we have two options:
      // 1. Remove the image (preferred for circles, quotes)
      // 2. Change to a compatible layout category
      
      if (IMAGE_INCOMPATIBLE_LAYOUTS.has(finalCategory)) {
        // Category is completely incompatible - remove image
        console.log(
          `[layout-planner] Layout category "${finalCategory}" is incompatible with images, removing image`
        );
        slideLayout = "no-image";
        imageSize = "medium"; // Reset size
      } else {
        // Category is conditionally incompatible - try compatible styles first
        const availableStyles = LAYOUT_STYLES[finalCategory] || [];
        const compatibleStyles = getImageCompatibleStyles(
          finalCategory,
          availableStyles,
          true
        );

        if (compatibleStyles.length > 0) {
          // Switch to a compatible style within the same category
          contentLayout = compatibleStyles[0] as ContentLayoutStyle;
          console.log(
            `[layout-planner] Switched to compatible style "${contentLayout}" for category "${finalCategory}"`
          );
        } else {
          // No compatible styles in this category - try alternative categories
          const alternatives = getAlternativeCompatibleCategories(finalCategory, true);
          if (alternatives.length > 0) {
            // Switch to a compatible category (prefer boxes or bullets)
            const newCategory =
              alternatives.find((cat) => cat === "boxes" || cat === "bullets") ||
              alternatives[0]!;
            finalCategory = newCategory;
            const newStyles = LAYOUT_STYLES[newCategory] || [];
            contentLayout = getImageCompatibleStyles(newCategory, newStyles, true)[0] as ContentLayoutStyle;
            console.log(
              `[layout-planner] Switched to compatible category "${newCategory}" with style "${contentLayout}"`
            );
          } else {
            // No compatible categories - remove image
            console.log(
              `[layout-planner] No compatible layouts found, removing image`
            );
            slideLayout = "no-image";
            imageSize = "medium";
          }
        }
      }
    } else {
      // Layout is compatible, but verify the specific style is also compatible
      const styleCompatible = isLayoutStyleCompatibleWithImage(
        contentLayout,
        finalCategory,
        true
      );
      if (!styleCompatible) {
        // Style is incompatible - find a compatible style in the same category
        const availableStyles = LAYOUT_STYLES[finalCategory] || [];
        const compatibleStyles = getImageCompatibleStyles(
          finalCategory,
          availableStyles,
          true
        );
        if (compatibleStyles.length > 0) {
          contentLayout = compatibleStyles[0] as ContentLayoutStyle;
          console.log(
            `[layout-planner] Switched to compatible style "${contentLayout}"`
          );
        } else {
          // No compatible styles - remove image
          slideLayout = "no-image";
          imageSize = "medium";
        }
      }
    }
  }

  // Recalculate narrow space after potential layout changes
  const finalIsNarrowSpace = slideLayout === "image-left" || slideLayout === "image-right";
  
  // Map to legacy layout string
  const legacyLayout = SLIDE_LAYOUT_TO_LEGACY[slideLayout] || "centered";
  
  return {
    slideLayout,
    imageSize,
    imageShape: selectImageShape(input.slideIndex),
    contentLayoutCategory: finalCategory,
    contentLayout,
    legacyLayout,
    isNarrowSpace: finalIsNarrowSpace,
    rasterizeForPptx,
  };
}

/**
 * Plan layout for a single slide
 */
export async function planSlideLayout(input: PlannerInput): Promise<PlannerOutput> {
  if (input.type === "title") {
    return planTitleSlide(input);
  }
  return await planContentSlide(input);
}

/**
 * Plan layouts for all slides with deck-level variety
 */
export async function planDeckLayouts(inputs: PlannerInput[]): Promise<PlannerOutput[]> {
  const outputs: PlannerOutput[] = [];
  let lastCategory: ContentLayoutCategory | null = null;
  let consecutiveSameCategory = 0;
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]!;
    let output = await planSlideLayout(input);
    
    // Deck-level variety: avoid too many consecutive same layouts
    if (output.contentLayoutCategory === lastCategory) {
      consecutiveSameCategory++;
      
      // If 3+ consecutive same category, try to switch
      if (consecutiveSameCategory >= 3 && input.type === "content") {
        // Try alternate categories
        const alternates: ContentLayoutCategory[] = ["bullets", "boxes", "sequence"];
        for (const alt of alternates) {
          if (alt !== lastCategory && isSafeCombination(alt, output.slideLayout, input.bulletCount)) {
            output = await planSlideLayout({ ...input, contentLayoutHint: alt });
            break;
          }
        }
      }
    } else {
      consecutiveSameCategory = 1;
    }
    
    lastCategory = output.contentLayoutCategory;
    outputs.push(output);
  }
  
  return outputs;
}

/**
 * Extract planner input from a slide
 * Now includes content analysis for intelligent layout selection
 */
export function extractPlannerInput(
  slide: {
    type: "title" | "content";
    title?: string;
    bulletPoints?: string[];
    semanticIntent?: string;
    visualStrategy?: { pattern?: string };
    assets?: { image?: { required?: boolean } };
    image?: { required?: boolean };
    contentLayoutHint?: string;
  },
  slideIndex: number,
  totalSlides: number
): PlannerInput {
  const bullets = slide.bulletPoints || [];
  const bulletLengths = bullets.map(b => b.split(/\s+/).filter(Boolean).length);
  
  // Perform content analysis for content slides
  let contentAnalysis: ContentAnalysis | undefined;
  if (slide.type === "content" && bullets.length > 0) {
    contentAnalysis = analyzeContent(
      bullets,
      slide.semanticIntent,
      slide.visualStrategy?.pattern
    );
  }
  
  return {
    type: slide.type,
    bulletCount: bullets.length,
    avgBulletLength: bulletLengths.length > 0 
      ? bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length 
      : 0,
    maxBulletLength: bulletLengths.length > 0 
      ? Math.max(...bulletLengths) 
      : 0,
    hasImage: slide.type === "title" 
      ? (slide.image?.required ?? true) 
      : (slide.assets?.image?.required ?? false),
    semanticIntent: slide.semanticIntent,
    visualStrategyPattern: slide.visualStrategy?.pattern,
    contentLayoutHint: slide.contentLayoutHint,
    slideIndex,
    totalSlides,
    // New: Include content analysis, bullet points, and title
    contentAnalysis,
    bulletPoints: bullets,
    title: slide.title,
  };
}


/**
 * Layout Planner - Smart layout selection for slides
 * 
 * Jointly selects image placement (slide layout) and content layout based on:
 * - Content density (bullet count, text length)
 * - Semantic intent and visual strategy hints
 * - Image requirements from outline
 * - Fallback ladder to avoid ugly combinations
 */

import type { SlideLayoutType, ImageSize } from "~/lib/layouts/slide";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import type { SequenceLayoutType } from "~/lib/layouts/content/sequence";
import type { BulletLayoutType } from "~/lib/layouts/content/bullets";
import type { StepsLayoutType } from "~/lib/layouts/content/steps";
import type { QuotesLayoutType } from "~/lib/layouts/content/quotes";
import type { CircleLayoutType } from "~/lib/layouts/content/circles";
import type { ImageLayoutType } from "~/lib/layouts/content/images";

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
}

// Output from the planner
export interface PlannerOutput {
  slideLayout: SlideLayoutType;
  imageSize: ImageSize;
  contentLayoutCategory: ContentLayoutCategory;
  contentLayout: ContentLayoutStyle;
  // For renderer compatibility
  legacyLayout: string; // maps to existing layout variants like "left-content", "right-content"
  // Flags
  isNarrowSpace: boolean; // true when image is left/right (content area is narrow)
  rasterizeForPptx?: boolean; // mark complex layouts for rasterization in PPTX export
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
    contentLayoutCategory: "boxes",
    contentLayout: "box-style-1",
    legacyLayout: input.hasImage ? SLIDE_LAYOUT_TO_LEGACY[slideLayout] : "title-centered",
    isNarrowSpace: input.hasImage,
  };
}

/**
 * Main planner function - chooses layout for a content slide
 */
function planContentSlide(input: PlannerInput): PlannerOutput {
  const density = classifyDensity(input);
  const category = resolveCategory(input.contentLayoutHint);
  
  // Start with preferred image placement based on user preference (Option B)
  // Default to left/right, adapt content layout instead of moving image
  let slideLayout: SlideLayoutType = input.hasImage ? "image-right" : "no-image";
  let imageSize: ImageSize = "medium";
  let finalCategory = category;
  let rasterizeForPptx = false;
  
  // Alternate left/right based on slide index for visual variety
  if (input.hasImage) {
    slideLayout = input.slideIndex % 2 === 0 ? "image-right" : "image-left";
  }
  
  // Apply fallback ladder based on density and safety
  if (input.hasImage) {
    const isNarrow = slideLayout === "image-left" || slideLayout === "image-right";
    
    // Check if current combination is safe
    if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
      // Fallback 1: Switch to simpler content layout (bullets)
      if (density === "high" || !isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
        finalCategory = "bullets";
      }
      
      // Fallback 2: Check again with bullets
      if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
        // Fallback 3: Switch to top/bottom image
        slideLayout = "image-top";
        imageSize = "small";
      }
      
      // Fallback 4: Remove image if still unsafe
      if (!isSafeCombination(finalCategory, slideLayout, input.bulletCount)) {
        slideLayout = "no-image";
      }
    }
    
    // High density with side image: force bullets (Option B preference)
    if (density === "high" && isNarrow) {
      finalCategory = "bullets";
    }
    
    // Circle layouts prefer no-image or top image
    if (finalCategory === "circles") {
      if (isNarrow) {
        slideLayout = "image-top";
        imageSize = "small";
      }
      rasterizeForPptx = true; // Circle layouts are complex for PPTX
    }
  }
  
  // Determine if space is narrow (affects content layout rendering)
  const isNarrowSpace = slideLayout === "image-left" || slideLayout === "image-right";
  
  // Select appropriate style based on space and density
  let contentLayout: ContentLayoutStyle;
  if (isNarrowSpace) {
    contentLayout = getNarrowSpaceStyle(finalCategory, input.bulletCount);
  } else {
    contentLayout = getRandomStyle(finalCategory);
  }
  
  // Map to legacy layout string
  const legacyLayout = SLIDE_LAYOUT_TO_LEGACY[slideLayout] || "centered";
  
  return {
    slideLayout,
    imageSize,
    contentLayoutCategory: finalCategory,
    contentLayout,
    legacyLayout,
    isNarrowSpace,
    rasterizeForPptx,
  };
}

/**
 * Plan layout for a single slide
 */
export function planSlideLayout(input: PlannerInput): PlannerOutput {
  if (input.type === "title") {
    return planTitleSlide(input);
  }
  return planContentSlide(input);
}

/**
 * Plan layouts for all slides with deck-level variety
 */
export function planDeckLayouts(inputs: PlannerInput[]): PlannerOutput[] {
  const outputs: PlannerOutput[] = [];
  let lastCategory: ContentLayoutCategory | null = null;
  let consecutiveSameCategory = 0;
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]!;
    let output = planSlideLayout(input);
    
    // Deck-level variety: avoid too many consecutive same layouts
    if (output.contentLayoutCategory === lastCategory) {
      consecutiveSameCategory++;
      
      // If 3+ consecutive same category, try to switch
      if (consecutiveSameCategory >= 3 && input.type === "content") {
        // Try alternate categories
        const alternates: ContentLayoutCategory[] = ["bullets", "boxes", "sequence"];
        for (const alt of alternates) {
          if (alt !== lastCategory && isSafeCombination(alt, output.slideLayout, input.bulletCount)) {
            output = planSlideLayout({ ...input, contentLayoutHint: alt });
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
 */
export function extractPlannerInput(
  slide: {
    type: "title" | "content";
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
  const bulletLengths = bullets.map(b => b.split(/\s+/).length);
  
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
  };
}


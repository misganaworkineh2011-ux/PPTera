/**
 * Layout Compatibility Rules
 * 
 * This module implements the comprehensive layout compatibility rules from
 * LAYOUT_SYSTEM_REFERENCE.md. It determines which slide layouts (image positions)
 * are compatible with which content layouts, and can override image requirements
 * based on content layout selection.
 * 
 * Key Features:
 * - Enforces compatibility between content layouts and slide layouts
 * - Can override LLM image requirements when content layout is incompatible
 * - Selects optimal image position based on content layout orientation
 * - Provides variety in image positioning for compatible layouts
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";

// ============================================================================
// COMPATIBILITY TYPES
// ============================================================================

/**
 * Compatibility level for a content layout + slide layout combination
 */
export type CompatibilityLevel = "best" | "good" | "caution" | "avoid";

/**
 * Slide layout compatibility definition for a content layout
 */
export interface SlideLayoutCompatibility {
  /** Optimal slide layouts for this content layout */
  best: SlideLayoutType[];
  /** Good slide layouts that work well */
  good: SlideLayoutType[];
  /** Slide layouts that work but with constraints */
  caution: SlideLayoutType[];
  /** Slide layouts to avoid (incompatible) */
  avoid: SlideLayoutType[];
}

/**
 * Content layout characteristics that affect slide layout selection
 */
export interface ContentLayoutCharacteristics {
  /** Whether this layout is compatible with any images */
  supportsImages: boolean;
  /** Whether this layout requires images (like "images" category) */
  requiresImages: boolean;
  /** Orientation preference: horizontal layouts need width, vertical need height */
  orientation: "horizontal" | "vertical" | "flexible";
  /** Whether this layout takes full slide space (no room for side images) */
  fullSlideSpace: boolean;
  /** Specific styles that have different compatibility */
  styleOverrides?: Record<string, Partial<SlideLayoutCompatibility>>;
}

// ============================================================================
// COMPATIBILITY DEFINITIONS
// ============================================================================

/**
 * Complete compatibility definitions for all content layout categories
 * Based on LAYOUT_SYSTEM_REFERENCE.md
 */
export const CONTENT_LAYOUT_COMPATIBILITY: Partial<Record<ContentLayoutCategory, ContentLayoutCharacteristics>> = {
  // ========================================================================
  // BOXES - Card-based layouts, very flexible
  // ========================================================================
  boxes: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible",
    fullSlideSpace: false,
    styleOverrides: {
      "box-style-1": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        avoid: ["image-background", "image-full"],
      },
      "box-style-2": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        avoid: ["image-background", "image-full"],
      },
      "box-style-3": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        caution: [], // Icons need space
        avoid: ["image-background", "image-full"],
      },
      "box-style-4": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        avoid: ["image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // BULLETS - Traditional lists, most flexible
  // ========================================================================
  bullets: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible",
    fullSlideSpace: false,
    styleOverrides: {
      "bullet-style-1": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        avoid: ["image-background"], // Cards need clear background
      },
      "bullet-style-2": {
        best: ["no-image", "image-left", "image-right", "image-top", "image-bottom"],
        good: [],
        caution: ["image-background"], // Ensure text contrast
        avoid: ["image-full"],
      },
      "bullet-style-3": {
        best: ["no-image", "image-top", "image-bottom"],
        good: ["image-left", "image-right"],
        avoid: ["image-background"],
      },
      "bullet-style-4": {
        best: ["no-image", "image-left", "image-right"],
        good: ["image-top", "image-bottom"],
        caution: [], // Vertical layout works best with side images
      },
    },
  },

  // ========================================================================
  // SEQUENCE - Timelines and processes
  // Horizontal styles (1, 2) need width, vertical styles (3, 4) need height
  // ========================================================================
  sequence: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible", // Depends on style
    fullSlideSpace: false,
    styleOverrides: {
      "sequence-style-1": {
        best: ["no-image", "image-top", "image-bottom"],
        caution: ["image-left", "image-right"], // Horizontal - needs width
        avoid: ["image-background", "image-full"],
      },
      "sequence-style-2": {
        best: ["no-image", "image-top", "image-bottom"],
        caution: ["image-left", "image-right"], // Horizontal - needs width
        avoid: ["image-background", "image-full"],
      },
      "sequence-style-3": {
        best: ["no-image", "image-left", "image-right"],
        good: [],
        caution: ["image-top", "image-bottom"], // Vertical - needs height
        avoid: ["image-background", "image-full"],
      },
      "sequence-style-4": {
        best: ["no-image", "image-left", "image-right"],
        good: [],
        caution: ["image-top", "image-bottom"], // Vertical - needs height
        avoid: ["image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // STEPS - Step-by-step guides
  // Pyramid is very restrictive, others vary by orientation
  // ========================================================================
  steps: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible", // Depends on style
    fullSlideSpace: false,
    styleOverrides: {
      "steps-pyramid": { 
        best: ["no-image"],
        good: [],
        caution: ["image-left", "image-right"], // Pyramid needs width
        avoid: ["image-top", "image-bottom", "image-background", "image-full"],
      },
      "steps-arrows": {
        best: ["no-image", "image-left", "image-right"],
        caution: ["image-top", "image-bottom"], // Vertical flow needs height
        avoid: ["image-background", "image-full"],
      },
      "steps-cards": {
        best: ["no-image", "image-top", "image-bottom"],
        caution: ["image-left", "image-right"], // Horizontal layout needs width
        avoid: ["image-background", "image-full"],
      },
      "steps-bars": {
        best: ["no-image", "image-left", "image-right"],
        good: [],
        caution: ["image-top", "image-bottom"], // Bars need vertical space
        avoid: ["image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // QUOTES - Testimonials and statements
  // Full-width design, NEVER compatible with side images
  // ========================================================================
  quotes: {
    supportsImages: false, // Quotes don't work well with images
    requiresImages: false,
    orientation: "horizontal", // Full-width design
    fullSlideSpace: true,
    styleOverrides: {
      "quote-bubble": {
        best: ["no-image"],
        caution: ["image-top", "image-bottom"], // Bubbles need space
        avoid: ["image-left", "image-right", "image-background", "image-full"],
      },
      "quote-marks": {
        best: ["no-image"],
        caution: ["image-top", "image-bottom"],
        avoid: ["image-left", "image-right", "image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // CIRCLES - Circular arrangements
  // NEVER compatible with ANY images - takes full slide space
  // ========================================================================
  circles: {
    supportsImages: false,
    requiresImages: false,
    orientation: "flexible",
    fullSlideSpace: true, // Arc/ring takes entire slide
    styleOverrides: {
      "circle-ring": {
        best: ["no-image"],
        avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // IMAGES - Image galleries
  // ALWAYS requires images, provides its own layout
  // ========================================================================
  images: {
    supportsImages: false, // Uses its own images, not slide images
    requiresImages: true, // This category IS the image layout
    orientation: "flexible",
    fullSlideSpace: true, // Gallery takes full space
    styleOverrides: {
      "image-style-1": {
        best: ["no-image"], // Uses multiple content images
        avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
      },
      "image-style-2": {
        best: ["no-image"], // Uses multiple content images
        avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
      },
      "image-style-3": {
        best: ["no-image"], // Uses multiple content images
        avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
      },
      "image-style-4": {
        best: ["no-image"], // Uses multiple content images
        avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
      },
    },
  },

  // ========================================================================
  // NUMBERS - Statistics display (if exists)
  // ========================================================================
  numbers: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible",
    fullSlideSpace: false,
  },

  // ========================================================================
  // SPOTLIGHT - A single big statement; shines as a full-bleed text-over-image
  // ========================================================================
  spotlight: {
    supportsImages: true,
    requiresImages: false,
    orientation: "flexible",
    fullSlideSpace: false,
  },
};

/**
 * Default slide layout compatibility for content layouts
 */
export const DEFAULT_SLIDE_LAYOUT_COMPATIBILITY: Partial<Record<ContentLayoutCategory, SlideLayoutCompatibility>> = {
  boxes: {
    best: ["no-image", "image-top", "image-bottom"],
    good: ["image-left", "image-right"],
    caution: [],
    avoid: ["image-background", "image-full"],
  },
  bullets: {
    best: ["no-image", "image-left", "image-right", "image-top", "image-bottom"],
    good: [],
    caution: ["image-background"],
    avoid: ["image-full"],
  },
  sequence: {
    best: ["no-image"],
    good: ["image-top", "image-bottom", "image-left", "image-right"],
    caution: [],
    avoid: ["image-background", "image-full"],
  },
  steps: {
    best: ["no-image"],
    good: ["image-left", "image-right", "image-top", "image-bottom"],
    caution: [],
    avoid: ["image-background", "image-full"],
  },
  quotes: {
    best: ["no-image"],
    good: [],
    caution: ["image-top", "image-bottom"],
    avoid: ["image-left", "image-right", "image-background", "image-full"],
  },
  circles: {
    best: ["no-image"],
    good: [],
    caution: [],
    avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
  },
  images: {
    best: ["no-image"], // Uses its own images
    good: [],
    caution: [],
    avoid: ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full"],
  },
  numbers: {
    best: ["no-image", "image-top", "image-bottom"],
    good: ["image-left", "image-right"],
    caution: [],
    avoid: ["image-background", "image-full"],
  },
  // Spotlight is a full-width statement, so it only pairs with a full-bleed
  // image (text overlaid on a dramatic photo) — side images would cramp it.
  spotlight: {
    best: ["image-background", "no-image"],
    good: [],
    caution: ["image-top", "image-bottom"],
    avoid: ["image-left", "image-right", "image-full"],
  },
};

// ============================================================================
// FALLBACKS FOR UNREGISTERED CATEGORIES
// ============================================================================

/**
 * Fallback used when a content layout category has no explicit entry in the
 * tables above (e.g. newer categories such as callout, checklist, agenda,
 * definitionlist, bento, timeline, spotlight, pyramid, matrix, table, dashboard,
 * team, icongrid, hubspoke, cycle, showcase, roadmap, zigzag). Treated as a
 * flexible, image-friendly layout so that (a) lookups never crash on an
 * undefined entry and (b) a requested image is never silently dropped — it gets
 * a sensible side/top placement instead. Diagram-style new categories still end
 * up image-free because the outline sets image.required = false for them, which
 * short-circuits before these tables are consulted.
 */
const FALLBACK_CHARACTERISTICS: ContentLayoutCharacteristics = {
  supportsImages: true,
  requiresImages: false,
  orientation: "flexible",
  fullSlideSpace: false,
};

const FALLBACK_SLIDE_LAYOUT_COMPATIBILITY: SlideLayoutCompatibility = {
  best: ["no-image", "image-left", "image-right", "image-top", "image-bottom"],
  good: [],
  caution: ["image-background"],
  avoid: ["image-full"],
};

// ============================================================================
// COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Get the compatibility level for a content layout + slide layout combination
 * 
 * @param contentLayout - The content layout category
 * @param slideLayout - The slide layout type
 * @param contentStyle - Optional specific style within the category
 * @returns Compatibility level
 */
export function getCompatibilityLevel(
  contentLayout: ContentLayoutCategory,
  slideLayout: SlideLayoutType,
  contentStyle?: string
): CompatibilityLevel {
  const compatibility = DEFAULT_SLIDE_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_SLIDE_LAYOUT_COMPATIBILITY;
  const characteristics = CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS;
  
  // Check for style-specific overrides
  if (contentStyle && characteristics.styleOverrides?.[contentStyle]) {
    const styleOverride = characteristics.styleOverrides[contentStyle];
    if (styleOverride.avoid?.includes(slideLayout)) return "avoid";
    if (styleOverride.caution?.includes(slideLayout)) return "caution";
    if (styleOverride.good?.includes(slideLayout)) return "good";
    if (styleOverride.best?.includes(slideLayout)) return "best";
  }
  
  // Check default compatibility
  if (compatibility.avoid.includes(slideLayout)) return "avoid";
  if (compatibility.caution.includes(slideLayout)) return "caution";
  if (compatibility.good.includes(slideLayout)) return "good";
  if (compatibility.best.includes(slideLayout)) return "best";
  
  // Default to caution if not explicitly defined
  return "caution";
}

/**
 * Check if a content layout is compatible with having images
 * 
 * @param contentLayout - The content layout category
 * @returns Whether images are supported
 */
export function isImageCompatible(contentLayout: ContentLayoutCategory): boolean {
  return (CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS).supportsImages;
}

/**
 * Check if a content layout requires images
 * 
 * @param contentLayout - The content layout category
 * @returns Whether images are required
 */
export function requiresImages(contentLayout: ContentLayoutCategory): boolean {
  return (CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS).requiresImages;
}

/**
 * Get the best slide layouts for a content layout
 * 
 * @param contentLayout - The content layout category
 * @param contentStyle - Optional specific style
 * @returns Array of best slide layouts
 */
export function getBestSlideLayouts(
  contentLayout: ContentLayoutCategory,
  contentStyle?: string
): SlideLayoutType[] {
  const compatibility = DEFAULT_SLIDE_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_SLIDE_LAYOUT_COMPATIBILITY;
  const characteristics = CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS;
  
  // Check for style-specific overrides
  if (contentStyle && characteristics.styleOverrides?.[contentStyle]?.best) {
    return characteristics.styleOverrides[contentStyle].best!;
  }
  
  return compatibility.best;
}

/**
 * Get all compatible slide layouts for a content layout (best + good)
 * 
 * @param contentLayout - The content layout category
 * @param contentStyle - Optional specific style
 * @returns Array of compatible slide layouts
 */
export function getCompatibleSlideLayouts(
  contentLayout: ContentLayoutCategory,
  contentStyle?: string
): SlideLayoutType[] {
  const compatibility = DEFAULT_SLIDE_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_SLIDE_LAYOUT_COMPATIBILITY;
  const characteristics = CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS;
  
  let best = [...compatibility.best];
  let good = [...compatibility.good];
  
  // Apply style-specific overrides
  if (contentStyle && characteristics.styleOverrides?.[contentStyle]) {
    const override = characteristics.styleOverrides[contentStyle];
    if (override.best) best = override.best;
    if (override.good) good = override.good;
    
    // Remove any layouts that are in avoid for this style
    if (override.avoid) {
      best = best.filter(l => !override.avoid!.includes(l));
      good = good.filter(l => !override.avoid!.includes(l));
    }
  }
  
  return [...best, ...good];
}

// ============================================================================
// SLIDE LAYOUT SELECTION
// ============================================================================

/**
 * Result of slide layout determination
 */
export interface SlideLayoutResult {
  /** The selected slide layout */
  slideLayout: SlideLayoutType;
  /** Whether the original image requirement was overridden */
  imageOverridden: boolean;
  /** Reason for the selection */
  reason: string;
  /** Recommended image size (if applicable) */
  imageSize?: ImageSize;
  /** Recommended image shape (if applicable) */
  imageShape?: ImageShape;
}

/**
 * Determine the optimal slide layout based on content layout and image requirements
 * 
 * This is the main function that implements all compatibility rules.
 * It can override LLM image requirements when the content layout is incompatible.
 * 
 * @param contentLayout - The selected content layout category
 * @param contentStyle - The specific style within the category
 * @param hasImageRequested - Whether the LLM requested an image
 * @param previousSlideLayouts - Previous slide layouts for variety
 * @returns Complete slide layout result with potential overrides
 */
export function determineOptimalSlideLayout(
  contentLayout: ContentLayoutCategory,
  contentStyle: string,
  hasImageRequested: boolean,
  previousSlideLayouts: SlideLayoutType[] = []
): SlideLayoutResult {
  console.log(`[determineOptimalSlideLayout] INPUT: category=${contentLayout}, style=${contentStyle}, hasImage=${hasImageRequested}`);
  const characteristics = CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS;
  
  // ========================================================================
  // RULE 1: CIRCLES - NEVER compatible with images
  // ========================================================================
  if (contentLayout === "circles") {
    return {
      slideLayout: "no-image",
      imageOverridden: hasImageRequested,
      reason: "Circles layout takes full slide space and is never compatible with images",
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 2: IMAGES category - Uses its own images, no slide images
  // ========================================================================
  if (contentLayout === "images") {
    return {
      slideLayout: "no-image",
      imageOverridden: hasImageRequested,
      reason: "Images layout provides its own image gallery, no slide-level image needed",
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 3: QUOTES - Never compatible with side images
  // ========================================================================
  if (contentLayout === "quotes") {
    if (hasImageRequested) {
      // Quotes can work with top/bottom images with caution
      return {
        slideLayout: "no-image", // Prefer no image for quotes
        imageOverridden: true,
        reason: "Quotes layout is full-width and works best without images",
        imageSize: undefined,
        imageShape: undefined,
      };
    }
    return {
      slideLayout: "no-image",
      imageOverridden: false,
      reason: "Quotes layout uses full-width design",
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 4: STEPS-PYRAMID - Only works with no-image
  // ========================================================================
  if (contentStyle === "steps-pyramid") {
    return {
      slideLayout: "no-image",
      imageOverridden: hasImageRequested,
      reason: "Pyramid layout requires full slide width and is incompatible with images",
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 5: No image requested - return no-image
  // ========================================================================
  if (!hasImageRequested) {
    return {
      slideLayout: "no-image",
      imageOverridden: false,
      reason: "No image requested for this slide",
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 6: Full slide space layouts - Override image
  // ========================================================================
  if (characteristics.fullSlideSpace) {
    return {
      slideLayout: "no-image",
      imageOverridden: true,
      reason: `${contentLayout} layout takes full slide space`,
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 7: Select optimal image position based on content layout
  // ========================================================================
  
  // Get compatible layouts
  const compatibleLayouts = getCompatibleSlideLayouts(contentLayout, contentStyle);
  
  // Filter out no-image since we want an image
  const imageLayouts = compatibleLayouts.filter(l => l !== "no-image");
  
  if (imageLayouts.length === 0) {
    // No compatible image layouts
    return {
      slideLayout: "no-image",
      imageOverridden: true,
      reason: `No compatible image positions for ${contentLayout} layout`,
      imageSize: undefined,
      imageShape: undefined,
    };
  }
  
  // ========================================================================
  // RULE 8: Apply orientation-based preferences
  // ========================================================================
  
  let preferredLayouts: SlideLayoutType[] = imageLayouts;
  
  // Check for style-specific orientation
  if (contentStyle) {
    // Horizontal styles (style-1, style-2) prefer top/bottom images
    if (contentStyle.includes("style-1") || contentStyle.includes("style-2")) {
      if (contentLayout === "sequence" || contentLayout === "steps") {
        // These horizontal styles need width
        preferredLayouts = imageLayouts.filter(l => 
          l === "image-top" || l === "image-bottom"
        );
      }
    }
    // Vertical styles (style-3, style-4) prefer left/right images
    else if (contentStyle.includes("style-3") || contentStyle.includes("style-4")) {
      if (contentLayout === "sequence" || contentLayout === "steps") {
        // These vertical styles need height
        preferredLayouts = imageLayouts.filter(l => 
          l === "image-left" || l === "image-right"
        );
      }
    }
  }
  
  // ========================================================================
  // RULE 8.5: Default preferences by content layout
  // Most layouts work better with side images (left/right) than top/bottom
  // ========================================================================
  
  if (preferredLayouts.length === imageLayouts.length) {
    // No style-specific preference was applied, use content layout defaults
    
    if (contentLayout === "boxes" || contentLayout === "bullets") {
      // Boxes and bullets work well with side images
      // Prefer left/right, but top/bottom are acceptable
      const sideImages = imageLayouts.filter(l => l === "image-left" || l === "image-right");
      if (sideImages.length > 0) {
        preferredLayouts = sideImages;
      }
    } else if (contentLayout === "numbers") {
      // Numbers work well with side images
      const sideImages = imageLayouts.filter(l => l === "image-left" || l === "image-right");
      if (sideImages.length > 0) {
        preferredLayouts = sideImages;
      }
    }
    // For sequence and steps without style-specific rules, prefer side images
    else if (contentLayout === "sequence" || contentLayout === "steps") {
      const sideImages = imageLayouts.filter(l => l === "image-left" || l === "image-right");
      if (sideImages.length > 0) {
        preferredLayouts = sideImages;
      }
    }
  }
  
  // Fallback to all compatible if no preferred
  if (preferredLayouts.length === 0) {
    preferredLayouts = imageLayouts;
  }
  
  // ========================================================================
  // RULE 9: Avoid repeating the previous slide's image position
  // Inhibit whatever image layout the immediately-previous slide used so two
  // consecutive image slides never sit in the same spot, then pick randomly
  // from the remaining candidates.
  // ========================================================================

  const previousLayout =
    previousSlideLayouts.length > 0
      ? previousSlideLayouts[previousSlideLayouts.length - 1]
      : undefined;

  let selectedLayout: SlideLayoutType;

  // Filter out the previous slide's image layout when alternatives remain.
  let candidateLayouts = preferredLayouts;
  if (
    previousLayout &&
    previousLayout !== "no-image" &&
    preferredLayouts.length > 1
  ) {
    const filtered = preferredLayouts.filter((l) => l !== previousLayout);
    if (filtered.length > 0) {
      candidateLayouts = filtered;
    }
  }

  // Random selection from candidate layouts
  if (candidateLayouts.length > 1) {
    const randomIndex = Math.floor(Math.random() * candidateLayouts.length);
    selectedLayout = candidateLayouts[randomIndex]!;
    console.log(
      `[determineOptimalSlideLayout] Random selection: chose ${selectedLayout} from [${candidateLayouts.join(", ")}]${previousLayout && previousLayout !== "no-image" ? ` (avoided ${previousLayout})` : ""}`,
    );
  } else {
    selectedLayout = candidateLayouts[0]!;
    console.log(`[determineOptimalSlideLayout] Single option: ${selectedLayout}`);
  }
  
  // ========================================================================
  // RULE 10: Determine image size and shape
  // ========================================================================

  let imageSize: ImageSize = "medium";

  // Boxes and bullets work well with medium images
  if (contentLayout === "boxes" || contentLayout === "bullets") {
    imageSize = "medium";
  }

  // Sequence and steps work better with smaller images
  if (contentLayout === "sequence" || contentLayout === "steps") {
    imageSize = "small";
  }

  // Rotate through a curated mix of full-bleed edge shapes and floating design
  // treatments so decks get varied, professional image styling. Keyed to the
  // slide position (previousSlideLayouts.length) for deterministic variety.
  const IMAGE_DESIGN_ROTATION: ImageShape[] = [
    "fade", "frame", "veil", "archway", "wash", "vignette",
    "portal", "meld", "layered", "fade", "splitpanes", "lframe",
    "veil", "contour", "slats", "wash", "window", "duotone",
    "inkblend", "rounded", "organic", "fade", "tilt3d", "hexagon",
  ];
  const imageShape: ImageShape =
    IMAGE_DESIGN_ROTATION[previousSlideLayouts.length % IMAGE_DESIGN_ROTATION.length]!;


  console.log(`[determineOptimalSlideLayout] OUTPUT: slideLayout=${selectedLayout}, imageSize=${imageSize}, imageShape=${imageShape}`);
  
  return {
    slideLayout: selectedLayout,
    imageOverridden: false,
    reason: `Selected ${selectedLayout} for ${contentLayout} (${contentStyle}) based on compatibility rules`,
    imageSize,
    imageShape,
  };
}

/**
 * Check if a slide layout should be rejected for a content layout
 * 
 * @param contentLayout - The content layout category
 * @param slideLayout - The proposed slide layout
 * @param contentStyle - Optional specific style
 * @returns Whether the combination should be rejected
 */
export function shouldRejectSlideLayout(
  contentLayout: ContentLayoutCategory,
  slideLayout: SlideLayoutType,
  contentStyle?: string
): boolean {
  const level = getCompatibilityLevel(contentLayout, slideLayout, contentStyle);
  return level === "avoid";
}

/**
 * Get a human-readable explanation of why a slide layout was selected or rejected
 * 
 * @param contentLayout - The content layout category
 * @param slideLayout - The slide layout
 * @param contentStyle - Optional specific style
 * @returns Explanation string
 */
export function getCompatibilityExplanation(
  contentLayout: ContentLayoutCategory,
  slideLayout: SlideLayoutType,
  contentStyle?: string
): string {
  const level = getCompatibilityLevel(contentLayout, slideLayout, contentStyle);
  const characteristics = CONTENT_LAYOUT_COMPATIBILITY[contentLayout] ?? FALLBACK_CHARACTERISTICS;
  
  switch (level) {
    case "best":
      return `${slideLayout} is optimal for ${contentLayout} layout`;
    case "good":
      return `${slideLayout} works well with ${contentLayout} layout`;
    case "caution":
      if (characteristics.orientation === "horizontal") {
        return `${slideLayout} may constrain width needed by ${contentLayout} layout`;
      }
      if (characteristics.orientation === "vertical") {
        return `${slideLayout} may constrain height needed by ${contentLayout} layout`;
      }
      return `${slideLayout} works but with some constraints for ${contentLayout} layout`;
    case "avoid":
      if (characteristics.fullSlideSpace) {
        return `${contentLayout} layout takes full slide space, incompatible with ${slideLayout}`;
      }
      if (!characteristics.supportsImages) {
        return `${contentLayout} layout does not support images`;
      }
      return `${slideLayout} is incompatible with ${contentLayout} layout`;
    default:
      return `Unknown compatibility for ${contentLayout} + ${slideLayout}`;
  }
}

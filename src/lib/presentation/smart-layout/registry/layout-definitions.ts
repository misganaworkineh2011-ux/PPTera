/**
 * Layout Definitions
 * 
 * Defines all layout categories with their capacity constraints, affinity scores,
 * and compatibility rules for the smart layout selection system.
 */

import {
  type LayoutDefinition,
  BulletPattern,
  ContentType,
} from "../types";

/**
 * Complete registry of all layout definitions
 * 
 * Each layout includes:
 * - Capacity constraints (bullet count, density, image support)
 * - Content type affinity scores (which content types work well)
 * - Pattern affinity scores (which structural patterns work well)
 * - Semantic intent compatibility
 * - Visual strategy compatibility
 * - Priority level
 * - Available style variations
 */
export const LAYOUT_DEFINITIONS: LayoutDefinition[] = [
  // ============================================================================
  // BOXES LAYOUT
  // ============================================================================
  {
    category: "boxes",
    name: "Boxes",
    description: "Card-based layout for distinct concepts, features, or benefits",
    
    capacity: {
      bulletCount: { min: 2, max: 6 },
      avgBulletLength: { min: 5, max: 30 },
      maxBulletLength: { min: 10, max: 50 },
      density: "medium",
      supportsImage: true,
      spaceRequirement: "narrow-compatible",
    },
    
    contentTypeAffinity: {
      [ContentType.FEATURES]: 1.8,
      [ContentType.CATEGORIES]: 1.7,
      [ContentType.COMPARISON]: 1.5,
      [ContentType.STATISTICS]: 1.3,
      [ContentType.GENERIC]: 1.2,
    },
    
    patternAffinity: {
      [BulletPattern.DISTINCT_CONCEPTS]: 1.8,
      [BulletPattern.CATEGORICAL]: 1.6,
      [BulletPattern.COMPARISON]: 1.5,
      [BulletPattern.SIMPLE_LIST]: 1.2,
    },
    
    semanticIntentCompatibility: ["inform", "emphasize", "compare", "analyze"],
    
    visualStrategyCompatibility: {
      primary: ["text-focused", "mixed", "diagram"],
      pattern: ["cards", "grid", "split"],
      emphasis: ["clarity", "contrast", "scale"],
    },
    
    priority: "high",
    
    styles: [
      {
        id: "box-style-1",
        name: "2-Column Grid",
        description: "Two equal columns for balanced comparison",
        idealBulletCount: 2,
        bulletCountRange: { min: 2, max: 2 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "box-style-2",
        name: "3-Column Grid",
        description: "Three columns for feature trios",
        idealBulletCount: 3,
        bulletCountRange: { min: 3, max: 3 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "box-style-3",
        name: "2x2 Grid",
        description: "Four-box grid for balanced presentation",
        idealBulletCount: 4,
        bulletCountRange: { min: 4, max: 4 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "box-style-4",
        name: "Flexible Grid",
        description: "Adaptive grid for 5-6 items",
        bulletCountRange: { min: 5, max: 6 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "professional",
      },
    ],
  },

  // ============================================================================
  // BULLETS LAYOUT
  // ============================================================================
  {
    category: "bullets",
    name: "Bullets",
    description: "Traditional bullet point list for detailed information",
    
    capacity: {
      bulletCount: { min: 3, max: 8 },
      avgBulletLength: { min: 10, max: 60 },
      maxBulletLength: { min: 20, max: 100 },
      density: "high",
      supportsImage: true,
      spaceRequirement: "narrow-compatible",
    },
    
    contentTypeAffinity: {
      [ContentType.GENERIC]: 1.5,
      [ContentType.HOW_TO]: 1.3,
      [ContentType.FEATURES]: 1.2,
      [ContentType.CATEGORIES]: 1.2,
    },
    
    patternAffinity: {
      [BulletPattern.SIMPLE_LIST]: 1.8,
      [BulletPattern.DISTINCT_CONCEPTS]: 1.4,
      [BulletPattern.CATEGORICAL]: 1.3,
      [BulletPattern.INSTRUCTIONAL]: 1.2,
    },
    
    semanticIntentCompatibility: ["inform", "instruct", "analyze"],
    
    visualStrategyCompatibility: {
      primary: ["text-focused", "mixed"],
      pattern: ["cards", "grid"],
      emphasis: ["clarity", "hierarchy"],
    },
    
    priority: "fallback",
    
    styles: [
      {
        id: "bullet-style-1",
        name: "Standard List",
        description: "Classic bullet point list",
        bulletCountRange: { min: 3, max: 8 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "light",
        formality: "professional",
      },
      {
        id: "bullet-style-2",
        name: "Compact List",
        description: "Tighter spacing for more items",
        bulletCountRange: { min: 5, max: 8 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "bullet-style-3",
        name: "Spacious List",
        description: "More breathing room for fewer items",
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "light",
        formality: "casual",
      },
    ],
  },

  // ============================================================================
  // SEQUENCE LAYOUT
  // ============================================================================
  {
    category: "sequence",
    name: "Sequence",
    description: "Numbered sequence or timeline for ordered progression",
    
    capacity: {
      bulletCount: { min: 3, max: 6 },
      avgBulletLength: { min: 5, max: 25 },
      maxBulletLength: { min: 10, max: 40 },
      density: "medium",
      supportsImage: true, // Changed: sequence layouts can work with images (timeline visuals)
      spaceRequirement: "full-width-only",
    },
    
    contentTypeAffinity: {
      [ContentType.TIMELINE]: 2.0,
      [ContentType.PROCESS]: 1.9,
      [ContentType.STEPS]: 1.8,
      [ContentType.HOW_TO]: 1.5,
    },
    
    patternAffinity: {
      [BulletPattern.SEQUENTIAL]: 2.0,
      [BulletPattern.NUMBERED_STEPS]: 1.9,
      [BulletPattern.INSTRUCTIONAL]: 1.5,
    },
    
    semanticIntentCompatibility: ["narrate", "instruct", "inform", "emphasize"], // Added "emphasize" for timeline emphasis
    
    visualStrategyCompatibility: {
      primary: ["diagram", "mixed", "image"], // Added "image" - timelines often have images
      pattern: ["flow", "timeline", "cards"],
      emphasis: ["progression", "hierarchy", "clarity"], // Added "clarity"
    },
    
    priority: "high",
    
    styles: [
      {
        id: "sequence-style-1",
        name: "Horizontal Timeline",
        description: "Left-to-right progression",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "sequence-style-2",
        name: "Vertical Flow",
        description: "Top-to-bottom progression",
        bulletCountRange: { min: 3, max: 6 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "sequence-style-3",
        name: "Stepped Progression",
        description: "Staircase-style advancement",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "formal",
      },
    ],
  },

  // ============================================================================
  // STEPS LAYOUT
  // ============================================================================
  {
    category: "steps",
    name: "Steps",
    description: "Step-by-step process flow with clear progression",
    
    capacity: {
      bulletCount: { min: 3, max: 5 },
      avgBulletLength: { min: 5, max: 30 },
      maxBulletLength: { min: 10, max: 50 },
      density: "medium",
      supportsImage: true,
      spaceRequirement: "full-width-only",
    },
    
    contentTypeAffinity: {
      [ContentType.HOW_TO]: 2.0,
      [ContentType.STEPS]: 2.0,
      [ContentType.PROCESS]: 1.8,
      [ContentType.TIMELINE]: 1.4,
    },
    
    patternAffinity: {
      [BulletPattern.NUMBERED_STEPS]: 2.0,
      [BulletPattern.INSTRUCTIONAL]: 1.9,
      [BulletPattern.SEQUENTIAL]: 1.7,
    },
    
    semanticIntentCompatibility: ["instruct", "demonstrate", "inform"],
    
    visualStrategyCompatibility: {
      primary: ["diagram", "mixed"],
      pattern: ["flow", "cards"],
      emphasis: ["progression", "clarity"],
    },
    
    priority: "high",
    
    styles: [
      {
        id: "steps-style-1",
        name: "Numbered Steps",
        description: "Clear numbered progression",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "steps-style-2",
        name: "Icon Steps",
        description: "Steps with icon indicators",
        idealBulletCount: 3,
        bulletCountRange: { min: 3, max: 4 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "casual",
      },
      {
        id: "steps-style-3",
        name: "Detailed Steps",
        description: "Steps with more description space",
        idealBulletCount: 3,
        bulletCountRange: { min: 3, max: 4 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "professional",
      },
    ],
  },

  // ============================================================================
  // QUOTES LAYOUT
  // ============================================================================
  {
    category: "quotes",
    name: "Quotes",
    description: "Quote or testimonial layout with emphasis",
    
    capacity: {
      bulletCount: { min: 1, max: 3 },
      avgBulletLength: { min: 15, max: 80 },
      maxBulletLength: { min: 30, max: 150 },
      density: "low",
      supportsImage: true,
      spaceRequirement: "narrow-compatible",
    },
    
    contentTypeAffinity: {
      [ContentType.TESTIMONIAL]: 2.0,
      [ContentType.GENERIC]: 1.0,
    },
    
    patternAffinity: {
      [BulletPattern.QUOTED_TEXT]: 2.0,
      [BulletPattern.SIMPLE_LIST]: 1.0,
    },
    
    semanticIntentCompatibility: ["emphasize", "narrate", "inform"],
    
    visualStrategyCompatibility: {
      primary: ["text-focused", "image"],
      pattern: ["spotlight", "split"],
      emphasis: ["scale", "contrast"],
    },
    
    priority: "medium",
    
    styles: [
      {
        id: "quote-style-1",
        name: "Centered Quote",
        description: "Large centered quotation",
        idealBulletCount: 1,
        bulletCountRange: { min: 1, max: 1 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "light",
        formality: "professional",
      },
      {
        id: "quote-style-2",
        name: "Quote with Attribution",
        description: "Quote with author details",
        idealBulletCount: 1,
        bulletCountRange: { min: 1, max: 2 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "quote-style-3",
        name: "Multiple Quotes",
        description: "Several short quotes or testimonials",
        idealBulletCount: 3,
        bulletCountRange: { min: 2, max: 3 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "casual",
      },
    ],
  },

  // ============================================================================
  // CIRCLES LAYOUT
  // ============================================================================
  {
    category: "circles",
    name: "Circles",
    description: "Circular arrangement for interconnected concepts or cycles",
    
    capacity: {
      bulletCount: { min: 3, max: 6 },
      avgBulletLength: { min: 3, max: 20 },
      maxBulletLength: { min: 5, max: 30 },
      density: "low",
      supportsImage: false,
      spaceRequirement: "full-width-only",
    },
    
    contentTypeAffinity: {
      [ContentType.CYCLE]: 2.0,
      [ContentType.PROCESS]: 1.6,
      [ContentType.CATEGORIES]: 1.5,
      [ContentType.FEATURES]: 1.4,
    },
    
    patternAffinity: {
      [BulletPattern.DISTINCT_CONCEPTS]: 1.7,
      [BulletPattern.CATEGORICAL]: 1.6,
      [BulletPattern.SEQUENTIAL]: 1.4,
    },
    
    semanticIntentCompatibility: ["inform", "emphasize", "analyze"],
    
    visualStrategyCompatibility: {
      primary: ["diagram", "mixed"],
      pattern: ["cards", "grid"],
      emphasis: ["relationship", "clarity"],
    },
    
    priority: "medium",
    
    styles: [
      {
        id: "circle-style-1",
        name: "Circular Flow",
        description: "Items arranged in a circle",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 6 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "circle-style-2",
        name: "Icon Circles",
        description: "Circles with icon emphasis",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "casual",
      },
      {
        id: "circle-style-3",
        name: "Connected Circles",
        description: "Circles with connecting lines",
        idealBulletCount: 4,
        bulletCountRange: { min: 3, max: 5 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "professional",
      },
    ],
  },

  // ============================================================================
  // NUMBERS LAYOUT
  // ============================================================================
  {
    category: "numbers",
    name: "Numbers",
    description: "Big statistics or metrics display with emphasis",
    
    capacity: {
      bulletCount: { min: 2, max: 4 },
      avgBulletLength: { min: 3, max: 15 },
      maxBulletLength: { min: 5, max: 25 },
      density: "low",
      supportsImage: false,
      spaceRequirement: "narrow-compatible",
    },
    
    contentTypeAffinity: {
      [ContentType.STATISTICS]: 2.0,
      [ContentType.FEATURES]: 1.3,
      [ContentType.COMPARISON]: 1.2,
    },
    
    patternAffinity: {
      [BulletPattern.NUMERIC]: 2.0,
      [BulletPattern.DISTINCT_CONCEPTS]: 1.3,
    },
    
    semanticIntentCompatibility: ["emphasize", "inform", "compare"],
    
    visualStrategyCompatibility: {
      primary: ["text-focused", "diagram"],
      pattern: ["spotlight", "grid", "cards"],
      emphasis: ["scale", "contrast"],
    },
    
    priority: "medium",
    
    styles: [
      {
        id: "number-style-1",
        name: "Big Numbers",
        description: "Large prominent statistics",
        idealBulletCount: 3,
        bulletCountRange: { min: 2, max: 4 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "heavy",
        formality: "professional",
      },
      {
        id: "number-style-2",
        name: "Metric Cards",
        description: "Numbers in card format",
        idealBulletCount: 3,
        bulletCountRange: { min: 2, max: 4 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
      {
        id: "number-style-3",
        name: "Comparison Numbers",
        description: "Side-by-side metric comparison",
        idealBulletCount: 2,
        bulletCountRange: { min: 2, max: 3 },
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "formal",
      },
    ],
  },

  // ============================================================================
  // IMAGES LAYOUT
  // ============================================================================
  {
    category: "images",
    name: "Images",
    description: "Image gallery or grid layout with visual focus",
    
    capacity: {
      bulletCount: { min: 1, max: 6 },
      avgBulletLength: { min: 3, max: 20 },
      maxBulletLength: { min: 5, max: 35 },
      density: "low",
      requiresImage: true,
      supportsImage: true,
      spaceRequirement: "full-width-only",
    },
    
    contentTypeAffinity: {
      [ContentType.FEATURES]: 1.5,
      [ContentType.CATEGORIES]: 1.4,
      [ContentType.COMPARISON]: 1.3,
      [ContentType.GENERIC]: 1.0,
    },
    
    patternAffinity: {
      [BulletPattern.DISTINCT_CONCEPTS]: 1.5,
      [BulletPattern.CATEGORICAL]: 1.4,
      [BulletPattern.SIMPLE_LIST]: 1.2,
    },
    
    semanticIntentCompatibility: ["inform", "emphasize", "demonstrate"],
    
    visualStrategyCompatibility: {
      primary: ["image", "mixed"],
      pattern: ["grid", "cards", "spotlight"],
      emphasis: ["scale", "clarity"],
    },
    
    priority: "low",
    
    styles: [
      {
        id: "image-style-1",
        name: "Single Hero Image",
        description: "One large prominent image",
        idealBulletCount: 1,
        bulletCountRange: { min: 1, max: 1 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "professional",
      },
      {
        id: "image-style-2",
        name: "Image Grid",
        description: "Multiple images in grid",
        idealBulletCount: 4,
        bulletCountRange: { min: 2, max: 6 },
        spaceRequirement: "full-width-only",
        visualWeight: "heavy",
        formality: "casual",
      },
      {
        id: "image-style-3",
        name: "Image with Captions",
        description: "Images with descriptive text",
        idealBulletCount: 3,
        bulletCountRange: { min: 2, max: 4 },
        spaceRequirement: "full-width-only",
        visualWeight: "medium",
        formality: "professional",
      },
    ],
  },
];

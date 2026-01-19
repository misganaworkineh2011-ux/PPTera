/**
 * Type definitions for Smart Layout Selection System
 * 
 * This file contains all interfaces, types, and enums used throughout
 * the smart layout selection system.
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Bullet point structural patterns detected in content
 */
export enum BulletPattern {
  NUMBERED_STEPS = "numbered-steps",
  QUOTED_TEXT = "quoted-text",
  NUMERIC = "numeric",
  SEQUENTIAL = "sequential",
  INSTRUCTIONAL = "instructional",
  DISTINCT_CONCEPTS = "distinct-concepts",
  COMPARISON = "comparison",
  CATEGORICAL = "categorical",
  SIMPLE_LIST = "simple-list",
}

/**
 * Content type classifications
 */
export enum ContentType {
  TIMELINE = "TIMELINE",
  PROCESS = "PROCESS",
  FEATURES = "FEATURES",
  STATISTICS = "STATISTICS",
  HOW_TO = "HOW_TO",
  COMPARISON = "COMPARISON",
  TESTIMONIAL = "TESTIMONIAL",
  CATEGORIES = "CATEGORIES",
  STEPS = "STEPS",
  CYCLE = "CYCLE",
  GENERIC = "GENERIC",
}

/**
 * Semantic markers found in content
 */
export enum SemanticMarkers {
  TIMELINE = "timeline",
  PROCESS = "process",
  STATISTICS = "statistics",
  QUOTES = "quotes",
  COMPARISONS = "comparisons",
  INSTRUCTIONS = "instructions",
  CATEGORIES = "categories",
  FEATURES = "features",
  STEPS = "steps",
  CYCLE = "cycle",
}

// ============================================================================
// METADATA INTERFACES
// ============================================================================

/**
 * Visual strategy metadata from LLM
 */
export interface VisualStrategy {
  primary: string; // "diagram", "image", "mixed", "text-focused"
  pattern: string; // "cards", "grid", "flow", "split", "spotlight", "pyramid", "timeline"
  emphasis: string; // "progression", "contrast", "relationship", "scale", "hierarchy", "clarity"
}

/**
 * Image asset metadata
 */
export interface ImageAssetMetadata {
  required: boolean;
  orientation: "landscape" | "portrait";
  pexelsPromptHint: string;
  aiPromptHint: string;
}

/**
 * Slide metadata extracted from LLM-generated outline
 */
export interface SlideMetadata {
  semanticIntent: string; // "inform", "compare", "instruct", "emphasize", "narrate"
  visualStrategy: VisualStrategy;
  contentLayoutHint?: string; // Suggested layout category
  assets: {
    image?: ImageAssetMetadata;
  };
}

// ============================================================================
// CONTENT ANALYSIS INTERFACES
// ============================================================================

/**
 * Complete content analysis output
 */
export interface ContentAnalysis {
  // Patterns
  pattern: BulletPattern;
  semanticMarkers: SemanticMarkers[];
  
  // Content type classification
  contentType: ContentType;
  contentTypeConfidence: number; // 0-100
  
  // Metrics
  bulletCount: number;
  avgBulletLength: number;
  maxBulletLength: number;
  totalWordCount: number;
  
  // Structure
  hasSequence: boolean;
  hasDistinctConcepts: boolean;
  hasHierarchy: boolean;
}

// ============================================================================
// LAYOUT DEFINITION INTERFACES
// ============================================================================

/**
 * Layout capacity constraints
 */
export interface LayoutCapacity {
  bulletCount: { min: number; max: number };
  avgBulletLength?: { min: number; max: number };
  maxBulletLength?: { min: number; max: number };
  density: "low" | "medium" | "high";
  requiresImage?: boolean;
  supportsImage: boolean;
  spaceRequirement: "narrow-compatible" | "full-width-only";
}

/**
 * Layout style definition within a category
 */
export interface LayoutStyleDefinition {
  id: string; // e.g., "box-style-1", "sequence-style-2"
  name: string;
  description: string;
  
  // Structure requirements
  idealBulletCount?: number;
  bulletCountRange?: { min: number; max: number };
  
  // Space requirements
  spaceRequirement: "narrow-compatible" | "full-width-only";
  
  // Visual characteristics
  visualWeight: "light" | "medium" | "heavy";
  formality: "casual" | "professional" | "formal";
}

/**
 * Complete layout definition with constraints and scoring rules
 */
export interface LayoutDefinition {
  category: ContentLayoutCategory;
  name: string;
  description: string;
  
  // Capacity constraints
  capacity: LayoutCapacity;
  
  // Content type affinity (which content types work well)
  contentTypeAffinity: {
    [key in ContentType]?: number; // Score multiplier (0-2)
  };
  
  // Pattern affinity (which patterns work well)
  patternAffinity: {
    [key in BulletPattern]?: number; // Score multiplier (0-2)
  };
  
  // Semantic intent compatibility
  semanticIntentCompatibility: string[]; // Compatible intent values
  
  // Visual strategy compatibility
  visualStrategyCompatibility: {
    primary?: string[];
    pattern?: string[];
    emphasis?: string[];
  };
  
  // Priority level
  priority: "high" | "medium" | "low" | "fallback";
  
  // Available styles
  styles: LayoutStyleDefinition[];
}

// ============================================================================
// SCORING INTERFACES
// ============================================================================

/**
 * Input for layout scoring
 */
export interface LayoutScoringInput {
  // From metadata
  semanticIntent: string;
  visualStrategy: VisualStrategy;
  contentLayoutHint?: string;
  hasImage: boolean;
  hasIcon?: boolean;
  
  // From content analysis
  analysis: ContentAnalysis;
  
  // From context
  slidePosition: "first" | "middle" | "last";
  previousLayouts: ContentLayoutCategory[];
  isNarrowSpace: boolean;
}

/**
 * Score breakdown for a layout
 */
export interface ScoreBreakdown {
  contentType: number;
  pattern: number;
  capacity: number;
  semanticIntent: number;
  visualStrategy: number;
  density: number;
  media: number;
  bulletLength: number;
  priority: number;
  confidenceBonus: number;
  repetitionPenalty: number;
}

/**
 * Layout match result with score
 */
export interface LayoutMatch {
  category: ContentLayoutCategory;
  score: number;
  confidence: "high" | "medium" | "low";
  scoreBreakdown: ScoreBreakdown;
  recommendedStyle?: string;
}

// ============================================================================
// SELECTION INTERFACES
// ============================================================================

/**
 * Final layout selection result
 */
export interface LayoutSelection {
  // Layout category
  category: ContentLayoutCategory;
  style: string; // Specific style within category
  
  // Slide layout (image position)
  slideLayout: SlideLayoutType;
  imageSize?: ImageSize;
  imageShape?: ImageShape;
  
  // Metadata
  confidence: "high" | "medium" | "low";
  score: number;
  runnerUps: LayoutMatch[];
  
  // Debugging
  explanation: string;
  factors: string[];
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

/**
 * Layout selection context for tracking presentation flow
 */
export interface LayoutSelectionContext {
  // Current slide
  slideIndex: number;
  totalSlides: number;
  
  // Previous selections
  previousLayouts: Array<{
    slideIndex: number;
    category: ContentLayoutCategory;
    style: string;
    slideLayout?: SlideLayoutType;
  }>;
  
  // Presentation-level context
  presentationTone?: string;
  presentationLanguage?: string;
  themeStyle?: "minimal" | "professional" | "creative";
  
  // Statistics
  categoryUsage: Map<ContentLayoutCategory, number>;
  styleUsage: Map<string, number>;
}

// ============================================================================
// CAPACITY EVALUATION
// ============================================================================

/**
 * Capacity evaluation result
 */
export interface CapacityEvaluation {
  fits: boolean;
  utilization: number; // 0-1 (percentage as decimal)
  reason?: string; // Reason for rejection if doesn't fit
}

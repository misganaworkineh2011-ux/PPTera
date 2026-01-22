/**
 * Layout Scenarios - Scenario-based rules for layout selection
 * 
 * Defines when each layout category should be used based on content characteristics
 */

import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { ContentType, BulletPattern } from "./content-analyzer";

export type ScenarioPriority = "high" | "medium" | "low" | "fallback";

export interface ScenarioCondition {
  contentType?: ContentType[];
  bulletCount?: { min: number; max: number };
  pattern?: BulletPattern[];
  semanticIntent?: string[];
  visualStrategy?: string[];
  density?: "low" | "medium" | "high";
  hasImage?: boolean;
  isNarrowSpace?: boolean;
  avgBulletLength?: { min: number; max: number };
  maxBulletLength?: { min: number; max: number };
  // Negative conditions - when NOT to use this layout
  excludeContentType?: ContentType[];
  excludePattern?: BulletPattern[];
  excludeSemanticIntent?: string[];
  requireAll?: boolean; // If true, ALL conditions must match (stricter)
}

export interface LayoutScenario {
  name: string;
  description: string;
  conditions: ScenarioCondition;
  priority: ScenarioPriority;
  recommendedStyle?: string; // Specific style variant recommendation
}

export type LayoutScenarios = Record<ContentLayoutCategory, LayoutScenario[]>;

/**
 * Comprehensive scenarios for each layout category
 */
export const LAYOUT_SCENARIOS: LayoutScenarios = {
  boxes: [
    {
      name: "Distinct Features/Benefits",
      description: "ONLY when bullets represent distinct features, benefits, or product attributes (NOT sequential, NOT instructions)",
      conditions: {
        contentType: ["FEATURES"],
        bulletCount: { min: 2, max: 6 },
        pattern: ["distinct-concepts"],
        semanticIntent: ["feature", "benefit", "advantage", "characteristic", "attribute", "capability"],
        excludePattern: ["sequential", "instructional", "numbered-steps", "quoted-text"], // Never use for sequential/instructional content
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "box-style-1",
    },
    {
      name: "Category Breakdown",
      description: "ONLY when bullets represent categories, types, or classifications (NOT steps, NOT process)",
      conditions: {
        contentType: ["CATEGORIES"],
        bulletCount: { min: 3, max: 5 },
        pattern: ["categorical", "distinct-concepts"],
        excludePattern: ["sequential", "instructional", "numbered-steps"], // Never use for sequential content
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "box-style-2",
    },
    {
      name: "Comparison Items",
      description: "ONLY when bullets explicitly compare different options, concepts, or alternatives",
      conditions: {
        contentType: ["COMPARISON"],
        bulletCount: { min: 2, max: 4 },
        pattern: ["comparison"],
        semanticIntent: ["vs", "versus", "compared", "difference", "better", "worse"], // Must have comparison keywords
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "box-style-3",
    },
    {
      name: "General Distinct Concepts",
      description: "ONLY when bullets are independent concepts without any sequence, process, or instruction indicators",
      conditions: {
        bulletCount: { min: 2, max: 6 },
        pattern: ["distinct-concepts"],
        density: "low",
        excludePattern: ["sequential", "instructional", "numbered-steps", "quoted-text", "numeric"], // Never use for these
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS", "TESTIMONIAL", "STATISTICS"], // Never use for these
      },
      priority: "medium",
    },
  ],

  sequence: [
    {
      name: "Timeline/Chronological",
      description: "ONLY when bullets represent a timeline with dates, chronological order, or historical progression",
      conditions: {
        contentType: ["TIMELINE"],
        pattern: ["sequential"],
        bulletCount: { min: 3, max: 7 },
        semanticIntent: ["timeline", "chronological", "history", "evolution", "progression", "in 2020", "year"],
        visualStrategy: ["flow", "timeline", "progression"],
        requireAll: true, // Must have sequential pattern AND timeline semantic
        excludePattern: ["instructional", "numbered-steps", "quoted-text"], // Never use for instructions
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "sequence-style-1",
    },
    {
      name: "Process/Workflow",
      description: "ONLY when bullets describe a process, workflow, or pipeline (NOT instructions, NOT steps)",
      conditions: {
        contentType: ["PROCESS"],
        bulletCount: { min: 3, max: 7 },
        pattern: ["sequential"],
        semanticIntent: ["process", "workflow", "pipeline", "procedure", "method"],
        excludePattern: ["instructional", "numbered-steps"], // Never use for instructions
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "sequence-style-2",
    },
    {
      name: "Progression Steps",
      description: "ONLY when bullets show progression, stages, or phases (NOT how-to instructions)",
      conditions: {
        bulletCount: { min: 3, max: 6 },
        pattern: ["sequential"],
        semanticIntent: ["progression", "stages", "phases", "levels"],
        excludePattern: ["instructional", "numbered-steps"], // Never use for instructions
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "sequence-style-3",
    },
  ],

  steps: [
    {
      name: "How-To Guide",
      description: "ONLY when bullets are explicit how-to instructions or tutorial steps (NOT general process)",
      conditions: {
        contentType: ["HOW_TO"],
        bulletCount: { min: 3, max: 6 },
        pattern: ["instructional", "numbered-steps"],
        semanticIntent: ["how-to", "how to", "tutorial", "guide", "instruction", "step"],
        avgBulletLength: { min: 8, max: 25 },
        requireAll: true, // Must have instructional pattern AND how-to semantic
        excludeContentType: ["PROCESS", "TIMELINE", "TESTIMONIAL"], // Never use for these
        excludePattern: ["quoted-text", "numeric"], // Never use for quotes or stats
      },
      priority: "high",
      recommendedStyle: "steps-pyramid",
    },
    {
      name: "Numbered Steps",
      description: "ONLY when bullets are explicitly numbered steps (Step 1, Step 2, #1, #2, etc.)",
      conditions: {
        contentType: ["STEPS"],
        pattern: ["numbered-steps"],
        bulletCount: { min: 3, max: 5 },
        requireAll: true, // Must have numbered-steps pattern
        excludeContentType: ["PROCESS", "TIMELINE", "TESTIMONIAL", "FEATURES"], // Never use for these
        excludePattern: ["quoted-text", "numeric", "distinct-concepts"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "steps-arrows",
    },
    {
      name: "Tutorial Steps",
      description: "ONLY when content is explicitly a step-by-step tutorial with instructional language",
      conditions: {
        bulletCount: { min: 3, max: 7 },
        pattern: ["instructional"],
        semanticIntent: ["tutorial", "guide", "how to", "how-to"],
        excludeContentType: ["PROCESS", "TIMELINE", "TESTIMONIAL", "FEATURES"], // Never use for these
        excludePattern: ["quoted-text", "numeric", "distinct-concepts"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "steps-cards",
    },
  ],

  bullets: [
    {
      name: "Simple List",
      description: "Standard list format for general content",
      conditions: {
        bulletCount: { min: 3, max: 8 },
        density: "medium",
        pattern: ["simple-list"],
      },
      priority: "default",
    },
    {
      name: "High Density Content",
      description: "When content is dense and needs simple list format",
      conditions: {
        bulletCount: { min: 5 },
        density: "high",
        hasImage: true,
        isNarrowSpace: true,
      },
      priority: "fallback",
      recommendedStyle: "bullet-style-4",
    },
    {
      name: "Long Form Content",
      description: "When bullets are longer and need list format",
      conditions: {
        avgBulletLength: { min: 15 },
        bulletCount: { min: 2, max: 6 },
      },
      priority: "medium",
      recommendedStyle: "bullet-style-2",
    },
  ],

  quotes: [
    {
      name: "Testimonials",
      description: "ONLY when bullets are actual testimonials, quotes, or endorsements from people",
      conditions: {
        contentType: ["TESTIMONIAL"],
        pattern: ["quoted-text"],
        bulletCount: { min: 1, max: 2 }, // Very strict - max 2 quotes
        semanticIntent: ["testimonial", "quote", "testimony", "endorsement", "said", "stated"],
        requireAll: true, // ALL conditions must match
        excludeContentType: ["FEATURES", "STATISTICS", "HOW_TO", "STEPS", "PROCESS", "TIMELINE"], // Never use for these
        excludePattern: ["numeric", "instructional", "numbered-steps", "sequential"], // Never use for these patterns
      },
      priority: "high",
      recommendedStyle: "quote-bubble",
    },
    {
      name: "Quoted Statements",
      description: "ONLY when bullets are explicitly quoted statements with quotation marks AND testimonial context",
      conditions: {
        pattern: ["quoted-text"],
        bulletCount: { min: 1, max: 2 }, // Very strict - max 2
        semanticIntent: ["quote", "testimonial", "said", "stated", "according to"], // Must have testimonial context
        requireAll: true, // Pattern AND semantic intent must match
        excludeContentType: ["FEATURES", "STATISTICS", "HOW_TO", "STEPS", "PROCESS", "TIMELINE", "CATEGORIES"], // Never use for these
        excludePattern: ["numeric", "instructional", "numbered-steps", "sequential", "distinct-concepts"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "quote-marks",
    },
  ],

  circles: [
    {
      name: "Circular Relationships",
      description: "ONLY when bullets explicitly represent circular, cyclical, or loop relationships (NOT linear process)",
      conditions: {
        contentType: ["CYCLE"],
        bulletCount: { min: 3, max: 6 },
        semanticIntent: ["cycle", "loop", "circular", "relationship", "repeat", "recurring"],
        visualStrategy: ["circle", "ring", "cycle"],
        requireAll: true, // Must have cycle content type AND semantic intent
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for linear content
        excludePattern: ["instructional", "numbered-steps", "quoted-text"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "circle-ring",
    },
    {
      name: "Recurring Process",
      description: "ONLY when content explicitly describes a recurring, circular, or rotating process",
      conditions: {
        bulletCount: { min: 3, max: 5 },
        semanticIntent: ["repeat", "recurring", "rotation", "circular", "loop"],
        excludeContentType: ["TIMELINE", "PROCESS", "HOW_TO", "STEPS", "TESTIMONIAL"], // Never use for linear content
        excludePattern: ["instructional", "numbered-steps", "quoted-text", "sequential"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "circle-ring",
    },
  ],

  numbers: [
    {
      name: "Statistics/Metrics",
      description: "ONLY when bullets contain statistics, metrics, percentages, or numerical data (NOT general numbers)",
      conditions: {
        contentType: ["STATISTICS"],
        pattern: ["numeric"],
        bulletCount: { min: 2, max: 5 },
        semanticIntent: ["statistic", "metric", "data", "percentage", "kpi", "survey", "research"],
        requireAll: true, // Must have numeric pattern AND statistics semantic
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL", "TIMELINE"], // Never use for these
        excludePattern: ["instructional", "numbered-steps", "quoted-text"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "box-style-1",
    },
    {
      name: "Data Points",
      description: "ONLY when bullets are explicitly data points, KPIs, or statistical metrics",
      conditions: {
        pattern: ["numeric"],
        bulletCount: { min: 2, max: 6 },
        semanticIntent: ["data", "metric", "kpi", "statistic", "percentage"],
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL", "TIMELINE", "PROCESS"], // Never use for these
        excludePattern: ["instructional", "numbered-steps", "quoted-text"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "box-style-2",
    },
  ],

  images: [
    {
      name: "Image Gallery",
      description: "ONLY when content is explicitly about images, photos, or visual gallery (NOT general content with images)",
      conditions: {
        bulletCount: { min: 1, max: 4 },
        semanticIntent: ["gallery", "visual", "image", "photo", "picture", "photography"],
        visualStrategy: ["image", "gallery", "visual"],
        requireAll: true, // Must have image semantic AND visual strategy
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL", "STATISTICS"], // Never use for these
        excludePattern: ["instructional", "numbered-steps", "quoted-text", "numeric"], // Never use for these
      },
      priority: "high",
      recommendedStyle: "image-style-1",
    },
    {
      name: "Visual Showcase",
      description: "ONLY when bullets explicitly describe visual elements, images, or visual content",
      conditions: {
        bulletCount: { min: 2, max: 5 },
        visualStrategy: ["image", "visual", "gallery"],
        semanticIntent: ["visual", "image", "photo", "gallery"],
        excludeContentType: ["HOW_TO", "STEPS", "TESTIMONIAL", "STATISTICS"], // Never use for these
        excludePattern: ["instructional", "numbered-steps", "quoted-text", "numeric"], // Never use for these
      },
      priority: "medium",
      recommendedStyle: "image-style-2",
    },
  ],
};

/**
 * Get all scenarios for a category
 */
export function getScenariosForCategory(category: ContentLayoutCategory): LayoutScenario[] {
  return LAYOUT_SCENARIOS[category] || [];
}

/**
 * Get all scenarios across all categories
 */
export function getAllScenarios(): LayoutScenario[] {
  return Object.values(LAYOUT_SCENARIOS).flat();
}

/**
 * Find scenarios that match given conditions
 */
export function findMatchingScenarios(
  category: ContentLayoutCategory,
  conditions: Partial<ScenarioCondition>
): LayoutScenario[] {
  const scenarios = getScenariosForCategory(category);
  
  return scenarios.filter(scenario => {
    const cond = scenario.conditions;
    
    // Check each condition
    if (conditions.contentType && cond.contentType) {
      if (!conditions.contentType.some(ct => cond.contentType?.includes(ct))) {
        return false;
      }
    }
    
    if (conditions.bulletCount && cond.bulletCount) {
      const { min, max } = cond.bulletCount;
      if (conditions.bulletCount < min || conditions.bulletCount > max) {
        return false;
      }
    }
    
    if (conditions.pattern && cond.pattern) {
      if (!conditions.pattern.some(p => cond.pattern?.includes(p))) {
        return false;
      }
    }
    
    // More conditions can be added here
    
    return true;
  });
}


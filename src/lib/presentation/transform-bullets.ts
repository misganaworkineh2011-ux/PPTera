/**
 * Bullet Point Transformation Utility
 * 
 * Transforms outline bullet points into more engaging presentation content
 * based on semanticIntent and visualStrategy from the outline.
 */

import type { Slide, VisualStrategy, TransformedContent, TransformedBulletItem } from "./types";

/**
 * Transformation rules based on semantic intent
 */
const INTENT_TRANSFORMATIONS: Record<string, (bullets: string[]) => TransformedBulletItem[]> = {
  // Benefits/Importance - Convert to "Concept Label + Explanation"
  "importance": (bullets) => bullets.map((b) => {
    const colonIndex = b.indexOf(":");
    if (colonIndex > 0 && colonIndex < 30) {
      return { label: b.slice(0, colonIndex).trim(), text: b.slice(colonIndex + 1).trim() };
    }
    // Extract first 2-3 words as label
    const words = b.split(" ");
    const labelWords = words.slice(0, Math.min(3, Math.ceil(words.length / 4)));
    return {
      label: labelWords.join(" "),
      text: words.slice(labelWords.length).join(" ") || b,
    };
  }),

  "benefits": (bullets) => bullets.map((b) => {
    const colonIndex = b.indexOf(":");
    if (colonIndex > 0 && colonIndex < 30) {
      return { label: b.slice(0, colonIndex).trim(), text: b.slice(colonIndex + 1).trim() };
    }
    return { text: b };
  }),

  // Process/Steps - Add step labels
  "process": (bullets) => bullets.map((b, i) => ({
    label: `Step ${i + 1}`,
    text: b,
  })),

  "steps": (bullets) => bullets.map((b, i) => ({
    label: `Step ${i + 1}`,
    text: b,
  })),

  // Components - Convert to component name + purpose
  "components": (bullets) => bullets.map((b) => {
    const dashIndex = b.indexOf(" - ");
    const colonIndex = b.indexOf(":");
    const separator = dashIndex > 0 ? dashIndex : colonIndex;
    
    if (separator > 0 && separator < 40) {
      return {
        label: b.slice(0, separator).trim(),
        text: b.slice(separator + (dashIndex > 0 ? 3 : 1)).trim(),
      };
    }
    return { text: b };
  }),

  // Examples - Expand with visual descriptions
  "examples": (bullets) => bullets.map((b) => {
    // Look for example patterns
    if (b.toLowerCase().startsWith("example:") || b.toLowerCase().startsWith("e.g.")) {
      return { label: "Example", text: b.replace(/^(example:|e\.g\.)\s*/i, "") };
    }
    return { text: b };
  }),

  // Tips/Advice - Add context
  "tips": (bullets) => bullets.map((b) => {
    const colonIndex = b.indexOf(":");
    if (colonIndex > 0 && colonIndex < 25) {
      return { label: b.slice(0, colonIndex).trim(), text: b.slice(colonIndex + 1).trim() };
    }
    return { text: b };
  }),

  "advice": (bullets) => bullets.map((b) => ({ text: b })),

  // Framework - Extract framework elements
  "framework": (bullets) => bullets.map((b) => {
    const colonIndex = b.indexOf(":");
    if (colonIndex > 0 && colonIndex < 30) {
      return { label: b.slice(0, colonIndex).trim(), text: b.slice(colonIndex + 1).trim() };
    }
    return { text: b };
  }),

  // Comparison - Highlight contrasts
  "comparison": (bullets) => bullets.map((b) => {
    const vsIndex = b.toLowerCase().indexOf(" vs ");
    if (vsIndex > 0) {
      return { label: "Compare", text: b };
    }
    return { text: b };
  }),

  // Data/Statistics - Emphasize numbers
  "data insight": (bullets) => bullets.map((b) => ({ text: b })),

  // Default transformation
  "default": (bullets) => bullets.map((b) => ({ text: b })),
};

/**
 * Generate an intro paragraph based on slide title and semantic intent
 */
function generateIntro(title: string, intent?: string): string | undefined {
  // Only generate intros for certain intents
  const introIntents = ["importance", "benefits", "overview", "introduction", "concept"];
  
  if (!intent || !introIntents.some(i => intent.toLowerCase().includes(i))) {
    return undefined;
  }

  // Simple intro generation - in production, this could be more sophisticated
  const cleanTitle = title.replace(/[?!.:]+$/, "");
  
  if (intent.includes("importance") || intent.includes("benefits")) {
    return `Understanding ${cleanTitle.toLowerCase()} is essential for success.`;
  }
  
  if (intent.includes("overview") || intent.includes("introduction")) {
    return `Let's explore the key aspects of ${cleanTitle.toLowerCase()}.`;
  }

  return undefined;
}

/**
 * Transform bullet points based on visual strategy pattern
 */
function applyPatternTransformation(
  items: TransformedBulletItem[],
  pattern?: string
): TransformedBulletItem[] {
  if (!pattern) return items;

  const normalizedPattern = pattern.toLowerCase();

  // Spotlight pattern - emphasize first item
  if (normalizedPattern === "spotlight") {
    return items.map((item, i) => ({
      ...item,
      label: i === 0 ? (item.label || "Key Point") : item.label,
    }));
  }

  // Flow/Sequential pattern - add sequence indicators if not present
  if (normalizedPattern === "flow" || normalizedPattern === "stairs") {
    return items.map((item, i) => {
      if (item.label && item.label.startsWith("Step")) return item;
      return { ...item, label: item.label || `${i + 1}.` };
    });
  }

  // Cards pattern - ensure each has a label
  if (normalizedPattern === "cards") {
    return items.map((item) => {
      if (item.label) return item;
      // Extract first meaningful phrase as label
      const words = item.text.split(" ").slice(0, 3);
      return { label: words.join(" "), text: item.text };
    });
  }

  return items;
}

/**
 * Main transformation function
 * 
 * Transforms a slide's bullet points into more engaging presentation content
 * based on the slide's semantic intent and visual strategy.
 */
export function transformBullets(
  slide: Slide,
  textDensity: "minimal" | "concise" | "detailed" | "extensive" = "concise"
): TransformedContent {
  // Title slides don't have bullets to transform
  if (slide.type === "title") {
    return { items: [] };
  }

  const bullets = slide.bulletPoints || [];
  if (bullets.length === 0) {
    return { items: [] };
  }

  // Get semantic intent, normalize it
  const intent = slide.semanticIntent?.toLowerCase() || "default";
  
  // Find matching transformation or use default
  let transformer = INTENT_TRANSFORMATIONS.default;
  for (const [key, fn] of Object.entries(INTENT_TRANSFORMATIONS)) {
    if (intent.includes(key)) {
      transformer = fn;
      break;
    }
  }

  // Transform bullets based on intent
  let items = transformer(bullets);

  // Apply pattern-based transformations
  if (slide.visualStrategy?.pattern) {
    items = applyPatternTransformation(items, slide.visualStrategy.pattern);
  }

  // Apply text density adjustments
  items = applyTextDensity(items, textDensity);

  // Generate intro if appropriate
  const intro = generateIntro(slide.title, slide.semanticIntent);

  return { intro, items };
}

/**
 * Apply text density adjustments to transformed items
 */
function applyTextDensity(
  items: TransformedBulletItem[],
  density: "minimal" | "concise" | "detailed" | "extensive"
): TransformedBulletItem[] {
  switch (density) {
    case "minimal":
      // Keep labels prominent, shorten text
      return items.map((item) => ({
        label: item.label,
        text: truncateText(item.text, 80),
      }));

    case "concise":
      // Balance between label and text
      return items.map((item) => ({
        label: item.label,
        text: truncateText(item.text, 150),
      }));

    case "detailed":
      // Full text, no truncation
      return items;

    case "extensive":
      // Full text with potential expansion markers
      return items;

    default:
      return items;
  }
}

/**
 * Truncate text to a maximum length, ending at word boundary
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Batch transform all slides in an outline
 */
export function transformAllSlides(
  slides: Slide[],
  textDensity: "minimal" | "concise" | "detailed" | "extensive" = "concise"
): Map<number, TransformedContent> {
  const transformedMap = new Map<number, TransformedContent>();
  
  slides.forEach((slide, index) => {
    transformedMap.set(index, transformBullets(slide, textDensity));
  });

  return transformedMap;
}


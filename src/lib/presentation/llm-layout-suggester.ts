/**
 * LLM Layout Suggester - AI-powered layout suggestions
 * 
 * Uses LLM to analyze content and suggest the best layout category and specific type
 * for each slide based on content analysis.
 */

import { env } from "~/env.js";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { ContentLayoutStyle } from "./layout-planner";
import {
  isLayoutCategoryCompatibleWithImage,
  IMAGE_INCOMPATIBLE_LAYOUTS,
  IMAGE_REQUIRED_LAYOUTS,
} from "./layout-image-rules";
import type { ContentAnalysis } from "./content-analyzer";

export interface LLMLayoutSuggestion {
  category: ContentLayoutCategory;
  specificType: ContentLayoutStyle;
  confidence: "high" | "medium" | "low";
  reasoning: string; // Why this layout was suggested
  alternatives?: Array<{
    category: ContentLayoutCategory;
    specificType: ContentLayoutStyle;
    reasoning: string;
  }>;
}

// Available layout types per category
const AVAILABLE_LAYOUTS = {
  boxes: ["box-style-1", "box-style-2", "box-style-3", "box-style-4"],
  bullets: ["bullet-style-1", "bullet-style-2", "bullet-style-3", "bullet-style-4"],
  sequence: ["sequence-style-1", "sequence-style-2", "sequence-style-3", "sequence-style-4"],
  steps: ["steps-pyramid", "steps-arrows", "steps-cards", "steps-bars"],
  quotes: ["quote-bubble", "quote-marks"],
  circles: ["circle-arc", "circle-ring"],
  numbers: ["box-style-1", "box-style-2"], // Numbers use box layouts
  images: ["image-style-1", "image-style-2", "image-style-3", "image-style-4"],
};

const LAYOUT_DESCRIPTIONS = {
  boxes: {
    "box-style-1": "Side accent bar, clean cards - best for features/benefits",
    "box-style-2": "Minimal, elegant cards - best for categories/types",
    "box-style-3": "Icon focus with centered icon - best for distinct concepts",
    "box-style-4": "Header accent with overlapping icon - best for comparisons",
  },
  bullets: {
    "bullet-style-1": "Card bullets in grid - best for 2-4 items",
    "bullet-style-2": "Simple bullets in columns - best for lists",
    "bullet-style-3": "Checklist style - best for tasks/features",
    "bullet-style-4": "Arrow list - best for dense content",
  },
  sequence: {
    "sequence-style-1": "Horizontal process flow - best for workflows",
    "sequence-style-2": "Timeline style - best for chronological content",
    "sequence-style-3": "Vertical steps - best for narrow space",
    "sequence-style-4": "Vertical journey - best for progressions",
  },
  steps: {
    "steps-pyramid": "Inverted pyramid - best for 3-4 step guides",
    "steps-arrows": "Arrow flow - best for tutorials",
    "steps-cards": "Step cards - best for horizontal steps",
    "steps-bars": "Numbered bars - best for many steps",
  },
  quotes: {
    "quote-bubble": "Speech bubble - best for testimonials",
    "quote-marks": "Quote cards - best for statements",
  },
  circles: {
    "circle-arc": "Arc flow - best for cycles in wide space",
    "circle-ring": "Ring cycle - best for cycles in narrow space",
  },
  numbers: {
    "box-style-1": "Side accent - best for statistics",
    "box-style-2": "Minimal - best for metrics",
  },
  images: {
    "image-style-1": "Compact gallery - best for many images",
    "image-style-2": "Card gallery - best for featured images",
    "image-style-3": "Circle gallery - best for profile images",
    "image-style-4": "Feature gallery - best for showcase",
  },
};

/**
 * Call OpenAI API for layout suggestion
 */
async function callOpenAIForLayout(prompt: string): Promise<string> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert presentation layout designer. Analyze slide content and suggest the best layout category and specific type.

AVAILABLE LAYOUT CATEGORIES:
- boxes: For distinct features, benefits, categories, comparisons
- bullets: For simple lists, high-density content, general information
- sequence: For timelines, processes, workflows, chronological content
- steps: For how-to guides, tutorials, numbered instructions
- quotes: ONLY for testimonials, quotes, endorsements (very strict)
- circles: For cycles, loops, circular relationships
- numbers: For statistics, metrics, data points, KPIs
- images: For image galleries, visual showcases

For each category, suggest the most appropriate specific type based on:
- Content type and pattern
- Bullet count
- Content density
- Space constraints

Return ONLY valid JSON in this format:
{
  "category": "boxes|bullets|sequence|steps|quotes|circles|numbers|images",
  "specificType": "exact layout ID from available layouts",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of why this layout fits",
  "alternatives": [
    {
      "category": "alternative category",
      "specificType": "alternative layout ID",
      "reasoning": "Why this alternative could work"
    }
  ]
}`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent suggestions
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[llm-layout-suggester] OpenAI API error: ${response.status}`, errorBody);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

/**
 * Call Gemini API for layout suggestion (fallback)
 */
async function callGeminiForLayout(prompt: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
  
  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[llm-layout-suggester] Gemini API error: ${response.status}`, errorBody);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call LLM with OpenAI primary, Gemini fallback
 */
async function callLLMForLayout(prompt: string): Promise<string> {
  // Try OpenAI first
  if (env.OPENAI_API_KEY) {
    try {
      console.log("[llm-layout-suggester] Using OpenAI API...");
      return await callOpenAIForLayout(prompt);
    } catch (error) {
      console.warn("[llm-layout-suggester] OpenAI failed, falling back to Gemini:", error);
    }
  }

  // Fallback to Gemini
  if (env.GEMINI_API_KEY) {
    console.log("[llm-layout-suggester] Using Gemini API (fallback)...");
    return await callGeminiForLayout(prompt);
  }

  throw new Error("No API keys configured (OPENAI_API_KEY or GEMINI_API_KEY)");
}

/**
 * Parse JSON response from LLM
 */
function parseLayoutSuggestion(text: string): LLMLayoutSuggestion {
  let cleanJson = text.trim();
  
  // Remove markdown code blocks if present
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.slice(7);
  }
  if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.slice(3);
  }
  if (cleanJson.endsWith("```")) {
    cleanJson = cleanJson.slice(0, -3);
  }
  cleanJson = cleanJson.trim();

  return JSON.parse(cleanJson) as LLMLayoutSuggestion;
}

/**
 * Suggest layout using LLM based on content analysis
 */
export async function suggestLayoutWithLLM(
  title: string,
  bulletPoints: string[],
  analysis: ContentAnalysis,
  semanticIntent?: string,
  visualStrategy?: string,
  hasImage: boolean = false,
  isNarrowSpace: boolean = false
): Promise<LLMLayoutSuggestion | null> {
  // Check if any API key is available
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    console.warn("[llm-layout-suggester] No API keys configured, skipping LLM suggestion");
    return null;
  }

  // Build available layouts description
  const layoutsDesc = Object.entries(AVAILABLE_LAYOUTS)
    .map(([category, types]) => {
      const typeDescs = types
        .map(type => {
          const desc = LAYOUT_DESCRIPTIONS[category as keyof typeof LAYOUT_DESCRIPTIONS]?.[type as string];
          return desc ? `  - ${type}: ${desc}` : `  - ${type}`;
        })
        .join("\n");
      return `${category}:\n${typeDescs}`;
    })
    .join("\n\n");

  const prompt = `Analyze this slide content and suggest the best layout:

SLIDE TITLE: "${title}"

BULLET POINTS (${bulletPoints.length} items):
${bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}

CONTENT ANALYSIS:
- Content Type: ${analysis.contentType} (confidence: ${analysis.contentTypeConfidence}%)
- Pattern: ${analysis.pattern}
- Bullet Count: ${analysis.bulletCount}
- Average Length: ${analysis.avgBulletLength.toFixed(1)} words
- Has Sequence: ${analysis.hasSequence}
- Has Distinct Concepts: ${analysis.hasDistinctConcepts}
${semanticIntent ? `- Semantic Intent: ${semanticIntent}` : ""}
${visualStrategy ? `- Visual Strategy: ${visualStrategy}` : ""}
- Has Image: ${hasImage}
- Is Narrow Space: ${isNarrowSpace}

AVAILABLE LAYOUTS:
${layoutsDesc}

CRITICAL RULES:
1. quotes: ONLY use if bullets are actual testimonials/quotes with quotation marks. NOTE: quotes layout is INCOMPATIBLE with images - if image is required, do NOT suggest quotes.
2. steps: ONLY use if bullets are explicit how-to instructions or numbered steps. Some step styles (pyramid, arrows, bars) are incompatible with images.
3. sequence: ONLY use for timelines, processes, or chronological content. Vertical sequences (sequence-style-3, sequence-style-4) are incompatible with images.
4. circles: ONLY use for cycles, loops, or circular relationships. NOTE: circles layout is INCOMPATIBLE with images - if image is required, do NOT suggest circles.
5. numbers: ONLY use for statistics, metrics, or data points
6. images: ONLY use if content is about images/gallery. NOTE: images layout REQUIRES images - always suggest images when using this layout.
7. boxes: Use for distinct features, benefits, categories, comparisons. Compatible with images.
8. bullets: Use as default for general lists or when other categories don't fit. Compatible with images.

IMAGE COMPATIBILITY RULES:
- If hasImage=true: DO NOT suggest "circles" or "quotes" (incompatible)
- If hasImage=true: DO suggest "images" layout if content is about images/gallery
- If hasImage=false: You can suggest any layout, but "images" layout still requires images

Based on the content analysis, suggest:
1. The BEST layout category and specific type
2. 1-2 alternative options if applicable
3. Your confidence level
4. Brief reasoning

Return ONLY valid JSON matching the specified format.`;

  try {
    const text = await callLLMForLayout(prompt);
    const suggestion = parseLayoutSuggestion(text);
    
    // Validate the suggestion
    const category = suggestion.category;
    const specificType = suggestion.specificType;
    
    // Verify category is valid
    if (!AVAILABLE_LAYOUTS[category]) {
      console.warn(`[llm-layout-suggester] Invalid category: ${category}, defaulting to boxes`);
      return null;
    }
    
    // Verify specific type is valid for category
    const validTypes = AVAILABLE_LAYOUTS[category];
    if (!validTypes.includes(specificType)) {
      console.warn(`[llm-layout-suggester] Invalid type ${specificType} for category ${category}, using first available`);
      return {
        ...suggestion,
        specificType: validTypes[0] as ContentLayoutStyle,
      };
    }

    // Validate image compatibility
    if (hasImage && !isLayoutCategoryCompatibleWithImage(category, true)) {
      console.warn(
        `[llm-layout-suggester] LLM suggested incompatible category "${category}" with image. Adjusting confidence.`
      );
      // Lower confidence if incompatible
      suggestion.confidence = "low";
      // Add alternative suggestion
      if (!suggestion.alternatives) {
        suggestion.alternatives = [];
      }
      // Add compatible alternatives
      const compatibleCategories = ["boxes", "bullets", "numbers"].filter(
        (cat) => cat !== category && isLayoutCategoryCompatibleWithImage(cat as ContentLayoutCategory, true)
      );
      if (compatibleCategories.length > 0) {
        const altCategory = compatibleCategories[0] as ContentLayoutCategory;
        const altTypes = AVAILABLE_LAYOUTS[altCategory];
        if (altTypes && altTypes.length > 0) {
          suggestion.alternatives.push({
            category: altCategory,
            specificType: altTypes[0] as ContentLayoutStyle,
            reasoning: `Compatible with images (${category} is incompatible)`,
          });
        }
      }
    }
    
    return suggestion;
  } catch (error) {
    console.error("[llm-layout-suggester] Error getting LLM suggestion:", error);
    return null;
  }
}


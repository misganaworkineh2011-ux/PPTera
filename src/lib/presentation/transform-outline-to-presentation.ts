/**
 * Transform outline content into presentation-ready content using LLM
 * 
 * This transforms terse outline bullet points into rich, engaging presentation content
 * similar to how Gamma transforms outlines into presentations.
 * 
 * Uses OpenAI as primary API, Gemini as fallback.
 */

import { env } from "~/env.js";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_MODELS } from "~/lib/ai/models";
import {
  bulletsToSections,
  normalizeSections,
  sectionsToBullets,
} from "./section-utils";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

export interface OutlineSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Smart layout selection metadata (from LLM)
  semanticIntent?: string;
  visualStrategy?: {
    primary: string;
    pattern: string;
    emphasis: string;
  };
  contentLayoutHint?: string;
  // Chart intent from the outline (assets.chart) — when set, the transform
  // must also produce chart data for the slide.
  wantsChart?: boolean;
  chartType?: string;
  chartPurpose?: string;
  // Image metadata
  image?: {
    required: boolean;
    orientation: "landscape" | "portrait";
    pexelsPromptHint: string;
    aiPromptHint: string;
  };
  assets?: {
    image?: {
      required: boolean;
      orientation: "landscape" | "portrait";
      pexelsPromptHint: string;
      aiPromptHint: string;
    };
  };
}

export interface TransformedSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  // For title slides
  tagline?: string;
  // Short uppercase eyebrow/kicker label above a content slide's heading
  kicker?: string;
  // AI-generated chart for data slides (compact spec; the route expands it
  // into full ChartData with theme-aware config)
  chart?: {
    type: string;
    title?: string;
    unit?: string;
    data: Array<{ label: string; value: number }>;
  };
  // For content slides - can be bullets OR sections
  bulletPoints?: string[];
  sections?: Array<{
    heading: string;
    description: string;
  }>;
  // Intro text before bullets/sections
  introText?: string;
  // Slide description - simple 2-line description that appears between title and content
  slideDescription?: string;
  // Speaker notes - detailed explanations for the presenter
  speakerNotes?: string[];
  // Layout hint based on content structure
  suggestedLayout?: "bullets" | "sections" | "two-column" | "three-cards";
}

export interface TransformOptions {
  tone?: string;
  language?: string;
  textDensity?: "minimal" | "concise" | "detailed" | "extensive";
}

/**
 * Layout-aware text shaping: the outline picked a contentLayoutHint, and each
 * layout family needs a different TEXT SHAPE (a hub-spoke diagram has tiny
 * text zones; an editorial list wants fuller sentences). Without this, text
 * is written blind and diagram layouts get rejected by capacity gates.
 * Returned guidance OVERRIDES the generic word-count rules for the slide.
 */
function getLayoutShapeGuidance(hint?: string): string {
  if (!hint) return "";

  const rule = (body: string) =>
    `\nTARGET LAYOUT — "${hint}" (THIS OVERRIDES the generic 20-30 word guidance for this slide):\n${body}\n`;

  switch (hint) {
    // Compact diagrams: tiny text zones, short labels only
    case "orbit":
    case "cycle":
    case "hubspoke":
    case "pyramid":
    case "matrix":
    case "circles":
    case "chevron":
      return rule(
        `- This slide renders as a ${hint.toUpperCase()} DIAGRAM with very small text zones.
- Each section: "heading" = 1-3 punchy words, "description" = AT MOST 10 words.
- NO full sentences with clauses; think annotations, not paragraphs.
- 3-4 sections is ideal (matrix: exactly 4).`,
      );

    // Split/versus diagrams: short opposing points
    case "proscons":
    case "beforeafter":
    case "comparison":
      return rule(
        `- This is a SPLIT/VERSUS diagram — items appear as short points on two sides.
- Each section: "heading" = 1-3 words, "description" = AT MOST 12 words.
- Keep both sides balanced (equal item counts).`,
      );

    // Process layouts: named stages in order
    case "timeline":
    case "sequence":
    case "steps":
    case "roadmap":
    case "funnel":
    case "cascading":
      return rule(
        `- This is a PROCESS layout — sections are stages in chronological order.
- Each section: "heading" = the stage name (1-4 words), "description" = its outcome (AT MOST 12 words).
- Order the sections as the process actually flows.`,
      );

    // Stat layouts: numbers first
    case "numbers":
    case "dashboard":
      return rule(
        `- This is a METRIC layout — every section is one stat.
- Each section: "heading" = the NUMBER with unit (e.g. "3.2x", "92%", "$1.4M"), "description" = what it measures (AT MOST 10 words).
- If the outline lacks numbers, derive plausible framing metrics from its content.`,
      );

    // Term/value layouts
    case "table":
    case "definitionlist":
      return rule(
        `- This renders as TERM → DEFINITION rows.
- Each section: "heading" = the term (AT MOST 4 words), "description" = its definition (AT MOST 15 words).
- Terms must be distinct and parallel in style.`,
      );

    // Single-focus layouts
    case "quotes":
      return rule(
        `- This is a QUOTE layout: produce ONE powerful quotation with attribution.
- The single section: "heading" = the attribution (who said it), "description" = the quote text itself (no surrounding quote marks).`,
      );
    case "spotlight":
      return rule(
        `- This is a SPOTLIGHT statement layout: ONE bold declarative statement, AT MOST 15 words.
- Generate exactly 1 section: "heading" = "", "description" = the statement (this layout is exempt from the minimum-2-items rule).`,
      );
    case "callout":
      return rule(
        `- This is a CALLOUT layout: 1-3 high-stakes notes worth boxing.
- Each section: "heading" = a 1-3 word flag (e.g. "Warning", "Key insight"), "description" = the note (AT MOST 18 words).`,
      );

    // People
    case "team":
      return rule(
        `- This is a TEAM layout: each section is a person.
- Each section: "heading" = the person's full name, "description" = role plus one short credential (AT MOST 12 words).`,
      );

    // Card/list layouts: label + fuller supporting sentence
    case "boxes":
    case "bullets":
    case "checklist":
    case "agenda":
    case "editorial":
    case "zigzag":
    case "showcase":
    case "bento":
    case "icongrid":
      return rule(
        `- This is a CARD/LIST layout — each section carries a bold label plus a supporting sentence.
- Each section: "heading" = 2-4 words, "description" = 12-25 words with real substance.
- Give the FIRST section the most weight (it's the visual hero).`,
      );

    default:
      return "";
  }
}

/**
 * Generate system prompt with dynamic max items based on presentation length
 */
function getSystemPrompt(maxItems: number): string {
  return `You are an expert presentation content writer. Your task is to transform outline content into presentation-ready slides with WELL-CRAFTED, DETAILED content and DETAILED speaker notes.

CRITICAL RULE: NEVER change slide titles. Keep them EXACTLY as provided. Only transform the content.

TRANSFORMATION RULES:
1. KEEP TITLES UNCHANGED - use the exact original title provided
2. EXPLAIN ALL CONTENT: Every single item from the outline MUST be transformed. Consolidate related points if needed to respect maximum item count of ${maxItems}.
3. ADAPTIVE ITEM COUNT: This presentation allows up to ${maxItems} items per slide based on its length
4. EXPAND AND ELABORATE: Each generated item should be MORE detailed than the corresponding outline item. Add context, examples, implications, causes, effects, or specific details.
5. VISUAL HIERARCHY (CRITICAL): Do NOT make every item the same weight. Give each content slide ONE clear focal point. Order items so the most important, highest-impact point comes FIRST (the hero), followed by supporting points. Vary the items — a uniform grid of equal-length boxes looks generic and flat. Aim for a dominant point plus support, not sameness. Keep each item under 30 words.
6. AVOID QUOTE-HEAVY LAYOUTS: Create proper content with actionable statements, not just quotes or citations (unless using quote layout).
7. TITLE SLIDE EXCELLENCE: For title slides, create LONGER, MORE COMPELLING subtitles (40-60 words) and powerful taglines (10-15 words) that make an amazing first impression.
8. CREATE TWO VERSIONS OF EACH ITEM:
   - "sections" items: {"heading", "description"} objects (description max 30 words), hero point first - what appears on the slide
   - "speakerNotes": Even more detailed explanations (1-3 sentences each) - what the presenter reads
   
OUTPUT FORMAT (JSON):
For each slide, return:
{
  "type": "title" or "content",
  "title": "EXACT original title - DO NOT MODIFY",
  "subtitle": "For title slides: ENHANCED 40-60 word compelling subtitle | For content: brief subtitle if needed",
  "tagline": "For title slides: POWERFUL 10-15 word tagline that crystallizes the message",
  "slideDescription": "OPTIONAL - For title slides: 2-3 sentences (40-60 words) providing rich context | For content slides: brief 1-2 sentence factual statement",
  "sections": [{"heading": "Short bold label (2-4 words)", "description": "The item's full supporting text"}, ...],
  "speakerNotes": ["Detailed note for section 1 (1-3 sentences)", "Detailed note for section 2", ...],
  "suggestedLayout": "bullets" | "sections" | "two-column" | "three-cards"
}

SECTIONS ARE THE CONTENT — CRITICAL FOR ACCURATE RENDERING:
- EVERY content item MUST be one {"heading", "description"} object in the "sections" array. Slide components bind "heading" to the item's bold label and "description" to its body text — this structure is what places each text in the right spot.
- "heading": the short label ONLY (2-4 words, no trailing colon/dash). "description": the complete supporting text ONLY.
- NEVER pack a label and its text into one string. "Label: text" or "Label — text" inside a single field is FORBIDDEN — the separator does NOT get parsed; it will render wrong.
- If an item genuinely has no label (a plain statement or a quote), set "heading" to "".
- Do NOT return "bulletPoints" for content slides — it is a deprecated legacy field. Content lives in "sections".

CONTENT ITEM GUIDELINES:
- ITEM COUNT: Generate 2-${maxItems} sections per slide (maximum ${maxItems})
- MAXIMUM 30 WORDS per description: concise but detailed (20-30 words ideal)
- CLEAR HIERARCHY: Lead with the single most important point first; supporting points follow. Avoid uniform, same-length items — give the slide a focal point.
- PROPER FORMAT: Use direct, actionable statements - NOT quotes or citations (except for quote layouts)
- AVOID SINGLE ITEMS: Never create slides with only 1 section (minimum 2)
- CONSOLIDATE WHEN NEEDED: If outline has many items, consolidate related points into fewer comprehensive sections
- Ensure ALL outline content is transformed - consolidate if needed to respect maximum of ${maxItems}
- Speaker notes: Full explanation with context, examples, data, implications — one note per section, same order

LAYOUT GUIDELINES:
- ALL content lives in "sections" regardless of layout; "suggestedLayout" only hints how it is displayed
- Hint "bullets" for sequential steps, lists, or supporting details
- Hint "sections" for distinct concepts that deserve emphasis as titled cards
- Hint "two-column" for comparisons or before/after content
- Hint "three-cards" for exactly 3 key points that are equally important
- RESPECT MAXIMUM ITEMS: All layouts must respect the maximum item count of ${maxItems}
  * Boxes: max ${maxItems} boxes
  * Bullets: max ${maxItems} bullets
  * Sections: max ${maxItems} sections
  * Sequence: max ${maxItems} sequence items
  * Steps: max ${maxItems} steps
  * Numbers: max ${maxItems} stat items
  * Circles: max ${maxItems} circle items
  * Quotes: max ${maxItems} quotes
  * Images: max ${maxItems} images

WRITING STYLE:
- Professional but engaging
- Active voice preferred
- Concrete and specific over vague
- Slide content is well-crafted and detailed; speaker notes are comprehensive`;
}

/**
 * Call OpenAI API (using OpenAI SDK - same as outline generation)
 */
async function callOpenAI(prompt: string, maxItems: number): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Use cheaper model for content generation
    messages: [
      { role: "system", content: getSystemPrompt(maxItems) },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8192, // Increased from 6000 to prevent content cutoff
  });

  return completion.choices[0]?.message?.content || "";
}

/**
 * Call Gemini API (fallback - using GoogleGenerativeAI SDK - same as outline generation)
 */
async function callGemini(prompt: string, maxItems: number): Promise<string> {
  if (!gemini) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = gemini.getGenerativeModel({
    model: AI_MODELS.content, // Cheaper/faster model for mechanical content expansion
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192, // Increased to prevent content cutoff
    },
  });

  const result = await model.generateContent(getSystemPrompt(maxItems) + "\n\n" + prompt);
  const response = await result.response;

  return response.text() || "";
}

/**
 * Call LLM with Gemini primary, OpenAI fallback
 */
async function callLLM(prompt: string, maxItems: number): Promise<string> {
  // Try Gemini first
  if (env.GEMINI_API_KEY) {
    try {
      console.log("[transform-outline] Using Gemini API...");
      return await callGemini(prompt, maxItems);
    } catch (error) {
      console.warn("[transform-outline] Gemini failed, falling back to OpenAI:", error);
    }
  }

  // Fallback to OpenAI
  if (env.OPENAI_API_KEY) {
    console.log("[transform-outline] Using OpenAI API (fallback)...");
    return await callOpenAI(prompt, maxItems);
  }

  throw new Error("No API keys configured (OPENAI_API_KEY or GEMINI_API_KEY)");
}

/**
 * Parse JSON response from LLM, handling markdown code blocks
 */
function parseJsonResponse(text: string): TransformedSlide {
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

  return JSON.parse(cleanJson) as TransformedSlide;
}


/**
 * Normalize a transformed content slide so structured sections are ALWAYS the
 * single source of truth for component text assignment:
 * - scrub whatever the model put in `sections` (trim, coerce, split strings);
 * - if the model only returned flat bullets, split them ONCE here with the
 *   canonical splitter (never again at render time);
 * - re-derive `bulletPoints` from the sections as a legacy view for analyzers.
 */
function normalizeTransformedContent(t: TransformedSlide): TransformedSlide {
  if (t.type !== "content") return t;
  let sections = normalizeSections(t.sections);
  if (sections.length === 0 && t.bulletPoints && t.bulletPoints.length > 0) {
    sections = bulletsToSections(t.bulletPoints);
  }
  if (sections.length > 0) {
    t.sections = sections;
    t.bulletPoints = sectionsToBullets(sections);
  }
  return t;
}

/**
 * Calculate maximum items per slide based on total presentation length
 * Applies to ALL content layouts: bullets, boxes, sections, steps, sequence, numbers, circles, quotes, images
 * Shorter presentations = more items per slide
 * Longer presentations = fewer items per slide (better distribution)
 */
function calculateMaxBullets(totalSlides: number): number {
  if (totalSlides <= 5) return 6;  // Very short: up to 6 items
  if (totalSlides <= 10) return 5; // Short: up to 5 items
  if (totalSlides <= 15) return 4; // Medium: up to 4 items
  if (totalSlides <= 25) return 3; // Long: up to 3 items
  return 3; // Very long: max 3 items (keep slides focused)
}

/**
 * Transform a single slide's content using LLM
 */
async function transformSlideContent(
  slide: OutlineSlide,
  slideIndex: number,
  totalSlides: number,
  options: TransformOptions
): Promise<TransformedSlide> {
  // Check if any API key is available
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    console.warn("[transform-outline] No API keys configured, returning original content");
    return {
      type: slide.type,
      title: slide.title,
      subtitle: slide.subtitle,
      bulletPoints: slide.bulletPoints,
      sections: bulletsToSections(slide.bulletPoints),
      suggestedLayout: "bullets"
    };
  }

  // Calculate max bullets based on presentation length
  const maxBullets = calculateMaxBullets(totalSlides);

  // Text density affects SPEAKER NOTES detail level
  const notesDetailGuidance = {
    minimal: "Speaker notes: 1 brief sentence per bullet with key facts only",
    concise: "Speaker notes: 1-2 sentences per bullet with context and key details",
    detailed: "Speaker notes: 2-3 sentences per bullet with examples and deeper explanation",
    extensive: "Speaker notes: Full paragraphs with examples, data, and comprehensive context"
  };

  // Text density ALSO drives the ON-CARD text amount (the user-facing
  // "Amount of text per card" control). Diagram layout budgets from
  // getLayoutShapeGuidance still take precedence when they are smaller.
  const cardTextBudget = {
    minimal: "6-12 words per item — punchy fragments, zero filler",
    concise: "15-25 words per item — one tight sentence each",
    detailed: "25-40 words per item — add context or one concrete example",
    extensive: "35-55 words per item — rich explanatory text with examples and implications",
  }[options.textDensity || "concise"];

  const prompt = `Transform this outline slide into presentation-ready content with WELL-CRAFTED, DETAILED slide bullets and DETAILED speaker notes.

SLIDE ${slideIndex + 1} of ${totalSlides}:
Type: ${slide.type}
Original Title (DO NOT CHANGE): ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.bulletPoints ? `Bullet Points:\n${slide.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : ""}

CRITICAL REQUIREMENTS:
- MAXIMUM ${maxBullets} ITEMS: Generate no more than ${maxBullets} content items for this ${totalSlides}-slide presentation
- Transform ALL ${slide.bulletPoints?.length || 0} outline items - consolidate if needed to stay under ${maxBullets} items
- Each generated item must be well-crafted, expanding on the outline with context, examples, implications
- CARD TEXT AMOUNT (user setting): ${cardTextBudget}. A smaller diagram-layout budget below overrides this.
- HIERARCHY: Put the most important, highest-impact point FIRST (the hero). Supporting points follow. Don't make every item identical in weight — give the slide a clear focal point.
- PROPER FORMAT: Use direct statements, NOT quotes or citations (unless using quote layout)
- AVOID SINGLE ITEMS: Never generate slides with only 1 item (minimum 2-3 items)
- EXPAND and ELABORATE on the outline items - add context, examples, implications, causes, effects, or specific details
- Make the generated content MORE detailed and explanatory than the outline
- If outline has more than ${maxBullets} items, consolidate related points into comprehensive items
${slide.type === "content" ? getLayoutShapeGuidance(slide.contentLayoutHint) : ""}${
    slide.type === "content" && slide.wantsChart
      ? `
CHART REQUIRED — this slide is a data moment (purpose: ${slide.chartPurpose || "visualize the key data"}):
- ALSO return a "chart" field in your JSON:
  {"type": "${slide.chartType || "bar"}", "title": "short chart title", "unit": "optional unit like % or $", "data": [{"label": "...", "value": number}, ...]}
- Pick the BEST-fitting type if "${slide.chartType || "bar"}" is wrong for the data: bar | horizontal-bar | line | area | pie | donut | funnel | radar | kpi
- 3-8 data points with REALISTIC, internally consistent illustrative values grounded in the slide's subject
- pie/donut values MUST sum to 100
- Keep "sections" to 2-3 SHORT supporting insights — the chart is the slide's hero
`
      : ""
  }
REQUIREMENTS:
- Tone: ${options.tone || "professional"}
- Language: ${options.language || "English"}
- Slide bullets: Maximum 30 words each, hero point first then supporting points, well-crafted with expanded detail
- ${notesDetailGuidance[options.textDensity || "concise"]}

CRITICAL: The "title" field in your response MUST be exactly: "${slide.title}"

${slide.type === "title" ? `
For this TITLE slide (FIRST IMPRESSION - MAKE IT AMAZING):
- Keep the title EXACTLY as provided: "${slide.title}"
- Create an ENHANCED, COMPELLING subtitle (40-60 words) that:
  * Expands on the title with rich context and depth
  * Sets the stage for the entire presentation
  * Creates anticipation and engagement
  * Uses vivid, descriptive language
  * Captures the essence and value proposition
  * Makes the audience want to learn more
- Add a POWERFUL tagline (10-15 words):
  * Memorable and impactful
  * Crystallizes the core message
  * Uses strong, active language
  * Creates emotional resonance
- OPTIONAL: Add a "slideDescription" field (2-3 sentences, 40-60 words total) that:
  * Provides additional context about what the presentation covers
  * Highlights key benefits or outcomes
  * Sets expectations for the audience
  * Uses engaging, professional language
  
TITLE SLIDE EXCELLENCE:
- The subtitle should be SUBSTANTIALLY LONGER and more detailed than typical (40-60 words)
- Use descriptive, evocative language that paints a picture
- Focus on value, benefits, and transformation
- Make it feel premium and professional
- Create excitement and curiosity
- The slideDescription (if included) should complement the subtitle with additional depth
` : `
For this CONTENT slide:
- Keep the title EXACTLY as provided: "${slide.title}"
- slideDescription (THE HERO LINE — strongly recommended): A single punchy KEY TAKEAWAY sentence that appears prominently BETWEEN the title and content. This is the ONE thing the audience must remember from this slide — the slide's focal point.
   - Make it bold, declarative, and specific — a crisp insight, not a vague lead-in
   - This line carries the slide's main message; the bullets/items support it
   - Write DIRECT FACTUAL STATEMENTS about the subject matter itself
   - FORBIDDEN PATTERNS - NEVER START WITH:
     * "Exploring..." / "Understanding..." / "Examining..." / "Discovering..."
     * "The foundation of..." / "The key to..." / "The essence of..."
     * "This slide..." / "In this section..." / "Let's look at..."
     * "Research shows..." / "Studies indicate..." (unless citing specific data)
     * Any gerund (-ing) phrases that describe the act of learning
   - CORRECT APPROACH - Write as if stating facts in an encyclopedia:
     * "The Nile River spans 6,650 kilometers across northeastern Africa."
     * "Climate change affects global temperatures through greenhouse gas emissions."
     * "Effective leadership requires clear communication and decisive action."
   - The description should read like a Wikipedia opening sentence - direct, factual, informative
   - Maximum 2 sentences. If not needed, omit it entirely (set to null or don't include)
- Create DETAILED content with MAXIMUM ${maxBullets} SECTIONS (descriptions max 30 words each, hero point first then supporting points)
   - EVERY item goes in "sections" as a {"heading", "description"} object — heading = short bold label, description = the full text. NEVER pack both into one string.
   - Transform ALL ${slide.bulletPoints?.length || 0} outline items
   - If outline has more than ${maxBullets} items, consolidate related points into ${maxBullets} comprehensive sections
   - If outline has fewer items, expand each one with more detail (but don't exceed ${maxBullets} total)
   - If an outline item already looks like "Label: text" or "Label — text", SPLIT it: the label part becomes "heading", the text part becomes "description"
   - Use DIRECT STATEMENTS, not quotes or citations (unless using quote layout)
   - NEVER create slides with only 1 section (minimum 2-3)
- Create DETAILED speakerNotes (1+ sentences each) - what the presenter reads
- The speakerNotes array must have the same length as "sections" (one note per section, same order)
- Ensure ALL outline items are transformed - consolidate if needed to respect the ${maxBullets} section maximum
- Set "suggestedLayout" as a display hint — the content itself is ALWAYS the "sections" array
- ALL LAYOUTS must respect the ${maxBullets} section maximum
`}

Return ONLY valid JSON matching the format specified. No markdown, no explanation.`;

  try {
    const text = await callLLM(prompt, maxBullets);
    let transformed = parseJsonResponse(text);

    // Ensure type is preserved
    transformed.type = slide.type;

    // CRITICAL: Always use the original title - never let LLM change it
    transformed.title = slide.title;

    // Structured sections are the single source of truth for component text.
    transformed = normalizeTransformedContent(transformed);

    // VALIDATION: Enforce maximum items and avoid single items for all layouts
    if (transformed.type === "content") {
      const totalItems = transformed.sections?.length ?? transformed.bulletPoints?.length ?? 0;
      const isSpotlight = slide.contentLayoutHint === "spotlight" || slide.contentLayoutHint === "quotes";

      // Check if only 1 item (not allowed, except single-focus layouts)
      if (totalItems === 1 && !isSpotlight) {
        console.warn(`[transform-outline] Slide ${slideIndex + 1} has only 1 item, retrying...`);
        const retryPrompt = prompt + `\n\nIMPORTANT: The previous response had only 1 item. You MUST generate 2-${maxBullets} sections. Expand or split the content.`;
        const retryText = await callLLM(retryPrompt, maxBullets);
        let retryTransformed = parseJsonResponse(retryText);
        retryTransformed.type = slide.type;
        retryTransformed.title = slide.title;
        retryTransformed = normalizeTransformedContent(retryTransformed);

        const retryTotalItems = retryTransformed.sections?.length ?? retryTransformed.bulletPoints?.length ?? 0;

        // If still only 1 item, use fallback
        if (retryTotalItems < 2) {
          console.warn(`[transform-outline] Retry still has < 2 items, using fallback`);
          const fallbackBullets = slide.bulletPoints?.slice(0, maxBullets) || [];
          return {
            type: slide.type,
            title: slide.title,
            subtitle: slide.subtitle,
            bulletPoints: fallbackBullets,
            sections: bulletsToSections(fallbackBullets),
            suggestedLayout: "bullets"
          };
        }

        transformed = retryTransformed;
      }

      // Enforce maximum items for all content types (sections and the derived
      // bullet view stay in lockstep, as do the per-item speaker notes)
      const finalCount = transformed.sections?.length ?? 0;
      if (finalCount > maxBullets) {
        console.warn(`[transform-outline] Slide ${slideIndex + 1} has ${finalCount} sections, trimming to ${maxBullets}`);
        transformed.sections = transformed.sections?.slice(0, maxBullets);
        transformed.bulletPoints = transformed.bulletPoints?.slice(0, maxBullets);
        transformed.speakerNotes = transformed.speakerNotes?.slice(0, maxBullets);
      } else if ((transformed.bulletPoints?.length ?? 0) > maxBullets) {
        transformed.bulletPoints = transformed.bulletPoints?.slice(0, maxBullets);
        transformed.speakerNotes = transformed.speakerNotes?.slice(0, maxBullets);
      }
    }

    return transformed;
  } catch (error) {
    console.error(`[transform-outline] Error transforming slide ${slideIndex + 1}:`, error);
    // Return original content as fallback
    return {
      type: slide.type,
      title: slide.title,
      subtitle: slide.subtitle,
      bulletPoints: slide.bulletPoints,
      sections: bulletsToSections(slide.bulletPoints),
      suggestedLayout: "bullets"
    };
  }
}

/**
 * Transform all slides in an outline to presentation-ready content
 */
export async function transformOutlineToPresentation(
  slides: OutlineSlide[],
  options: TransformOptions = {}
): Promise<TransformedSlide[]> {
  console.log(`[transform-outline] Transforming ${slides.length} slides...`);
  
  const transformedSlides: TransformedSlide[] = [];
  
  // Process slides in batches of 3 for better performance
  const BATCH_SIZE = 3;
  
  for (let i = 0; i < slides.length; i += BATCH_SIZE) {
    const batch = slides.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map((slide, batchIndex) => 
      transformSlideContent(slide, i + batchIndex, slides.length, options)
    );
    
    const batchResults = await Promise.all(batchPromises);
    transformedSlides.push(...batchResults);
    
    console.log(`[transform-outline] Transformed slides ${i + 1}-${Math.min(i + BATCH_SIZE, slides.length)}`);
  }
  
  return transformedSlides;
}

/**
 * Stream-friendly version that yields slides as they're transformed
 */
export async function* transformOutlineToPresentationStream(
  slides: OutlineSlide[],
  options: TransformOptions = {}
): AsyncGenerator<{ slideIndex: number; slide: TransformedSlide }> {
  console.log(`[transform-outline-stream] Starting transformation of ${slides.length} slides...`);
  
  for (let i = 0; i < slides.length; i++) {
    const transformed = await transformSlideContent(slides[i]!, i, slides.length, options);
    yield { slideIndex: i, slide: transformed };
  }
}


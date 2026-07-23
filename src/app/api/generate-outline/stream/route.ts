import { auth } from "~/lib/auth-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";
import { AI_MODELS } from "~/lib/ai/models";
import { LAYOUT_REGISTRY } from "~/lib/presentation/smart-layout/registry/layout-registry";

/**
 * Structural contract per layout, generated from the SAME registry the
 * scoring engine uses — so the outline LLM chooses a layout knowing its exact
 * item budget and text shape, and writes the outline to FIT it. Because this
 * derives from LAYOUT_REGISTRY, prompt and scorer can never drift apart.
 */
function buildLayoutStructureCatalog(): string {
  return LAYOUT_REGISTRY.map((def) => {
    const { min, max } = def.capacity.bulletCount;
    // bullet lengths are in characters; ~6 chars per word
    const maxChars =
      def.capacity.maxBulletLength?.max ?? def.capacity.avgBulletLength?.max ?? 60;
    const maxWords = Math.max(4, Math.round(maxChars / 6));
    const image = def.capacity.supportsImage ? "image OK" : "NO image";
    return `- "${def.category}": ${min}-${max} items, each "Label: text" with text ≤${maxWords} words (${image})`;
  }).join("\n");
}

const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

// Define slide limits by plan
const PLAN_SLIDE_LIMITS = {
  free: 10,
  starter: 20,
  pro: 50,
  enterprise: 70,
} as const;

const getMaxSlidesForPlan = (plan: string | null | undefined): number => {
  if (!plan) return PLAN_SLIDE_LIMITS.free;
  const planLower = plan.toLowerCase() as keyof typeof PLAN_SLIDE_LIMITS;
  return PLAN_SLIDE_LIMITS[planLower] ?? PLAN_SLIDE_LIMITS.free;
};

const validateSlideCount = (
  requestedSlides: number,
  plan: string | null | undefined
): { valid: boolean; maxAllowed: number } => {
  const maxAllowed = getMaxSlidesForPlan(plan);
  return {
    valid: requestedSlides <= maxAllowed,
    maxAllowed,
  };
};

// Helper to send SSE events
function sendEvent(
  controller: ReadableStreamDefaultController,
  event: string,
  data: unknown
) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// Sanitize error messages to never expose internal details to clients
function getSanitizedErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }
  
  const message = error.message.toLowerCase();
  
  // Map internal errors to user-friendly messages
  if (message.includes("ai_service_unavailable")) {
    return "Our AI service is temporarily unavailable. Please try again in a moment.";
  }
  if (message.includes("rate limit") || message.includes("429")) {
    return "We're experiencing high demand. Please wait a moment and try again.";
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return "The request took too long. Please try again.";
  }
  if (message.includes("api key") || message.includes("unauthorized") || message.includes("401")) {
    return "Service configuration error. Please contact support.";
  }
  if (message.includes("quota") || message.includes("billing")) {
    return "Service temporarily unavailable. Please try again later.";
  }
  if (message.includes("invalid") && message.includes("json")) {
    return "Failed to generate outline. Please try again.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Connection error. Please check your internet and try again.";
  }
  
  // Default generic message - never expose raw error
  return "Something went wrong. Please try again.";
}

// Bullets must be plain strings for the rest of the pipeline. The model
// sometimes returns structured objects ({label,text} / {heading,description});
// coerce them to strings at the source so nothing downstream renders an object.
function coerceBulletToString(b: unknown): string {
  if (typeof b === "string") return b;
  if (b && typeof b === "object") {
    const o = b as Record<string, unknown>;
    const label =
      typeof o.label === "string" ? o.label :
      typeof o.heading === "string" ? o.heading :
      typeof o.title === "string" ? o.title : "";
    const text =
      typeof o.text === "string" ? o.text :
      typeof o.description === "string" ? o.description :
      typeof o.content === "string" ? o.content : "";
    if (label && text) return `${label}: ${text}`;
    return text || label || "";
  }
  return b == null ? "" : String(b);
}

function normalizeSlideBullets(slide: any): any {
  if (slide && Array.isArray(slide.bulletPoints)) {
    slide.bulletPoints = slide.bulletPoints
      .map(coerceBulletToString)
      .filter((s: string) => s.trim().length > 0);
  }
  return slide;
}

/**
 * Validate and normalize slide metadata for smart layout selection
 * Ensures all required fields are present with fallback values
 */
function validateAndNormalizeSlideMetadata(slide: any): any {
  const normalized = normalizeSlideBullets({ ...slide });
  let hasWarnings = false;
  
  // Only validate content slides (title slides don't need layout metadata)
  if (slide.type !== "content") {
    return normalized;
  }
  
  // Validate and normalize semanticIntent
  if (!normalized.semanticIntent || typeof normalized.semanticIntent !== "string") {
    console.warn(`[outline-validation] Slide "${slide.title}" missing semanticIntent, using fallback`);
    normalized.semanticIntent = "inform";
    hasWarnings = true;
  }
  
  // Validate and normalize visualStrategy
  if (!normalized.visualStrategy || typeof normalized.visualStrategy !== "object") {
    console.warn(`[outline-validation] Slide "${slide.title}" missing visualStrategy, using fallback`);
    normalized.visualStrategy = {
      primary: "text-focused",
      pattern: "cards",
      emphasis: "clarity"
    };
    hasWarnings = true;
  } else {
    // Ensure all visualStrategy fields are present
    if (!normalized.visualStrategy.primary) {
      normalized.visualStrategy.primary = "text-focused";
      hasWarnings = true;
    }
    if (!normalized.visualStrategy.pattern) {
      normalized.visualStrategy.pattern = "cards";
      hasWarnings = true;
    }
    if (!normalized.visualStrategy.emphasis) {
      normalized.visualStrategy.emphasis = "clarity";
      hasWarnings = true;
    }
  }
  
  // Validate contentLayoutHint (optional but log if missing)
  if (!normalized.contentLayoutHint) {
    console.warn(`[outline-validation] Slide "${slide.title}" missing contentLayoutHint`);
    // Don't set fallback - this is truly optional and will be determined by content analysis
  }
  
  // Validate assets/image metadata (optional)
  if (normalized.assets?.image) {
    if (typeof normalized.assets.image.required !== "boolean") {
      normalized.assets.image.required = false;
    }
    if (!normalized.assets.image.orientation) {
      normalized.assets.image.orientation = "landscape";
    }
  }
  
  if (hasWarnings) {
    console.warn(`[outline-validation] Slide "${slide.title}" had incomplete metadata, applied fallbacks`);
  }
  
  return normalized;
}

/**
 * Validate entire outline and normalize all slides
 */
function validateAndNormalizeOutline(outline: any): any {
  if (!outline.slides || !Array.isArray(outline.slides)) {
    throw new Error("Invalid outline structure: missing slides array");
  }
  
  return {
    ...outline,
    slides: outline.slides.map(validateAndNormalizeSlideMetadata)
  };
}

export async function POST(req: Request) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Please sign in to continue" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Get user from database
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return new Response(
      JSON.stringify({ error: "User not found", message: "User account not found." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Note: Outline generation is FREE - no credit check needed
  // Credits are only deducted when creating the actual presentation

  // 3. Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON", message: "Failed to parse request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { description, numberOfSlides, tone, language, outlineId, textDensity } = body as {
    textDensity?: string;
    description?: string;
    numberOfSlides?: number;
    tone?: string;
    language?: string;
    outlineId?: string | null;
  };

  // 5. Validate required fields
  if (!description || !description.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing description", message: "Please provide a description" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!numberOfSlides || numberOfSlides < 1) {
    return new Response(
      JSON.stringify({ error: "Invalid slides", message: "Please specify the number of slides" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 6. Validate slide count against user's plan
  const slideValidation = validateSlideCount(numberOfSlides, user.subscriptionPlan);
  if (!slideValidation.valid) {
    return new Response(
      JSON.stringify({
        error: "Slide limit exceeded",
        message: `Your plan allows up to ${slideValidation.maxAllowed} slides.`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 7. Create or reuse outline record in DB with status "generating"
  let outline = null as any;

  if (outlineId) {
    const existing = await db.outline.findUnique({ where: { id: outlineId } });
    if (existing && existing.userId === user.id) {
      outline = await db.outline.update({
        where: { id: outlineId },
        data: {
          slides: [],
          metadata: {
            topic: description,
            totalSlides: numberOfSlides,
            tone: tone || "professional",
            language: language || "english",
          },
          status: "generating",
        },
      });
    }
  }

  if (!outline) {
    outline = await db.outline.create({
      data: {
        userId: user.id,
        slides: [],
        metadata: {
          topic: description,
          totalSlides: numberOfSlides,
          tone: tone || "professional",
          language: language || "english",
        },
        status: "generating",
      },
    });
  }

  // 8. Build the prompt for OpenAI
  const toneDescription = tone || "professional";
  const languageDescription = language || "english";
  const contentSlides = numberOfSlides - 1;

  const systemPrompt = `You are an expert presentation creator and content strategist. Your task is to create a detailed, high-quality presentation outline in JSON format.

CRITICAL QUALITY STANDARDS:
0. ALWAYS CALL WEB SEARCH FIRST: Before writing any slides, you MUST invoke the \`web_search_preview\` tool to gather the most recent, trustworthy information about the topic. Read and internalize the results, then write the outline in your own words — do NOT copy snippets verbatim, do NOT list raw URLs, and NEVER mention web search, tools, or how you got the information in the output. The web search is only a research step; the outline itself must read like a native, well‑researched presentation.

1. Professional expertise and clarity: Write the outline as if you are a master/expert in the specific field or topic. The content should demonstrate deep knowledge and professional understanding, but remain accessible and easy to understand - like a well-crafted PowerPoint presentation. Use clear, concise language that balances expertise with clarity. Avoid jargon unless necessary, and when using technical terms, ensure the context makes them understandable. The outline should feel authoritative and professional while being digestible for the intended audience.

2. Adaptive narrative flow: Structure MUST adapt organically to the specific topic.
   - FIRST: Analyze the topic's intent, audience, and natural progression before creating any slides
   - THEN: Design a custom narrative flow that emerges naturally from the subject matter itself
   - DO NOT force the topic into any predefined template or category
   - Let the content dictate the structure - each topic has its own inherent logic and flow

   OUTPUT CLEANLINESS - CRITICAL:
   - NEVER reference these instructions, templates, or any prompt guidance in the output
      
3. Real-time data and statistics: Use data sparingly and strategically — NOT every slide needs statistics.
   - include data when it genuinely strengthens the point being made
   - When data is relevant, try to provide the latest available information
   - Don't overwhelm slides with data — understand the data and distill it into clear insights
   - Prefer rewriting data into meaningful takeaways rather than listing raw statistics
   - If citing specific numbers, use format: "Statistic (Source Name, Year)" (DON'T USE LINKS OR URLS) — but only when the number itself adds value
   - Topics like how-to guides, processes, or conceptual explanations often don't need statistics at all
     * Data MUST come from trustworthy, authoritative sources relevant to the topic's domain
   
4. Scientific and evidence-based content: When solutions, tools, methods, or examples are provided, use scientific, evidence-based approaches when the topic requires it (health, science, research, etc.). Examples should be realistic and demonstrate actual utilization. Make it practical and applicable to real-world scenarios.

5. Actionable content: Provide specific, practical tips and actionable advice - avoid vague motivation or generic statements. Include concrete examples, case studies, exercises, or activities that make content tangible and applicable.

6. Famous quotes and sayings (when appropriate only):
   Sometimes, when it genuinely enhances the content and adds depth, include relevant famous quotes or sayings.
   - Quotes MUST be from experts, leaders, or notable figures directly relevant to the presentation's field/topic
   - Only include quotes when they meaningfully contribute to the slide's message
   - Cite quotes properly: "Quote text" — Author Name
   - Use quotes that are relevant, inspiring, or provide valuable perspective
   - Do not force quotes into every slide; use judgment to determine when they add value
––––––––––––––––––––––––––––––––––––––

VISUAL & DESIGN INTELLIGENCE (CRITICAL)

––––––––––––––––––––––––––––––––––––––

Each slide MUST encode visual meaning—not just text.

For every CONTENT slide, determine and include:

1. "semanticIntent":
A short, descriptive label that captures the core meaning of the slide in natural language.
This is NOT a fixed category system - invent labels freely when they better express the idea.
Examples (non-exhaustive): process, concept, comparison, hierarchy, timeline, framework, data insight, causal chain, transformation, trade-off.

2. "visualStrategy":
Describe how the idea wants to be visually expressed.
Fields:
- primary: the dominant visual form (e.g., diagram, image, mixed, text-focused)
- pattern: a descriptive layout metaphor (e.g., cards, grid, flow, split, spotlight, pyramid)
- emphasis: what the visual should highlight (e.g., progression, contrast, relationship, scale)

3. "contentLayoutHint":
Suggest a content layout CATEGORY based on the slide's semantic meaning.
IMPORTANT: This is just a hint - the presentation generator will make the final decision based on content density and image placement.

Choose ONE category that best matches the content's nature. Each renders as a DISTINCT visual treatment — pick the one whose shape fits the idea:
- "boxes": cards in a grid — distinct concepts, features, or benefits shown side by side
- "bullets": a clean vertical list — supporting details or hierarchical points
- "sequence": a connected timeline/flow — chronological or ordered progression where order matters
- "steps": numbered step-by-step blocks — procedures, how-tos, tutorials
- "quotes": one large centered quotation — testimonials or expert statements (full-width, no image)
- "circles": a circular/cyclical arrangement — interconnected concepts or loops (full-width, no image)
- "numbers": big bold statistics — metrics and numerical highlights rendered as hero numbers
- "comparison": a side-by-side split — two options, before/after, or pros vs cons
- "funnel": narrowing stages — conversion flows, drop-off, or prioritization
- "images": an image gallery/grid — visual-first slides (requires images)
- "bento": an asymmetric card mosaic with one hero card — features, categories, or a product overview
- "timeline": a horizontal roadmap with milestones on a spine — chronological phases, history, or a plan
- "spotlight": ONE bold centered statement — a thesis, key insight, or punchy takeaway (use for "statement" slides; keep to 1-2 short items)
- "agenda": a numbered table of contents / agenda — section overviews or "what we'll cover"
- "pyramid": a layered hierarchy from apex to base — priorities, maturity levels, or a hierarchy of needs
- "matrix": a 2x2 quadrant grid — strategic trade-offs, four categories, or an effort/impact split (best with exactly 4 items)
- "callout": a highlighted key-note box — an important note, warning, or takeaway to spotlight
- "table": a clean data table — structured rows of label/value pairs or side-by-side comparisons
- "dashboard": KPI metric cards — several numbers/metrics shown together (each item should contain a number)
- "team": people cards with avatar initials — team members, contributors, or roles (label = name, text = role)
- "icongrid": a feature grid with icon chips — capabilities or benefits at a glance
- "hubspoke": a central hub with radiating spokes — one core idea connected to related parts (first item = the hub)
- "cycle": a circular loop — repeating processes or continuous cycles where the end feeds the start
- "showcase": a split editorial layout — a big lead idea on the left with supporting feature points on the right
- "checklist": a checkmark list — takeaways, requirements, action items, or do's (handles detailed points well)
- "roadmap": a vertical timeline with a spine — phases, milestones, or a plan (room for longer descriptions)
- "zigzag": alternating left/right cards down the slide — a process or story told with some detail
- "definitionlist": a term → definition list — glossaries, concepts, or "what each means" (handles long definitions)
- "editorial": magazine-style numbered content — oversized ghost numerals, number-badge cards, or header-band cards; great for "3 things to remember", principles, lessons, or ranked points (handles longer text well)
- "orbit": circle-based relationship diagrams — concentric rings around a core idea, three overlapping circles, phase-status circles, or a spectrum line (SHORT labels only, 3-5 items)

LAYOUT STRUCTURE CATALOG (exact budgets — the outline MUST fit the layout you choose):
${buildLayoutStructureCatalog()}

WRITE THE OUTLINE TO FIT YOUR CHOSEN LAYOUT (critical):
- After picking a slide's contentLayoutHint, its bulletPoints COUNT must fall inside that layout's item range from the catalog above.
- Write every bullet as "Label: text" — Label 1-4 words, text within the layout's word budget.
- Examples: "matrix" needs exactly 4 quadrant items; "spotlight" needs 1 statement; "orbit" needs 3-4 very short items; "editorial" fits 3-6 fuller items.
${
  textDensity === "minimal"
    ? `- TEXT DENSITY = MINIMAL: the user wants very little text per card. Favor visual/diagram layouts (orbit, cycle, icongrid, spotlight, timeline, matrix) and keep even text layouts to short fragments.`
    : textDensity === "detailed" || textDensity === "extensive"
      ? `- TEXT DENSITY = ${textDensity.toUpperCase()}: the user wants substantial text per card. Prefer text-friendly layouts (editorial, boxes, bullets, checklist, definitionlist, showcase, zigzag, roadmap) and use diagram layouts sparingly (max 1-2 per deck).`
      : ""
}

FIT THE LAYOUT TO THE TEXT LENGTH (critical):
- Diagram layouts — "cycle", "pyramid", "hubspoke", "funnel", "matrix", "orbit" — only look good with SHORT labels (a few words per item). Do NOT choose them when the items carry full-sentence or long descriptions; the text won't fit.
- For items with longer descriptions or full sentences, prefer text-friendly layouts: "boxes", "bullets", "checklist", "definitionlist", "editorial", "roadmap", "zigzag", "showcase", or "agenda".
- "quotes" is ONLY for a single real quotation with its author — never use it to hold several distinct points.

DECK DESIGN PLAN — think like an art director, not a list-maker. The layout catalog is LARGE; use its breadth:
1. RHYTHM ARC: design the deck as visual beats — open with context (agenda/editorial/bento), build with substance (boxes/checklist/definitionlist/showcase), punctuate with VISUAL MOMENTS (a diagram, a chart, a spotlight statement), and close with a decisive beat (checklist of next steps, spotlight, or callout). Alternate dense and airy slides — never three text-heavy layouts in a row.
2. HARD VARIETY QUOTAS: in a 10+ slide deck use AT LEAST 7 distinct categories; NO category more than twice per deck; NEVER the same contentLayoutHint on two consecutive slides. Include at least ONE diagram-family slide (orbit/cycle/pyramid/hubspoke/matrix/funnel), ONE data moment (chart or "dashboard"/"numbers"), and ONE statement beat ("spotlight" or "quotes") when the deck has 8+ slides.
3. SHAPE MATCHING (pick the sharpest fit, not the safest): process → "sequence"/"timeline"/"roadmap"/"funnel"; contrast or trade-off → "comparison"/"proscons"/"beforeafter"/"matrix"; transformation → "beforeafter"; statistics → "numbers"/"dashboard" (+ chart); ranked lessons or principles → "editorial"; ecosystem or one-idea-many-parts → "hubspoke"/"orbit"; recurring loop → "cycle"; hierarchy → "pyramid"; people → "team"; requirements/actions → "checklist"; glossary → "definitionlist"; overview/menu → "agenda"/"bento"; a single conviction → "spotlight".
4. Never default everything to "boxes" or "bullets" — reach for the specific layout that makes each idea LOOK like what it means.
TITLE slides do not need this field.

4. "assets":
Describe visual assets meaningfully.
CRITICAL: Visual assets (images) MUST be generated AFTER bullet points are created, so you have the full picture of the slide content.

LAYOUT-IMAGE COMPATIBILITY RULES (CRITICAL):
Some content layouts are INCOMPATIBLE with images and will automatically remove images if selected:
- "circles" layout: NEVER compatible with images (circular arrangements take full slide space)
- "quotes" layout: NEVER compatible with images (quote layouts are full-width focused)
- "sequence" layout: Some styles incompatible (vertical sequences like sequence-style-3, sequence-style-4)
- "steps" layout: Some styles incompatible (pyramid, arrows, bars styles)
- "images" layout: ALWAYS requires images (this layout is specifically for image galleries). When using this layout, the system will automatically generate 2-3 images for the slide to create a proper image gallery.
- IMAGE-COMPATIBLE layouts (use ONE of these whenever you want a supporting image on the slide): "boxes", "bullets", "numbers", "callout", "checklist", "agenda", "definitionlist", "editorial", "spotlight", "images"
- "spotlight" with an image becomes a striking full-bleed photo with the statement overlaid — great for a bold key message or section divider.
- NOT image-compatible (a requested image will be REMOVED): diagram layouts — "circles", "cycle", "pyramid", "hubspoke", "funnel", "matrix", "timeline", "comparison", "orbit", "quotes". If you want a slide to show an image, do NOT pick one of these; pick an image-compatible layout instead.

IMPORTANT: When suggesting contentLayoutHint, consider image compatibility:
- If you suggest "circles" or "quotes", set image.required to FALSE (these layouts cannot have images)
- If you suggest "images", set image.required to TRUE (this layout requires images)
- For other layouts, you can suggest images, but the system will automatically adjust if incompatible

- image:
  - required: true | false (TITLE slide ALWAYS true, content slides: consider layout compatibility)
  - orientation: "landscape" | "portrait" (choose based on slide layout and content - landscape for wide scenes, portrait for people/vertical subjects)
  - pexelsPromptHint: Short search keywords for Pexels API (3-5 words). MUST START with either "[people]" or "[no people]" to indicate if humans should appear, followed by concise search keywords that are Pexels-supported and represent the BEST use case for this slide. The prompt should summarize the full slide content by capturing ONE key/famous point that partially or fully represents the slide's main message. Think: "What is the most iconic, searchable visual that represents this slide's core idea?" Examples: "[people] business team collaboration" or "[no people] laptop workspace minimal". Keep it SHORT, Pexels-searchable, and focused on the slide's most representative visual concept.
  - aiPromptHint: Detailed, comprehensive description for AI image generation (50-100 words). Include: the main topic/theme from the user's original request, how this specific slide relates to that main topic, visual elements from the slide title and bullet points, style and mood, composition details. Be descriptive and wordy - this is for AI generation, not search. Example: "A professional illustration representing [main topic] focusing on [slide-specific concept]. The image should show [visual elements from title/bullets] in a [style] aesthetic, conveying [mood/feeling]. Include [specific details] to connect this slide's content back to the overarching theme of [main topic]."

VISUAL BALANCING RULES (USE IMAGES — they make the deck look professional and finished):
- TITLE slide ALWAYS requires an image.
- AT LEAST HALF of the content slides MUST carry a supporting image. For each of those slides, give it an IMAGE-COMPATIBLE content layout (boxes/bullets/numbers/callout/checklist/agenda/definitionlist/editorial/spotlight/images) AND set assets.image.required = true.
- Spread the images evenly across the deck (don't cluster them at the start) and vary the layout so consecutive image slides don't look identical.
- Only a MINORITY of slides should be text-only or diagram layouts. Reserve the diagram layouts (circles/cycle/pyramid/hubspoke/funnel/matrix/timeline/orbit) and "quotes" for those few slides, and set image required: false for them (the image would be removed anyway).
- If suggesting "images" layout, ALWAYS request images (set required: true).

CHARTS (real data visuals — use them!):
- For 1-2 slides per deck whose idea is inherently NUMERIC (growth, market size, share, comparison of quantities, budget split, conversion funnel, KPIs), add to that slide's assets:
  "chart": { "type": "bar" | "horizontal-bar" | "line" | "area" | "pie" | "donut" | "funnel" | "radar" | "kpi", "purpose": "one line describing what the chart shows" }
- Pick the type that matches the data shape: trends→line/area, composition→pie/donut, ranking/comparison→bar, stages→funnel, single headline metric→kpi, multi-dimension profile→radar.
- Chart slides should use a text-friendly contentLayoutHint ("bullets" or "editorial") and set assets.image.required = false (the chart IS the visual).
- Do NOT add charts to slides without genuinely quantitative content.

––––––––––––––––––––––––––––––––––––––
DECK-WIDE ART DIRECTION (CRITICAL FOR VISUAL COHESION)
––––––––––––––––––––––––––––––––––––––
Define ONE consistent art direction for the ENTIRE deck and return it in metadata.artDirection. A cohesive set of images looks designed; a pile of unrelated stock photos looks generic. Every aiPromptHint you write MUST conform to this same art direction so all images read as a single, intentional set.

metadata.artDirection fields:
- style: the visual medium and treatment used for ALL images (e.g., "editorial photography", "flat vector illustration", "isometric 3D render", "cinematic photography")
- palette: one consistent color mood (e.g., "warm earth tones", "cool muted blues", "high-contrast neon")
- mood: the emotional tone (e.g., "calm and premium", "energetic and bold")
- lighting: one consistent lighting style (e.g., "soft natural light", "dramatic low-key")

When writing each aiPromptHint, weave in this SAME style + palette + mood + lighting so the whole deck is visually consistent. Do not switch mediums between slides (e.g., don't mix photos and cartoons).

The outline must be well-structured, engaging, written in ${languageDescription}, using a ${toneDescription} tone, and applicable to any field. Output format must be a valid JSON object with a "slides" array.`;

  const userPrompt = `Create a presentation outline with exactly ${numberOfSlides} slides based on: "${description}"

MAIN TOPIC/THEME: "${description}" - This is the core topic the user requested. ALWAYS include this main topic context in both pexelsPromptHint and aiPromptHint when generating image prompts, even if individual slide bullets mention different specific things. The image should connect back to the main topic while also representing the slide's specific content.

CRITICAL REQUIREMENTS:
1. TITLE slide:
   - "type": "title"
   - "title": Extract the CORE TOPIC from the user's input and create a professional, compelling title.
     - IMPORTANT: Users often phrase requests as commands like "Make a presentation about X", "Create slides on Y", "I need a deck about Z"
     - STRIP command phrases: Remove phrases like "make a presentation about", "create a presentation on", "I want slides about", "build a deck on", etc.
     - EXTRACT the actual topic: From "Make a presentation about Ethiopia vs Egypt" → title should be "Ethiopia vs Egypt" (optionally with a subtitle phrase)
     - PRESERVE the topic's exact wording — only fix grammar/typos if needed
     - You may append a short clarifying phrase to expand scope (e.g., "Ethiopia vs Egypt: A Historical Comparison")
     - The title should be what would appear on a professional presentation cover, NOT a command
   - "subtitle": A short, compelling tagline expanding the title

2. CONTENT slides (${contentSlides} slides):
Each slide MUST include (IN THIS ORDER):
   - "type": "content"
   - "slideRole": one of "content" | "statement" | "data-moment" (see RHYTHM pacing rules below). Most slides are "content".
   - "title": catchy, attention-grabbing headline (max 5-7 words) use questions, bold claims, metaphors, or vivid phrases that spark curiosity and represent the slide's core message
   - "kicker": a SHORT 1-3 word UPPERCASE eyebrow label categorizing the slide (e.g. "STEP 2", "KEY INSIGHT", "THE PROBLEM", "OUR APPROACH", "BY THE NUMBERS"). Punchy and specific to THIS slide — must be different from the title, not a generic word like "CONTENT".
   - "semanticIntent": core meaning label (free-form, e.g., "process", "comparison", "framework")
   - "visualStrategy": { primary, pattern, emphasis } describing visual expression
   - "contentLayoutHint": Category suggestion from: "boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "comparison", "funnel", "images", "bento", "timeline", "spotlight", "agenda", "pyramid", "matrix", "callout", "table", "dashboard", "team", "icongrid", "hubspoke", "cycle", "showcase", "checklist", "roadmap", "zigzag", "definitionlist", "editorial", or "orbit" — chosen to match the idea's shape AND text length
   - "bulletPoints": Each bullet must be a complete, informative statement that delivers real value:
     * FORMAT: each bulletPoints entry MUST be a plain string (a full sentence) — NEVER an object like {"label": ..., "text": ...}
     * QUALITY: Write descriptive, self-contained statements — each bullet should explain, describe, or inform about the slide's topic
     * NOT commands ("Do this"), NOT labels ("Key point:"), NOT fragments — full sentences with substance
     * Each bullet should stand alone as useful information, not just hint at a concept
     * COUNT: 3 bullets ideal, 2-5 acceptable, 6 max — let content dictate, no filler
     * LENGTH: 15-25 words per bullet — enough to convey real information

3. Narrative structure:
   - FIRST (opening):
     - No generic titles (no "Introduction" or "Overview")
     - Use a hook: question, bold claim, insight, surprising fact, or vivid hook
   - MIDDLE (body):
     - Flow adapts naturally to the topic type
     - Each slide builds logically on the previous
   - RHYTHM (pacing — makes the deck breathe like a designed presentation, not a uniform list):
     * Most slides are "content".
     * Include 1-2 "statement" slides at key turning points — a single bold idea or claim meant to land as a full-bleed visual moment. Keep these minimal: a short punchy title, NO bullets or just one, and request an image (these become full-bleed background slides).
     * Include a "data-moment" slide when one striking statistic anchors the point — built around a single hero number (use contentLayoutHint "numbers").
     * Do NOT place two non-"content" slides back to back; space them out for rhythm.
   - LAST (closing):
     - NO generic titles (no "Conclusion" or "Summary")
     * The conclusion should feel like a natural, creative culmination of the entire presentation, not a formulaic ending.
     - The title must be highly creative and contextually relevant—it could be:
       - A thought-provoking question that ties back to the main idea
       - A poetic or metaphorical statement
       - A bold claim or insight
       - A reflective statement
       - A forward-looking vision
       - Any creative approach that feels native to the topic and provides a memorable closing
     - 3–6 bullets summarizing insights and direction
     * Must Done Rule "End with a standout final bullet that emotionally or intellectually lands the message—could be a question, playful nudge, confident command, poetic twist, vivid metaphor, surprising contrast, reflective prompt, or aspirational invite—anything that makes them pause and connect with the whole presentation"
    
4. Language & tone:
   - Language: ${languageDescription}
   - Tone: ${toneDescription}
   - Expert-level, clear, and visually skimmable
   - Titles on every slide must be clear, precise, and catchy—address the main point directly with crisp wording (questions, bold claims, vivid phrases). Keep the outline expert-level yet easily skimmable.

REQUIRED OUTPUT FORMAT

Return ONLY a valid JSON object in this exact structure:

{
  "slides": [
    {
      "type": "title",
      "title": "Title text",
      "subtitle": "Subtitle text",
      "image": {
        "required": true,
        "orientation": "landscape",
        "pexelsPromptHint": "[people] or [no people] + short search keywords",
        "aiPromptHint": "detailed comprehensive description for AI generation"
      }
    },
    {
      "type": "content",
      "slideRole": "content | statement | data-moment",
      "title": "catchy headline (max 5-7 words) — questions, bold claims, metaphors, vivid phrases",
      "kicker": "SHORT UPPERCASE EYEBROW (1-3 words, e.g. KEY INSIGHT)",
      "semanticIntent": "core meaning label (free-form)",
      "visualStrategy": {
        "primary": "dominant visual form",
        "pattern": "layout metaphor",
        "emphasis": "visual focus"
      },
      "contentLayoutHint": "boxes | bullets | sequence | steps | quotes | circles | numbers | comparison | funnel | images | bento | timeline | spotlight | agenda | pyramid | matrix | callout | table | dashboard | team | icongrid | hubspoke | cycle | showcase | checklist | roadmap | zigzag | definitionlist | editorial | orbit",
      "bulletPoints": [
        "Bullet point 1",
        "Bullet point 2",
        "Bullet point 3",
        "Bullet point n"
      ],
      "assets": {
        "image": {
          "required": false,
          "orientation": "landscape",
          "pexelsPromptHint": "[people] or [no people] + short search keywords",
          "aiPromptHint": "detailed comprehensive description for AI generation"
        }
      }
    }
  ],
  "metadata": {
    "topic": "${description}",
    "totalSlides": ${numberOfSlides},
    "tone": "${toneDescription}",
    "language": "${languageDescription}",
    "artDirection": {
      "style": "ONE consistent visual medium/treatment for ALL images",
      "palette": "ONE consistent color mood",
      "mood": "emotional tone",
      "lighting": "ONE consistent lighting style"
    }
  }
}
`;

  // 9. Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      let useGeminiFallback = false;
      
      // Helper function to process streaming and parse slides
      async function processStream(
        streamGenerator: AsyncIterable<string>,
        provider: "openai" | "gemini"
      ): Promise<string> {
        let fullContent = "";
        let lastParsedSlides = 0;

        for await (const content of streamGenerator) {
          fullContent += content;

          // Send raw chunk for progressive display
          if (content) {
            sendEvent(controller, "chunk", { content });
          }

          // Try to parse partial JSON to extract completed slides
          try {
            const slidesMatch = fullContent.match(/"slides"\s*:\s*\[([\s\S]*)/);
            if (slidesMatch && slidesMatch[1]) {
              const slidesContent = slidesMatch[1];
              let slideCount = 0;
              let depth = 0;
              let inString = false;
              let escaped = false;
              let slideStart = -1;
              const completedSlideStrings: string[] = [];

              for (let i = 0; i < slidesContent.length; i++) {
                const char = slidesContent[i];

                if (escaped) {
                  escaped = false;
                  continue;
                }

                if (char === "\\" && inString) {
                  escaped = true;
                  continue;
                }

                if (char === '"' && !escaped) {
                  inString = !inString;
                  continue;
                }

                if (inString) continue;

                if (char === "{") {
                  if (depth === 0) {
                    slideStart = i;
                  }
                  depth++;
                } else if (char === "}") {
                  depth--;
                  if (depth === 0 && slideStart !== -1) {
                    const slideStr = slidesContent.slice(slideStart, i + 1);
                    try {
                      const parsed = JSON.parse(slideStr);
                      if (parsed.type === "title" || parsed.type === "content") {
                        completedSlideStrings.push(slideStr);
                        slideCount++;
                      }
                    } catch {
                      // Not valid JSON yet
                    }
                    slideStart = -1;
                  }
                }
              }

              if (slideCount > lastParsedSlides) {
                for (let i = lastParsedSlides; i < slideCount; i++) {
                  try {
                    const slideJson = completedSlideStrings[i];
                    if (slideJson) {
                      const slide = normalizeSlideBullets(JSON.parse(slideJson));
                      sendEvent(controller, "slideComplete", {
                        slideIndex: i,
                        slide,
                        totalSlides: numberOfSlides,
                      });
                    }
                  } catch {
                    // Partial slide, skip
                  }
                }
                lastParsedSlides = slideCount;
              }
            }
          } catch {
            // Partial JSON, continue
          }
        }

        return fullContent;
      }

      async function* geminiStream(): AsyncIterable<string> {
        if (!gemini) throw new Error("Gemini API not configured");
        
        const model = gemini.getGenerativeModel({
          model: AI_MODELS.outline,
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 14000,
            responseMimeType: "application/json",
          },
        });

        const prompt = `${systemPrompt}\n\n${userPrompt}`;
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) yield text;
        }
      }

      // OpenAI Responses API streaming generator with web search
      async function* openaiStream(): AsyncIterable<string> {
        if (!openai) throw new Error("OpenAI API not configured");
        const response = await openai.responses.create({
          model: "gpt-4o-mini", // Using 4o-mini as fallback
          input: [
            {
              role: "system",
              content: [{ type: "input_text", text: systemPrompt }],
            },
            {
              role: "user",
              content: [{ type: "input_text", text: userPrompt }],
            },
          ],
      
          include: ["web_search_call.action.sources" as any],
      
          tools: [
            {
              type: "web_search_preview",
              search_context_size: "medium",
            },
          ],
      
          tool_choice: {
            type: "web_search_preview",
          },
      
          temperature: 1,
          max_output_tokens: 12000,
          stream: true,
        });
      
        for await (const event of response) {
          if (event.type === "response.output_text.delta") {
            if (event.delta) yield event.delta;
          }
      
          if (event.type === "response.completed") return;
        }
      }

      // Helper to attempt JSON repair for truncated responses
      function tryRepairJson(jsonStr: string): string {
        let repaired = jsonStr.trim();
        
        // Count open brackets/braces
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escaped = false;
        
        for (const char of repaired) {
          if (escaped) {
            escaped = false;
            continue;
          }
          if (char === '\\' && inString) {
            escaped = true;
            continue;
          }
          if (char === '"' && !escaped) {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
        }
        
        // If we're in a string, close it
        if (inString) {
          repaired += '"';
        }
        
        // Close any open brackets/braces
        while (openBrackets > 0) {
          repaired += ']';
          openBrackets--;
        }
        while (openBraces > 0) {
          repaired += '}';
          openBraces--;
        }
        
        return repaired;
      }

      try {
        // Send outline start event with ID
        sendEvent(controller, "outlineStart", {
          outlineId: outline.id,
          totalSlides: numberOfSlides,
        });

        let fullContent = "";

        // Try Gemini first
        try {
          fullContent = await processStream(geminiStream(), "gemini");
        } catch (geminiError) {
          // Log detailed error for debugging (server-side only)
          console.error("Primary AI provider (Gemini) failed:", geminiError);
          
          // Try OpenAI as fallback
          if (openai) {
            useGeminiFallback = false; // Actually using OpenAI as fallback
            sendEvent(controller, "info", { message: "Switching to backup provider..." });
            try {
              fullContent = await processStream(openaiStream(), "openai");
            } catch (openaiError) {
              // Log detailed error for debugging (server-side only)
              console.error("Backup AI provider (OpenAI) failed:", openaiError);
              throw new Error("AI_SERVICE_UNAVAILABLE");
            }
          } else {
            throw new Error("AI_SERVICE_UNAVAILABLE");
          }
        }

        // Parse final result (defensively handle markdown fences / extra text)
        let finalOutline;
        try {
          let jsonText = fullContent.trim();

          // If the model wrapped JSON in markdown fences (```json ... ```), strip them
          if (jsonText.startsWith("```")) {
            // Remove leading ```json or ``` and trailing ```
            jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/```$/, "").trim();
          }

          // As a fallback, extract from first '{' to last '}' to ignore any prose around the JSON
          const firstBrace = jsonText.indexOf("{");
          const lastBrace = jsonText.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonText = jsonText.slice(firstBrace, lastBrace + 1);
          }

          finalOutline = JSON.parse(jsonText);
        } catch (parseError) {
          // Try to repair truncated JSON (common with Gemini)
          console.warn("Initial parse failed, attempting JSON repair...");
          try {
            const repairedJson = tryRepairJson(fullContent);
            finalOutline = JSON.parse(repairedJson);
            console.log("JSON repair successful");
          } catch (repairError) {
            console.error("Failed to parse final outline:", parseError);
            sendEvent(controller, "error", { message: "Failed to parse outline" });

            await db.outline.update({
              where: { id: outline.id },
              data: { status: "failed" },
            });

            controller.close();
            return;
          }
        }

        // Validate outline structure
        if (!finalOutline.slides || !Array.isArray(finalOutline.slides)) {
          sendEvent(controller, "error", { message: "Invalid outline structure" });

          await db.outline.update({
            where: { id: outline.id },
            data: { status: "failed" },
          });

          controller.close();
          return;
        }

        // Validate and normalize metadata for all slides
        try {
          finalOutline = validateAndNormalizeOutline(finalOutline);
        } catch (validationError) {
          console.error("Outline validation failed:", validationError);
          sendEvent(controller, "error", { message: "Invalid outline structure" });

          await db.outline.update({
            where: { id: outline.id },
            data: { status: "failed" },
          });

          controller.close();
          return;
        }

        // Update outline in DB with final data
        await db.outline.update({
          where: { id: outline.id },
          data: {
            slides: finalOutline.slides,
            metadata: finalOutline.metadata || {
              topic: description,
              totalSlides: numberOfSlides,
              tone: toneDescription,
              language: languageDescription,
            },
            status: "completed",
          },
        });

        // Note: No credit deduction for outline generation - it's free
        // Credits are only deducted when creating the actual presentation

        // Send completion event (don't expose provider info to client)
        sendEvent(controller, "outlineDone", {
          outlineId: outline.id,
          slides: finalOutline.slides,
          metadata: finalOutline.metadata,
          creditsRemaining: user.credits,
        });

        controller.close();
      } catch (error) {
        // Log detailed error for debugging (server-side only)
        console.error("Streaming error:", error);
        
        // Sanitize error message for client - never expose internal details
        const sanitizedMessage = getSanitizedErrorMessage(error);
        sendEvent(controller, "error", { message: sanitizedMessage });

        // Update outline status to failed
        try {
          await db.outline.update({
            where: { id: outline.id },
            data: { status: "failed" },
          });
        } catch {
          // Ignore DB error during error handling
        }

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}



/**
 * Transform outline content into presentation-ready content using LLM
 * 
 * This transforms terse outline bullet points into rich, engaging presentation content
 * similar to how Gamma transforms outlines into presentations.
 * 
 * Uses OpenAI as primary API, Gemini as fallback.
 */

import { env } from "~/env.js";

export interface OutlineSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  contentLayoutHint?: string;
}

export interface TransformedSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  // For title slides
  tagline?: string;
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

const SYSTEM_PROMPT = `You are an expert presentation content writer. Your task is to transform outline bullet points into presentation-ready content with WELL-CRAFTED, DETAILED slide bullets and DETAILED speaker notes.

CRITICAL RULE: NEVER change slide titles. Keep them EXACTLY as provided. Only transform the content.

TRANSFORMATION RULES:
1. KEEP TITLES UNCHANGED - use the exact original title provided
2. EXPLAIN ALL BULLETS: Every single bullet point from the outline MUST be transformed into a well-crafted, detailed bullet. Do not skip or omit any outline bullets.
3. EXPAND AND ELABORATE: Each generated bullet should be MORE detailed than the corresponding outline bullet. Add context, examples, implications, causes, effects, or specific details. Make the content richer and more explanatory.
4. VISUAL EQUALITY: All bullet points should have visually similar length (approximately equal word count) so they look balanced on the slide. Maximum 30 words per bullet.
5. CREATE TWO VERSIONS OF EACH BULLET:
   - "bulletPoints": Well-crafted slide text (max 30 words each, visually equal length) - what appears on the slide
   - "speakerNotes": Even more detailed explanations (1-3 sentences each) - what the presenter reads
6. ADD SLIDE DESCRIPTION (OPTIONAL): Only include a slideDescription when it genuinely adds value. Write it as a natural, flowing description that introduces what the slide covers. Write it as if you're directly describing the topic itself, NOT describing the slide. 
   - BAD: "This slide highlights...", "This slide covers...", "In this slide we will...", "This slide explains..."
   - GOOD: "Understanding the core principles...", "Exploring the key factors...", "The foundation of modern approaches..."
   - Just describe the topic naturally. Maximum 2 lines. If not needed, omit it entirely.
7. The speaker notes should contain the full context, examples, and details

OUTPUT FORMAT (JSON):
For each slide, return:
{
  "type": "title" or "content",
  "title": "EXACT original title - DO NOT MODIFY",
  "subtitle": "For title slides only - enhanced subtitle",
  "tagline": "For title slides only - a compelling one-liner",
  "slideDescription": "OPTIONAL - natural 1-2 line description/gateway point (omit if not needed, max 2 lines)",
  "introText": "Optional intro paragraph before bullets/sections (1-2 sentences)",
  "bulletPoints": ["Well-crafted bullet 1 (max 30 words, visually equal length)", "Well-crafted bullet 2", ...] OR null if using sections,
  "speakerNotes": ["Detailed note for bullet 1 (1-3 sentences)", "Detailed note for bullet 2", ...],
  "sections": [{"heading": "Section Title", "description": "Brief description"}] OR null if using bullets,
  "suggestedLayout": "bullets" | "sections" | "two-column" | "three-cards"
}

BULLET POINT GUIDELINES:
- Slide bullets: Maximum 30 words each, visually equal length, well-crafted with expanded detail
- Ensure ALL outline bullets are transformed - none should be skipped
- Speaker notes: Full explanation with context, examples, data, implications

LAYOUT GUIDELINES:
- Use "sections" (2-4 titled cards) when bullets represent distinct concepts that deserve emphasis
- Use "bullets" for sequential steps, lists, or supporting details
- Use "two-column" for comparisons or before/after content
- Use "three-cards" for exactly 3 key points that are equally important

WRITING STYLE:
- Professional but engaging
- Active voice preferred
- Concrete and specific over vague
- Slide bullets are well-crafted and detailed; speaker notes are comprehensive`;

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string): Promise<string> {
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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[transform-outline] OpenAI API error: ${response.status}`, errorBody);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

/**
 * Call Gemini API (fallback)
 */
async function callGemini(prompt: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
  
  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[transform-outline] Gemini API error: ${response.status}`, errorBody);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call LLM with OpenAI primary, Gemini fallback
 */
async function callLLM(prompt: string): Promise<string> {
  // Try OpenAI first
  if (env.OPENAI_API_KEY) {
    try {
      console.log("[transform-outline] Using OpenAI API...");
      return await callOpenAI(prompt);
    } catch (error) {
      console.warn("[transform-outline] OpenAI failed, falling back to Gemini:", error);
    }
  }

  // Fallback to Gemini
  if (env.GEMINI_API_KEY) {
    console.log("[transform-outline] Using Gemini API (fallback)...");
    return await callGemini(prompt);
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
      suggestedLayout: "bullets"
    };
  }

  // Text density affects SPEAKER NOTES detail level
  const notesDetailGuidance = {
    minimal: "Speaker notes: 1 brief sentence per bullet with key facts only",
    concise: "Speaker notes: 1-2 sentences per bullet with context and key details",
    detailed: "Speaker notes: 2-3 sentences per bullet with examples and deeper explanation",
    extensive: "Speaker notes: Full paragraphs with examples, data, and comprehensive context"
  };

  const prompt = `Transform this outline slide into presentation-ready content with WELL-CRAFTED, DETAILED slide bullets and DETAILED speaker notes.

SLIDE ${slideIndex + 1} of ${totalSlides}:
Type: ${slide.type}
Original Title (DO NOT CHANGE): ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.bulletPoints ? `Bullet Points:\n${slide.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : ""}

CRITICAL REQUIREMENTS:
- Transform ALL ${slide.bulletPoints?.length || 0} outline bullets - do not skip or omit any
- Each generated bullet must be well-crafted and detailed, expanding on the outline with context, examples, implications
- Maximum 30 words per bullet
- All bullets should have visually similar length (approximately equal word count) for visual balance
- EXPAND and ELABORATE on the outline bullets - add context, examples, implications, causes, effects, or specific details
- Make the generated content MORE detailed and explanatory than the outline

REQUIREMENTS:
- Tone: ${options.tone || "professional"}
- Language: ${options.language || "English"}
- Slide bullets: Maximum 30 words each, visually equal length, well-crafted with expanded detail
- ${notesDetailGuidance[options.textDensity || "concise"]}

CRITICAL: The "title" field in your response MUST be exactly: "${slide.title}"

${slide.type === "title" ? `
For this TITLE slide:
- Keep the title EXACTLY as provided: "${slide.title}"
- Create an engaging subtitle that sets up the presentation
- Add a memorable tagline (short, impactful phrase)
` : `
For this CONTENT slide:
- Keep the title EXACTLY as provided: "${slide.title}"
- slideDescription (OPTIONAL): Only include if it genuinely adds value. Write it as a natural description of the topic itself, NOT a description of the slide. 
   - NEVER use: "This slide highlights", "This slide covers", "In this slide", "This slide explains", "We will explore", "Let's look at"
   - INSTEAD write directly about the topic: "Understanding the core principles...", "Exploring key factors...", "The foundation of..."
   - Write as if describing the subject matter directly. Maximum 2 lines. If not needed, omit it entirely.
- Create DETAILED bulletPoints (max 30 words each, visually equal length) - transform ALL ${slide.bulletPoints?.length || 0} outline bullets, expanding each with more detail
- Create DETAILED speakerNotes (1+ sentences each) - what the presenter reads
- The speakerNotes array must have the same length as bulletPoints (one note per bullet)
- Ensure ALL outline bullets are transformed - none should be skipped
- Decide if content works better as bullets OR titled sections
- If using sections, each section gets a heading and brief description
- Add an intro sentence if it helps set context
`}

Return ONLY valid JSON matching the format specified. No markdown, no explanation.`;

  try {
    const text = await callLLM(prompt);
    const transformed = parseJsonResponse(text);
    
    // Ensure type is preserved
    transformed.type = slide.type;
    
    // CRITICAL: Always use the original title - never let LLM change it
    transformed.title = slide.title;
    
    return transformed;
  } catch (error) {
    console.error(`[transform-outline] Error transforming slide ${slideIndex + 1}:`, error);
    // Return original content as fallback
    return {
      type: slide.type,
      title: slide.title,
      subtitle: slide.subtitle,
      bulletPoints: slide.bulletPoints,
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

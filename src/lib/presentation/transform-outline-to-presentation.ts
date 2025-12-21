/**
 * Transform outline content into presentation-ready content using LLM
 * 
 * This transforms terse outline bullet points into rich, engaging presentation content
 * similar to how Gamma transforms outlines into presentations.
 */

import { env } from "~/env.js";

export interface OutlineSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
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
  // Layout hint based on content structure
  suggestedLayout?: "bullets" | "sections" | "two-column" | "three-cards";
}

export interface TransformOptions {
  tone?: string;
  language?: string;
  textDensity?: "minimal" | "concise" | "detailed" | "extensive";
}

const SYSTEM_PROMPT = `You are an expert presentation content writer. Your task is to transform outline bullet points into rich, engaging presentation content.

CRITICAL RULE: NEVER change slide titles. Keep them EXACTLY as provided. Only transform the content (bullets, subtitles, etc.).

TRANSFORMATION RULES:
1. KEEP TITLES UNCHANGED - use the exact original title provided
2. EXPAND terse bullet points into full, descriptive sentences
3. ADD context and flow - include introductory sentences where appropriate
4. CREATE visual hierarchy - transform some bullet lists into titled sections/cards
5. ENRICH language - use more descriptive, engaging, presentation-ready prose
6. MAINTAIN the core message but make it more impactful

OUTPUT FORMAT (JSON):
For each slide, return:
{
  "type": "title" or "content",
  "title": "EXACT original title - DO NOT MODIFY",
  "subtitle": "For title slides only - enhanced subtitle",
  "tagline": "For title slides only - a compelling one-liner",
  "introText": "Optional intro paragraph before bullets/sections (1-2 sentences)",
  "bulletPoints": ["Enhanced bullet 1", "Enhanced bullet 2", ...] OR null if using sections,
  "sections": [{"heading": "Section Title", "description": "Full description"}] OR null if using bullets,
  "suggestedLayout": "bullets" | "sections" | "two-column" | "three-cards"
}

LAYOUT GUIDELINES:
- Use "sections" (2-4 titled cards) when bullets represent distinct concepts that deserve emphasis
- Use "bullets" for sequential steps, lists, or supporting details
- Use "two-column" for comparisons or before/after content
- Use "three-cards" for exactly 3 key points that are equally important

WRITING STYLE:
- Professional but engaging
- Active voice preferred
- Concrete and specific over vague
- Each bullet/section should be self-contained and impactful`;

/**
 * Transform a single slide's content using LLM
 */
async function transformSlideContent(
  slide: OutlineSlide,
  slideIndex: number,
  totalSlides: number,
  options: TransformOptions
): Promise<TransformedSlide> {
  const apiKey = env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("[transform-outline] GEMINI_API_KEY not configured, returning original content");
    return {
      type: slide.type,
      title: slide.title,
      subtitle: slide.subtitle,
      bulletPoints: slide.bulletPoints,
      suggestedLayout: "bullets"
    };
  }

  const densityGuidance = {
    minimal: "Keep content very brief - short phrases, 3-4 words per bullet max",
    concise: "Keep content concise but complete - one clear sentence per point",
    detailed: "Provide detailed explanations - 1-2 sentences per point with context",
    extensive: "Provide comprehensive content - full paragraphs with examples and details"
  };

  const prompt = `Transform this outline slide into presentation-ready content.

SLIDE ${slideIndex + 1} of ${totalSlides}:
Type: ${slide.type}
Original Title (DO NOT CHANGE): ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.bulletPoints ? `Bullet Points:\n${slide.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : ""}

REQUIREMENTS:
- Tone: ${options.tone || "professional"}
- Language: ${options.language || "English"}
- Text Density: ${options.textDensity || "concise"} - ${densityGuidance[options.textDensity || "concise"]}

CRITICAL: The "title" field in your response MUST be exactly: "${slide.title}"

${slide.type === "title" ? `
For this TITLE slide:
- Keep the title EXACTLY as provided: "${slide.title}"
- Create an engaging subtitle that sets up the presentation
- Add a memorable tagline (short, impactful phrase)
` : `
For this CONTENT slide:
- Keep the title EXACTLY as provided: "${slide.title}"
- Decide if content works better as enhanced bullets OR titled sections
- If bullets are distinct concepts, convert to sections with headings + descriptions
- If bullets are steps/lists, enhance them as richer bullet points
- Add an intro sentence if it helps set context
`}

Return ONLY valid JSON matching the format specified. No markdown, no explanation.`;

  try {
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[transform-outline] API error: ${response.status}`, errorBody);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up response - remove markdown code blocks if present
    let cleanJson = text.trim();
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

    const transformed = JSON.parse(cleanJson) as TransformedSlide;
    
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

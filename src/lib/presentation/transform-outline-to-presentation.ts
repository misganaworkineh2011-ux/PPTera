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
5. VISUAL EQUALITY: All items should have visually similar length (approximately equal word count/size) so they look balanced. Maximum 30 words per text item.
6. AVOID QUOTE-HEAVY LAYOUTS: Create proper content with actionable statements, not just quotes or citations (unless using quote layout).
7. TITLE SLIDE EXCELLENCE: For title slides, create LONGER, MORE COMPELLING subtitles (40-60 words) and powerful taglines (10-15 words) that make an amazing first impression.
8. CREATE TWO VERSIONS OF EACH ITEM:
   - Content items: Well-crafted slide text (max 30 words each, visually equal length) - what appears on the slide
   - "speakerNotes": Even more detailed explanations (1-3 sentences each) - what the presenter reads
   
OUTPUT FORMAT (JSON):
For each slide, return:
{
  "type": "title" or "content",
  "title": "EXACT original title - DO NOT MODIFY",
  "subtitle": "For title slides: ENHANCED 40-60 word compelling subtitle | For content: brief subtitle if needed",
  "tagline": "For title slides: POWERFUL 10-15 word tagline that crystallizes the message",
  "slideDescription": "OPTIONAL - For title slides: 2-3 sentences (40-60 words) providing rich context | For content slides: brief 1-2 sentence factual statement",
  "bulletPoints": ["Well-crafted bullet 1 (max 30 words, visually equal length)", "Well-crafted bullet 2", ...] OR null if using sections,
  "speakerNotes": ["Detailed note for bullet 1 (1-3 sentences)", "Detailed note for bullet 2", ...],
  "sections": [{"heading": "Section Title", "description": "Brief description"}] OR null if using bullets,
  "suggestedLayout": "bullets" | "sections" | "two-column" | "three-cards"
}

CONTENT ITEM GUIDELINES:
- ITEM COUNT: Generate 2-${maxItems} items per slide (maximum ${maxItems} items)
- MAXIMUM 30 WORDS: Each item should be concise but detailed (20-30 words ideal for text items)
- VISUALLY EQUAL LENGTH: All items should have similar word count/size for visual balance
- PROPER FORMAT: Use direct, actionable statements - NOT quotes or citations (except for quote layouts)
- AVOID SINGLE ITEMS: Never create slides with only 1 item (minimum 2 items)
- CONSOLIDATE WHEN NEEDED: If outline has many items, consolidate related points into fewer comprehensive items
- Ensure ALL outline content is transformed - consolidate if needed to respect maximum of ${maxItems}
- Speaker notes: Full explanation with context, examples, data, implications

LAYOUT GUIDELINES:
- Use "sections" (2-4 titled cards) when bullets represent distinct concepts that deserve emphasis
- Use "bullets" for sequential steps, lists, or supporting details
- Use "two-column" for comparisons or before/after content
- Use "three-cards" for exactly 3 key points that are equally important
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
    model: "gemini-flash-latest", // Same model as outline generation
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
 * Call LLM with OpenAI primary, Gemini fallback
 */
async function callLLM(prompt: string, maxItems: number): Promise<string> {
  // Try OpenAI first
  if (env.OPENAI_API_KEY) {
    try {
      console.log("[transform-outline] Using OpenAI API...");
      return await callOpenAI(prompt, maxItems);
    } catch (error) {
      console.warn("[transform-outline] OpenAI failed, falling back to Gemini:", error);
    }
  }

  // Fallback to Gemini
  if (env.GEMINI_API_KEY) {
    console.log("[transform-outline] Using Gemini API (fallback)...");
    return await callGemini(prompt, maxItems);
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

  const prompt = `Transform this outline slide into presentation-ready content with WELL-CRAFTED, DETAILED slide bullets and DETAILED speaker notes.

SLIDE ${slideIndex + 1} of ${totalSlides}:
Type: ${slide.type}
Original Title (DO NOT CHANGE): ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.bulletPoints ? `Bullet Points:\n${slide.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : ""}

CRITICAL REQUIREMENTS:
- MAXIMUM ${maxBullets} ITEMS: Generate no more than ${maxBullets} content items for this ${totalSlides}-slide presentation
- Transform ALL ${slide.bulletPoints?.length || 0} outline items - consolidate if needed to stay under ${maxBullets} items
- Each generated item must be well-crafted and detailed, expanding on the outline with context, examples, implications
- Maximum 30 words per text item (20-30 words ideal)
- All items should have visually similar length (approximately equal word count/size) for visual balance
- PROPER FORMAT: Use direct statements, NOT quotes or citations (unless using quote layout)
- AVOID SINGLE ITEMS: Never generate slides with only 1 item (minimum 2-3 items)
- EXPAND and ELABORATE on the outline items - add context, examples, implications, causes, effects, or specific details
- Make the generated content MORE detailed and explanatory than the outline
- If outline has more than ${maxBullets} items, consolidate related points into comprehensive items

REQUIREMENTS:
- Tone: ${options.tone || "professional"}
- Language: ${options.language || "English"}
- Slide bullets: Maximum 30 words each, visually equal length, well-crafted with expanded detail
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
- slideDescription (OPTIONAL): A brief 1-2 sentence factual statement about the topic that appears BETWEEN the title and content.
   - Only include if it genuinely adds value
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
- Create DETAILED content with MAXIMUM ${maxBullets} ITEMS (max 30 words each for text, visually equal length)
   - Transform ALL ${slide.bulletPoints?.length || 0} outline items
   - If outline has more than ${maxBullets} items, consolidate related points into ${maxBullets} comprehensive items
   - If outline has fewer items, expand each one with more detail (but don't exceed ${maxBullets} total)
   - Use DIRECT STATEMENTS, not quotes or citations (unless using quote layout)
   - NEVER create slides with only 1 item (minimum 2-3 items)
   - Choose appropriate format: bulletPoints, sections, or other content structure
- Create DETAILED speakerNotes (1+ sentences each) - what the presenter reads
- The speakerNotes array must have the same length as content items (one note per item)
- Ensure ALL outline items are transformed - consolidate if needed to respect the ${maxBullets} item maximum
- Decide if content works better as bullets, sections, boxes, steps, sequence, numbers, circles, quotes, or images
- ALL LAYOUTS must respect the ${maxBullets} item maximum
`}

Return ONLY valid JSON matching the format specified. No markdown, no explanation.`;

  try {
    const text = await callLLM(prompt, maxBullets);
    let transformed = parseJsonResponse(text);
    
    // Ensure type is preserved
    transformed.type = slide.type;
    
    // CRITICAL: Always use the original title - never let LLM change it
    transformed.title = slide.title;
    
    // VALIDATION: Enforce maximum items and avoid single items for all layouts
    if (transformed.type === "content") {
      const bulletCount = transformed.bulletPoints?.length || 0;
      const sectionCount = transformed.sections?.length || 0;
      const totalItems = Math.max(bulletCount, sectionCount);
      
      // Check if only 1 item (not allowed)
      if (totalItems === 1) {
        console.warn(`[transform-outline] Slide ${slideIndex + 1} has only 1 item, retrying...`);
        const retryPrompt = prompt + `\n\nIMPORTANT: The previous response had only 1 item. You MUST generate 2-${maxBullets} items. Expand or split the content.`;
        const retryText = await callLLM(retryPrompt, maxBullets);
        const retryTransformed = parseJsonResponse(retryText);
        retryTransformed.type = slide.type;
        retryTransformed.title = slide.title;
        
        const retryBulletCount = retryTransformed.bulletPoints?.length || 0;
        const retrySectionCount = retryTransformed.sections?.length || 0;
        const retryTotalItems = Math.max(retryBulletCount, retrySectionCount);
        
        // If still only 1 item, use fallback
        if (retryTotalItems < 2) {
          console.warn(`[transform-outline] Retry still has < 2 items, using fallback`);
          return {
            type: slide.type,
            title: slide.title,
            subtitle: slide.subtitle,
            bulletPoints: slide.bulletPoints?.slice(0, maxBullets) || [],
            suggestedLayout: "bullets"
          };
        }
        
        transformed = retryTransformed;
      }
      
      // Enforce maximum items for all content types
      if (bulletCount > maxBullets) {
        console.warn(`[transform-outline] Slide ${slideIndex + 1} has ${bulletCount} bullets, trimming to ${maxBullets}`);
        transformed.bulletPoints = transformed.bulletPoints?.slice(0, maxBullets);
        transformed.speakerNotes = transformed.speakerNotes?.slice(0, maxBullets);
      }
      
      if (sectionCount > maxBullets) {
        console.warn(`[transform-outline] Slide ${slideIndex + 1} has ${sectionCount} sections, trimming to ${maxBullets}`);
        transformed.sections = transformed.sections?.slice(0, maxBullets);
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

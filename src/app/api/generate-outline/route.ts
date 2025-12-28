import { NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";
import { getAuthUser } from "~/lib/clerk-server";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Define slide limits by plan
const PLAN_SLIDE_LIMITS = {
  free: 10,
  starter: 20,
  pro: 50,
  enterprise: 70,
} as const;

// Define valid slide options by plan
const getMaxSlidesForPlan = (plan: string | null | undefined): number => {
  if (!plan) return PLAN_SLIDE_LIMITS.free;
  const planLower = plan.toLowerCase() as keyof typeof PLAN_SLIDE_LIMITS;
  return PLAN_SLIDE_LIMITS[planLower] ?? PLAN_SLIDE_LIMITS.free;
};

// Validate requested slides against plan
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

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        { status: 401 }
      );
    }

    // 3. Check credits
    if (user.credits > 100) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "You don't have enough credits. Please purchase more credits or upgrade your plan.",
          credits: user.credits,
        },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { description, numberOfSlides, tone, language } = body as {
      description?: string;
      numberOfSlides?: number;
      tone?: string;
      language?: string;
    };

    // 5. Validate required fields
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Missing description", message: "Please provide a description of what you want to create" },
        { status: 400 }
      );
    }

    if (!numberOfSlides || numberOfSlides < 1) {
      return NextResponse.json(
        { error: "Invalid slides", message: "Please specify the number of slides" },
        { status: 400 }
      );
    }

    // 6. Validate slide count against user's plan
    const slideValidation = validateSlideCount(numberOfSlides, user.subscriptionPlan);
    if (!slideValidation.valid) {
      return NextResponse.json(
        {
          error: "Slide limit exceeded",
          message: `Your plan allows up to ${slideValidation.maxAllowed} slides. You requested ${numberOfSlides}.`,
          maxAllowed: slideValidation.maxAllowed,
          plan: user.subscriptionPlan || "free",
        },
        { status: 403 }
      );
    }

    // 7. Build the prompt for OpenAI
    const toneDescription = tone || "professional";
    const languageDescription = language || "english";
    const contentSlides = numberOfSlides - 1; // First slide is the title slide

    const systemPrompt = `You are an expert presentation creator and content strategist. Your task is to create a detailed, high-quality presentation outline in JSON format.

CRITICAL QUALITY STANDARDS:
1. Professional expertise and clarity: Write the outline as if you are a master/expert in the specific field or topic. The content should demonstrate deep knowledge and professional understanding, but remain accessible and easy to understand - like a well-crafted PowerPoint presentation. Use clear, concise language that balances expertise with clarity. Avoid jargon unless necessary, and when using technical terms, ensure the context makes them understandable. The outline should feel authoritative and professional while being digestible for the intended audience.

2. Adaptive narrative flow: Structure MUST adapt organically to the specific topic.
   - FIRST: Analyze the topic's intent, audience, and natural progression before creating any slides
   - THEN: Design a custom narrative flow that emerges naturally from the subject matter itself
   - DO NOT force the topic into any predefined template or category
   - Let the content dictate the structure - each topic has its own inherent logic and flow
   - The progression should feel intuitive and native to the subject, not formulaic
   - Not every topic needs problems, solutions, methods, tools, or any specific pattern - use what genuinely fits

   EXAMPLES OF ADAPTIVE FLOW BASED ON TOPIC INTENT:

   Example 1 - "How to Start a Business" (How-To Topics):
   - Start with a hook (attention-grabbing fact or question)
   - Then foundation/preparation (what's needed before starting)
   - Break into sequential steps (Step 1, Step 2, Step 3, etc. - each step gets its own slide)
   - Add practical tips or common mistakes
   - End with a creative, engaging closing
   
   Example 2 - "Understanding Climate Change" (Analytical Topics):
   - Start with a hook (compelling data or insight)
   - Establish the foundation (what it is, core concept)
   - Build understanding (causes, mechanisms, science)
   - Present evidence (current impacts, data, statistics)
   - Show implications (future projections, consequences)
   - Offer solutions or actions
   - End with a creative, thought-provoking closing
   
   Example 3 - "Introduction to Machine Learning" (Concept Topics):
   - Start with a hook (engaging introduction to the concept)
   - Define the concept clearly
   - Break down into components/types/categories
   - Show real-world applications and examples
   - Explain how it works (process or mechanism)
   - Provide practical guidance or next steps
   - End with a creative, forward-looking closing
   
   KEY PRINCIPLE: Always break down the topic into logical steps/phases that build upon each other. Each slide should advance the narrative naturally. For process topics, use sequential steps. For concepts, use foundation → details → application. For analysis, use context → data → insights → implications.

   OUTPUT CLEANLINESS – CRITICAL:
   - NEVER reference these instructions, templates, or any prompt guidance in the output
      
3. Real-time data and statistics: When appropriate for the topic, include current data, statistics, or real-time information. NOT all topics need this - use judgment:
   - Topics about prevalence, trends, or current events: Include relevant statistics
   - Educational "what is" and How-to or process topics: May not need statistics
   - Analytical or research topics: Should include data
   - CRITICAL DATA REQUIREMENTS:
     * ALWAYS cite data in this format: "Statistic or number (Source Name, Year)" - e.g., "0.67% (Ethiopian Public Health Institute, 2025)", "610,000 people (UNAIDS, 2023)"
     * Include specific numbers, percentages, and metrics - avoid vague statements
     * Data MUST ONLY come from trustworthy, authoritative sources:
     * When presenting data, include context: show comparisons, trends, disparities, or implications
     * Include both positive progress AND challenges/concerns when relevant - provide balanced perspective

4. Scientific and evidence-based content: When solutions, tools, methods, or examples are provided, use scientific, evidence-based approaches when the topic requires it (health, science, research, etc.). Examples should be realistic and demonstrate actual utilization. Make it practical and applicable to real-world scenarios.

5. Actionable content: Provide specific, practical tips and actionable advice - avoid vague motivation or generic statements. Include concrete examples, case studies, exercises, or activities that make content tangible and applicable.

6. Famous quotes and sayings (when appropriate):
   Sometimes, when it genuinely enhances the content and adds depth, include relevant famous quotes or sayings by notable persons about the main idea or related concepts.
   - Only include quotes when they meaningfully contribute to the slide's message
   - Cite quotes properly: "Quote text" — Author Name
   - Use quotes that are relevant, inspiring, or provide valuable perspective
   - Do not force quotes into every slide; use judgment to determine when they add value

7. Bullet point quality - CRITICAL: See detailed requirements in section 2 of user prompt below.

8. Professional expertise and clarity: Write the outline as if you are a master/expert in the specific field or topic. The content should demonstrate deep knowledge and professional understanding, but remain accessible and easy to understand - like a well-crafted PowerPoint presentation. Use clear, concise language that balances expertise with clarity. Avoid jargon unless necessary, and when using technical terms, ensure the context makes them understandable. The outline should feel authoritative and professional while being digestible for the intended audience.

––––––––––––––––––––––––––––––––––––––

VISUAL & DESIGN INTELLIGENCE (CRITICAL)

––––––––––––––––––––––––––––––––––––––

Each slide MUST encode visual meaning—not just text.

For every CONTENT slide, determine and include:

1. "semanticIntent":
A short, descriptive label that captures the core meaning of the slide in natural language.
This is NOT a fixed category system and MUST NOT be treated as a limited set.
You may invent new intent labels freely when they better express the idea.
Illustrative examples (non-exhaustive, non-binding): process, concept, comparison, hierarchy, timeline, framework, data insight, causal chain, mental model, transformation, pattern, trade-off, narrative moment.

2. "visualStrategy":
Describe how the idea wants to be visually expressed.
This is guidance, not a preset library.
You may combine, invent, or adapt patterns freely as needed.
Fields:
- primary: the dominant visual form (free-form, e.g., diagram, image, mixed)
- pattern: a descriptive layout metaphor (free-form text, e.g., stairs, split, cards, grid, pyramid, spotlight, flow)
- emphasis: what the visual should highlight (free-form text, e.g., progression, contrast, relationship, scale, emotion, clarity)

3. "contentLayout":
Determine the content layout method for the slide.
- For ALL content slides, set this to "box" (this indicates the slide should use box/card layout)
- TITLE slides do not need this field
- This field determines how the bullet points will be arranged visually

4. "assets":
Describe visual assets meaningfully. Invent freely if better suited.
CRITICAL: Visual assets (images) MUST be generated AFTER bullet points are created, so you have the full picture of the slide content.
- image:
  - required: true | false (TITLE slide ALWAYS true, content slides: 5-7 out of 10 slides should have images)
  - style: free-form style descriptor (e.g., conceptual-illustration, realistic-photo, abstract, flat-illustration, mockup)
  - promptHint: short meaning-driven description (never decorative, think outside the box using both title AND bullet points)

VISUAL BALANCING RULES:
- TITLE slide ALWAYS requires an image
- Images: 5-7 out of 10 slides (think outside the box using title + bullet points for inspiration)

RULES:
- One primary visual per slide
- Images must be meaning-driven
- NEVER add visuals arbitrarily

The outline must be well-structured, engaging, written in ${languageDescription}, using a ${toneDescription} tone, and applicable to any field. Output format must be a valid JSON object with a "slides" array.`;

    const userPrompt = `Create a presentation outline with exactly ${numberOfSlides} slides based on: "${description}"

CRITICAL REQUIREMENTS:
1. TITLE slide:
   - "type": "title"
   - "title": Use the user's input as the base, but you may:
     * Use it EXACTLY as provided, OR
     * Expand it to add clarity or context (e.g., add descriptive words, enhance the phrasing)
     * Fix any typos or grammar errors if present
     * DO NOT delete any words from the original input
     * DO NOT change the core meaning or intent
   - "subtitle": A brief, compelling tagline or subtitle that expands on the title

2. CONTENT slides (${contentSlides} slides):
Each slide MUST include (IN THIS ORDER):
   - "type": "content"
   - "title": A clear, narrative-advancing heading
   - "semanticIntent"
   - "visualStrategy"
   - "contentLayout": "box" (REQUIRED - all content slides must use box layout)
   - "bulletPoints": 3–6 bullets that are:
     (Generate bullet points FIRST, then generate assets based on the full content)
   - "assets": (Generate AFTER bullet points)
     * CRITICAL: Bullet points must be SUBSTANTIAL, DETAILED, and SELF-CONTAINED - they should fully explain the concept within themselves, not be brief statements that feel like they need expansion
     * Slide-bullet style (not prose): one idea per bullet; short, skimmable cues that can be spoken over; avoid paragraph-like sentences. Bullets should create quick visual hierarchy (primary vs. supporting), be readable in 3–5 seconds, and stay modular (can be revealed or rearranged). Good: "Urban HIV prevalence is higher than rural areas". Bad: "Urban areas tend to show significantly higher HIV prevalence due to migration, population density, and access to services."
     * Count variety: Use a mix of counts (3-6). Favor 4-6 bullets when advising, teaching, or giving frameworks; 3 is acceptable only when truly sufficient.
     * Length: Make bullet points a mix of medium and longer when needed - they should be comprehensive enough to stand alone as complete explanations, not dry or brief
     * Each bullet should be a complete, standalone explanation that fully develops the idea with context, implications, causes, effects, or details within the bullet point itself
     * Be SPECIFIC and CONCRETE: Mention actual items, steps, facts, ingredients, tools, methods, examples, numbers, or specific details - NOT vague statements like "Understand the role of...", "Importance of...", or "Explore the significance of..."
     * If offering advice or “how to” guidance, mention scientifically proven or evidence-backed methods relevant to the domain; when using frameworks or acronyms (e.g., SMART), briefly spell out what each term means in context.

3. NARRATIVE STRUCTURE:
   - FIRST (intro):
     * No generic titles ("Introduction", "Overview").
     * Title must be attention-grabbing (e.g., sharp question like why/how/what-if, hard truth, surprising fact, or vivid hook) that tees up the main point.
     * Bullets act as the “entrance” to the main thread—each should pull the audience into the core idea.
   - MIDDLE (body):
     * Adapt flow to the topic type (educational, problem-solving, strategic, creative, analytical, how-to, etc.).
     * Pick the structure that fits best.
     * Each slide should build logically on the previous one.
   - LAST (conclusion):
     * CRITICAL: This slide requires deep analysis of the content and main idea to create a truly creative and contextually appropriate conclusion.
     * NO generic titles like "Conclusion", "Summary", "Call to Action", "CTA", or "Next Steps".
     * The title must be highly creative and contextually relevant—it could be:
       - A thought-provoking question that ties back to the main idea
       - A poetic or metaphorical statement
       - A bold claim or insight
       - A reflective statement
       - A forward-looking vision
       - Any creative approach that feels native to the topic and provides a memorable closing
     * Analyze the entire presentation's narrative, the core message, and the audience's journey to determine the most impactful way to conclude.
     * Provide 4-6 bullets that:
       - Summarize key takeaways in a meaningful way
       - Provide clear next steps or actionable items (without saying "next steps" in the title)
       - End with a standout final bullet that emotionally or intellectually lands the message—could be a question, playful nudge, confident command, poetic twist, vivid metaphor, surprising contrast, reflective prompt, or aspirational invite—anything that makes them pause and connect with the whole presentation
     * The conclusion should feel like a natural, creative culmination of the entire presentation, not a formulaic ending.
   
4. LANGUAGE & TONE:
   - Language must be ${languageDescription}
   - Tone must be ${toneDescription}
   - Content should work for any field (business, education, technology, marketing, science, etc.)
   - Titles on every slide must be clear, precise, and catchy—address the main point directly with crisp wording (questions, bold claims, vivid phrases). Keep the outline expert-level yet easily skimmable.
   - Write as a master/expert in the specific topic area - demonstrate professional expertise while keeping content clear and accessible, like a well-crafted PowerPoint presentation

5. CONTENT LAYOUT (CRITICAL):
   - ALL content slides MUST include "contentLayout": "box"
   - This field determines how the bullet points will be arranged visually
   - TITLE slides do not need this field

6. VISUAL BALANCING RULES (CRITICAL):
   - TITLE slide ALWAYS requires an image (required: true)
   - Content slides: 5-7 out of 10 slides should have images (required: true)
   - For image generation: Don't depend only on title - also examine bullet points and think outside the box for meaningful visual representation
   - IMPORTANT: Generate bullet points FIRST, then generate visual assets (images) based on the complete slide content

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
        "style": "style descriptor",
        "promptHint": "meaning-driven description"
      }
    },
    {
      "type": "content",
      "title": "Slide title",
      "semanticIntent": "core meaning of the slide (invented freely, non-restrictive)",
      "visualStrategy": {
        "primary": "dominant visual form (free-form, e.g., diagram, image, mixed)",
        "pattern": "layout metaphor or pattern (free-form text)",
        "emphasis": "visual emphasis or focus (free-form text)"
      },
      "contentLayout": "box",
      "bulletPoints": [
        "Bullet point 1",
        "Bullet point 2",
        "Bullet point 3"
      ],
      "assets": {
        "image": {
          "required": false,
          "style": null,
          "promptHint": null
        }
      }
    }
  ],
  "metadata": {
    "topic": "${description}",
    "totalSlides": ${numberOfSlides},
    "tone": "${toneDescription}",
    "language": "${languageDescription}"
  }
}
`;

    // 8. Generate outline with OpenAI (with web search enabled for current data)
    // Use Responses API for web search support (web_search only works with responses API, not chat.completions)
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Use Responses API with web search enabled (non-reasoning mode)
    // Use web_search_preview for basic web search
    const response = await openai.responses.create({
      model: "gpt-4o", // Using gpt-4o for web search support
      tools: [
        {
          type: "web_search_preview", // Enable basic web search (non-reasoning mode)
        },
      ],
      input: combinedPrompt,
      temperature: 0.7,
      max_output_tokens: 4000,
    });

    let responseContent = response.output_text || "";

    // If web search was used, the response should include current data
    // Now convert to JSON format if needed
    if (!responseContent || !responseContent.trim().startsWith("{")) {
      // Use chat.completions for JSON formatting (since responses API doesn't support response_format)
      const jsonCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a JSON formatter. Convert the provided content into the exact JSON format specified.",
          },
          {
            role: "user",
            content: `Convert the following outline into the exact JSON format. Include all current data and statistics from the web search with proper citations in format 'Statistic (Source Name, Year)'. Return ONLY a valid JSON object with structure: { slides: [...], metadata: {...} }\n\nContent to convert:\n${responseContent}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      });

      responseContent = jsonCompletion.choices[0]?.message?.content || "";
    }
    
    if (!responseContent || !responseContent.trim()) {
      return NextResponse.json(
        { error: "Generation failed", message: "Failed to generate outline. Please try again." },
        { status: 500 }
      );
    }

    // 9. Parse the response
    let outline;
    try {
      outline = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return NextResponse.json(
        { error: "Parse error", message: "Failed to process the generated outline. Please try again." },
        { status: 500 }
      );
    }

    // 10. Validate outline structure
    if (!outline.slides || !Array.isArray(outline.slides)) {
      return NextResponse.json(
        { error: "Invalid outline", message: "Generated outline has an invalid structure. Please try again." },
        { status: 500 }
      );
    }

    // 11. Deduct credits (only 1 credit for outline generation)
    await db.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 },
    });

    // 12. Return the outline
    return NextResponse.json({
      success: true,
      outline: outline.slides,
      metadata: outline.metadata || {
        topic: description,
        totalSlides: numberOfSlides,
        tone: toneDescription,
        language: languageDescription,
      },
      creditsRemaining: user.credits - 1,
    });

  } catch (error) {
    console.error("Outline generation error:", error);
    
    // Check for specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: "API Error", message: "Failed to connect to AI service. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}


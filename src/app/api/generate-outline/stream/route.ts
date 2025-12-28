import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

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

  // 3. Check credits
  if (user.credits < 1) {
    return new Response(
      JSON.stringify({ error: "Insufficient credits", message: "You don't have enough credits." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON", message: "Failed to parse request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { description, numberOfSlides, tone, language, outlineId } = body as {
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
1. Professional expertise and clarity: Write the outline as if you are a master/expert in the specific field or topic. The content should demonstrate deep knowledge and professional understanding, but remain accessible and easy to understand - like a well-crafted PowerPoint presentation. Use clear, concise language that balances expertise with clarity. Avoid jargon unless necessary, and when using technical terms, ensure the context makes them understandable. The outline should feel authoritative and professional while being digestible for the intended audience.

2. Adaptive narrative flow: Structure MUST adapt organically to the specific topic.
   - FIRST: Analyze the topic's intent, audience, and natural progression before creating any slides
   - THEN: Design a custom narrative flow that emerges naturally from the subject matter itself
   - DO NOT force the topic into any predefined template or category
   - Let the content dictate the structure - each topic has its own inherent logic and flow
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
   

   OUTPUT CLEANLINESS - CRITICAL:
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

6. Famous quotes and sayings (when appropriate only):
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
   - "title": Use the user's input as the base
     - May expand for clarity and to guide the outline formation to a defined flow
     - May fix grammar or typos
     - DO NOT delete words
     - DO NOT change intent
   - "subtitle": A short, compelling tagline expanding the title

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
     * If offering advice or "how to" guidance, mention scientifically proven or evidence-backed methods relevant to the domain; when using frameworks or acronyms (e.g., SMART), briefly spell out what each term means in context.

3. Narrative structure:
   - FIRST (opening):
     - No generic titles (no "Introduction" or "Overview")
     - Use a hook: question, bold claim, insight, surprising fact, or vivid hook
   - MIDDLE (body):
     - Flow adapts naturally to the topic type
     - Each slide builds logically on the previous
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
     - 4–6 bullets summarizing insights and direction
     * Must Done Rule "End with a standout final bullet that emotionally or intellectually lands the message—could be a question, playful nudge, confident command, poetic twist, vivid metaphor, surprising contrast, reflective prompt, or aspirational invite—anything that makes them pause and connect with the whole presentation"
    
4. Language & tone:
   - Language: ${languageDescription}
   - Tone: ${toneDescription}
   - Expert-level, clear, and visually skimmable
   - Titles on every slide must be clear, precise, and catchy—address the main point directly with crisp wording (questions, bold claims, vivid phrases). Keep the outline expert-level yet easily skimmable.

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
        "Bullet point 3",
        "Bullet point n"
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

  // 9. Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send outline start event with ID
        sendEvent(controller, "outlineStart", {
          outlineId: outline.id,
          totalSlides: numberOfSlides,
        });

        // Use chat.completions with streaming
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 1,
          max_tokens: 4000,
          stream: true,
        });

        let fullContent = "";
        let currentSlideIndex = -1;
        let lastParsedSlides = 0;

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullContent += content;

          // Send raw chunk for progressive display
          if (content) {
            sendEvent(controller, "chunk", { content });
          }

          // Try to parse partial JSON to extract completed slides
          try {
            // Attempt to extract slides array from partial JSON
            const slidesMatch = fullContent.match(/"slides"\s*:\s*\[([\s\S]*)/);
            if (slidesMatch && slidesMatch[1]) {
              // Try to find complete slide objects by looking for properly closed JSON objects
              const slidesContent = slidesMatch[1];
              
              // Count completed slides by finding slide objects that are properly closed
              // A slide starts with {"type": and ends with } followed by , or ]
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
                
                if (char === '\\' && inString) {
                  escaped = true;
                  continue;
                }
                
                if (char === '"' && !escaped) {
                  inString = !inString;
                  continue;
                }
                
                if (inString) continue;
                
                if (char === '{') {
                  if (depth === 0) {
                    slideStart = i;
                  }
                  depth++;
                } else if (char === '}') {
                  depth--;
                  if (depth === 0 && slideStart !== -1) {
                    // Found a complete slide object
                    const slideStr = slidesContent.slice(slideStart, i + 1);
                    try {
                      const parsed = JSON.parse(slideStr);
                      if (parsed.type === 'title' || parsed.type === 'content') {
                        completedSlideStrings.push(slideStr);
                        slideCount++;
                      }
                    } catch {
                      // Not valid JSON yet, continue
                    }
                    slideStart = -1;
                  }
                }
              }
              
              if (slideCount > lastParsedSlides) {
                // New slide(s) completed
                for (let i = lastParsedSlides; i < slideCount; i++) {
                  try {
                    const slideJson = completedSlideStrings[i];
                    if (slideJson) {
                      const slide = JSON.parse(slideJson);
                      currentSlideIndex = i;
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
            // Partial JSON, continue accumulating
          }
        }

        // Parse final result
        let finalOutline;
        try {
          finalOutline = JSON.parse(fullContent);
        } catch (parseError) {
          console.error("Failed to parse final outline:", parseError);
          sendEvent(controller, "error", { message: "Failed to parse outline" });
          
          await db.outline.update({
            where: { id: outline.id },
            data: { status: "failed" },
          });
          
          controller.close();
          return;
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

        // Deduct credits
        await db.user.update({
          where: { id: user.id },
          data: { credits: user.credits - 1 },
        });

        // Send completion event
        sendEvent(controller, "outlineDone", {
          outlineId: outline.id,
          slides: finalOutline.slides,
          metadata: finalOutline.metadata,
          creditsRemaining: user.credits - 1,
        });

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        sendEvent(controller, "error", {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        });

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


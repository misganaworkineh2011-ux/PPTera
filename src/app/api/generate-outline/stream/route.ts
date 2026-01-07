import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env";
import { db } from "~/server/db";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

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

   OUTPUT CLEANLINESS - CRITICAL:
   - NEVER reference these instructions, templates, or any prompt guidance in the output
      
3. Real-time data and statistics: When appropriate for the topic, include current data, statistics, or real-time information. NOT all topics need this - use judgment:
   - Topics about prevalence, trends, or current events: Include relevant statistics
   - Educational "what is" and How-to or process topics: May not need statistics
   - CRITICAL DATA REQUIREMENTS:
     * ALWAYS use the MOST RECENT data available — prioritize studies from 2023-2025
     * ALWAYS cite data in this format: "Statistic or number (Source Name, Year)"
     * Include specific numbers, percentages, and metrics — avoid vague statements
     * Data MUST come from trustworthy, authoritative sources relevant to the topic's domain
     * If recent data is unavailable, use the latest available and note the year clearly
   
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

Choose ONE category that best matches the content's nature:
- "boxes": Distinct concepts, features, benefits, categories that deserve equal visual weight
- "bullets": Traditional lists, supporting details, hierarchical content
- "sequence": Sequential processes, timelines, chronological flows where order matters
- "steps": Step-by-step guides, tutorials, procedural instructions with numbered steps
- "quotes": Testimonials, quotes, statements, expert opinions
- "circles": Interconnected concepts, cycles, circular relationships
- "numbers": Statistics, metrics, data points, numerical highlights

LAYOUT DISTRIBUTION: Aim for variety - use at least 3-4 different categories across a 10-slide deck.
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
- "boxes", "bullets", "numbers": Generally compatible with images

IMPORTANT: When suggesting contentLayoutHint, consider image compatibility:
- If you suggest "circles" or "quotes", set image.required to FALSE (these layouts cannot have images)
- If you suggest "images", set image.required to TRUE (this layout requires images)
- For other layouts, you can suggest images, but the system will automatically adjust if incompatible

- image:
  - required: true | false (TITLE slide ALWAYS true, content slides: consider layout compatibility)
  - orientation: "landscape" | "portrait" (choose based on slide layout and content - landscape for wide scenes, portrait for people/vertical subjects)
  - pexelsPromptHint: Short search keywords for Pexels API (3-5 words). MUST START with either "[people]" or "[no people]" to indicate if humans should appear, followed by concise search keywords that are Pexels-supported and represent the BEST use case for this slide. The prompt should summarize the full slide content by capturing ONE key/famous point that partially or fully represents the slide's main message. Think: "What is the most iconic, searchable visual that represents this slide's core idea?" Examples: "[people] business team collaboration" or "[no people] laptop workspace minimal". Keep it SHORT, Pexels-searchable, and focused on the slide's most representative visual concept.
  - aiPromptHint: Detailed, comprehensive description for AI image generation (50-100 words). Include: the main topic/theme from the user's original request, how this specific slide relates to that main topic, visual elements from the slide title and bullet points, style and mood, composition details. Be descriptive and wordy - this is for AI generation, not search. Example: "A professional illustration representing [main topic] focusing on [slide-specific concept]. The image should show [visual elements from title/bullets] in a [style] aesthetic, conveying [mood/feeling]. Include [specific details] to connect this slide's content back to the overarching theme of [main topic]."

VISUAL BALANCING RULES:
- TITLE slide ALWAYS requires an image
- Content slides: 6-9 out of 10 slides should have images, BUT respect layout-image compatibility rules
- If suggesting "circles" or "quotes" layout, do NOT request images (set required: false)
- If suggesting "images" layout, ALWAYS request images (set required: true)

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
   - "title": catchy, attention-grabbing headline (max 5-7 words) use questions, bold claims, metaphors, or vivid phrases that spark curiosity and represent the slide's core message
   - "semanticIntent": core meaning label (free-form, e.g., "process", "comparison", "framework")
   - "visualStrategy": { primary, pattern, emphasis } describing visual expression
   - "contentLayoutHint": Category suggestion from: "boxes", "bullets", "sequence", "steps", "quotes", "circles", or "numbers" based on content analysis
   - "bulletPoints": Use your judgment to determine the optimal number of bullets for each slide:
     * IDEAL: 3 bullets is the sweet spot for most slides — clean, focused, memorable
     * ACCEPTABLE: 2, 4, or 5 bullets ONLY when the content genuinely requires it
     * MAXIMUM: 6 bullets (use sparingly, only for comprehensive lists)
     * MINIMUM: 2 bullets (use for high-impact, focused slides)
     * BE SMART: Let the content dictate the count — don't pad with filler or cut essential points
     * FORBIDDEN FORMAT — NEVER USE: "Label: explanation" pattern (colon after a short label)
       ✗ WRONG: "Combatting Tilt: Utilize brief timeouts..."
       ✗ WRONG: "Pre-Game Visualization: Mentally rehearse..."
       ✗ WRONG: "Handle Pressure: Reframe high-stakes..."
       ✗ WRONG: "Emotional Control: Recognize the signs..."
       ✓ RIGHT: "Utilize brief, structured timeouts after mistakes to reset cognitive load."
       ✓ RIGHT: "Mentally rehearse successful strategies before games to reduce anxiety."
       ✓ RIGHT: "Reframe high-stakes situations as opportunities rather than threats."
       ✓ RIGHT: "Recognize physical and mental signs of frustration before they escalate."
     * Write flowing sentences that start directly with the action or insight — NO labels, NO prefixes
     * LENGTH: 25 words max per bullet

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
      "title": "catchy headline (max 5-7 words) — questions, bold claims, metaphors, vivid phrases",
      "semanticIntent": "core meaning label (free-form)",
      "visualStrategy": {
        "primary": "dominant visual form",
        "pattern": "layout metaphor",
        "emphasis": "visual focus"
      },
      "contentLayoutHint": "boxes | bullets | sequence | steps | quotes | circles | numbers",
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
    "language": "${languageDescription}"
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
                      const slide = JSON.parse(slideJson);
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

      // OpenAI streaming generator
      async function* openaiStream(): AsyncIterable<string> {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 1,
          max_tokens: 16000,
          stream: true,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) yield content;
        }
      }

      // Gemini streaming generator
      async function* geminiStream(): AsyncIterable<string> {
        if (!gemini) throw new Error("Gemini API not configured");
        
        const model = gemini.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 16000,
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

        // Try OpenAI first
        try {
          fullContent = await processStream(openaiStream(), "openai");
        } catch (openaiError) {
          console.error("OpenAI failed, trying Gemini fallback:", openaiError);
          
          // Try Gemini as fallback
          if (gemini) {
            useGeminiFallback = true;
            sendEvent(controller, "info", { message: "Switching to backup provider..." });
            fullContent = await processStream(geminiStream(), "gemini");
          } else {
            throw openaiError; // Re-throw if no Gemini available
          }
        }

        // Parse final result
        let finalOutline;
        try {
          finalOutline = JSON.parse(fullContent);
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
          provider: useGeminiFallback ? "gemini" : "openai",
        });

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        sendEvent(controller, "error", {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
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


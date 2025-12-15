import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found. Please try signing out and back in." },
        { status: 404 }
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
    const { description, numberOfSlides, tone, language } = body;

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

2. Adaptive narrative flow: Structure MUST adapt to the specific topic and field. Analyze the topic and choose the most appropriate flow:
   - For problem-solving topics: problem → analysis → solution → implementation → conclusion
   - For educational topics: overview → concepts → examples → applications → conclusion
   - For product/service topics: value proposition → features → benefits → use cases → conclusion
   - For strategic topics: current state → vision → strategy → roadmap → conclusion
   - For creative topics: inspiration → process → techniques → examples → conclusion
   - For analytical topics: context → data → insights → implications → conclusion
   - For how-to topics: overview → step-by-step → tips → common mistakes → conclusion
   - Adapt creatively - not every topic needs problems, solutions, methods, or tools. Choose what fits!
   
3. Creative, engaging introduction: FIRST content slide MUST be an introduction, but NEVER use generic titles like "Introduction" or "Overview". Use creative, engaging titles that pose thought-provoking questions, make bold statements, present intriguing insights, or challenge conventional thinking. Examples: "Why Most Presentations Fail Before They Start", "The Hidden Power of First Impressions", "What If Everything You Knew Was Wrong?"
   
4. Creative, topic-specific conclusion: LAST content slide MUST be a conclusion, but NEVER use generic titles like "Conclusion", "Summary", or generic phrases like "Your Next Move". Create a conclusion title that directly relates to and reflects the specific topic/idea. It should feel like a natural extension of the topic, not a generic template. The conclusion should:
   - Summarize key takeaways specific to the topic
   - Include a clear call to action relevant to the topic
   - Provide contextually relevant next steps or recommendations
   - Tie everything together in a way that's meaningful for the specific subject matter
   
5. Real-time data and statistics: When appropriate for the topic, include current data, statistics, or real-time information. NOT all topics need this - use judgment:
   - Topics about prevalence, trends, or current events: Include relevant statistics
   - Educational "what is" and How-to or process topics: May not need statistics
   - Analytical or research topics: Should include data
   - CRITICAL DATA REQUIREMENTS:
     * ALWAYS cite data in this format: "Statistic or number (Source Name, Year)" - e.g., "0.67% (Ethiopian Public Health Institute, 2025)", "610,000 people (UNAIDS, 2023)"
     * Include specific numbers, percentages, and metrics - avoid vague statements
     * Data MUST ONLY come from trustworthy, authoritative sources:
     * When presenting data, include context: show comparisons, trends, disparities, or implications
     * Include both positive progress AND challenges/concerns when relevant - provide balanced perspective

5. Scientific and evidence-based content: When solutions, tools, methods, or examples are provided, use scientific, evidence-based approaches when the topic requires it (health, science, research, etc.). Examples should be realistic and demonstrate actual utilization. Make it practical and applicable to real-world scenarios.

6. Actionable content: Provide specific, practical tips and actionable advice - avoid vague motivation or generic statements. Include concrete examples, case studies, exercises, or activities that make content tangible and applicable.

7. Bullet point quality - CRITICAL: See detailed requirements in section 2 of user prompt below.

8. Professional expertise and clarity: Write the outline as if you are a master/expert in the specific field or topic. The content should demonstrate deep knowledge and professional understanding, but remain accessible and easy to understand - like a well-crafted PowerPoint presentation. Use clear, concise language that balances expertise with clarity. Avoid jargon unless necessary, and when using technical terms, ensure the context makes them understandable. The outline should feel authoritative and professional while being digestible for the intended audience.

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
     Examples: 
     - Input: "marketing strategies" → Title: "Marketing Strategies" or "Effective Marketing Strategies"
     - Input: "what is hiv" → Title: "What is HIV?" or "Understanding HIV: What You Need to Know"
     - Input: "hiv prevalence in africa" → Title: "HIV Prevalence in Africa" or "HIV Prevalence in Africa: Current Trends and Analysis"
   - "subtitle": A brief, compelling tagline or subtitle that expands on the title

2. CONTENT slides (${contentSlides} slides):
   - "type": "content"
   - "title": A clear, descriptive heading that creates a strong narrative flow
   - "bulletPoints": An array of 3-6 bullet points (strings), each being:
     * CRITICAL: Bullet points must be SUBSTANTIAL, DETAILED, and SELF-CONTAINED - they should fully explain the concept within themselves, not be brief statements that feel like they need expansion
     * Length: Make bullet points a mix of medium and longer when needed - they should be comprehensive enough to stand alone as complete explanations, not dry or brief
     * Each bullet should be a complete, standalone explanation that fully develops the idea with context, implications, causes, effects, or details within the bullet point itself
     * Be SPECIFIC and CONCRETE: Mention actual items, steps, facts, ingredients, tools, methods, examples, numbers, or specific details - NOT vague statements like "Understand the role of...", "Importance of...", or "Explore the significance of..."
     * For "how-to" topics: Include actual steps, ingredients, tools, measurements, or specific actions with full context (e.g., "Rinse 1 cup sushi rice until water runs clear to remove starch", "Sushi rice (short-grain sticky rice) & rice vinegar seasoning")
     * For informational/analytical topics: Fully explain concepts with context, implications, and details (e.g., "Short scooter lifespan leads to frequent replacements, increasing environmental footprint", "Battery production and disposal generate toxic waste and require rare metals like lithium and cobalt")
     * Include specific numbers, percentages, or metrics when presenting data, with full context
     * Show HOW to implement when applicable with concrete steps or methods, fully explained

3. NARRATIVE STRUCTURE:
   - FIRST content slide: MUST be a creative, engaging introduction (never generic "Introduction")
     * Use a thought-provoking title that hooks the audience
     * Make them curious about what comes next
   
   - MIDDLE slides: Adapt the flow based on the topic's nature:
     * Analyze what type of content this is (educational, problem-solving, strategic, creative, analytical, how-to, etc.)
     * Choose the most appropriate flow structure for that type
     * Each slide should build logically on the previous one
    
   - LAST content slide: MUST be a creative, topic-specific conclusion (never generic "Conclusion" or generic phrases)
     * Create a conclusion title that directly relates to and reflects the specific topic/idea
     * The title should feel like a natural extension of the topic, not a generic template
     * Summarize key takeaways specific to the topic
     * Include a clear call to action relevant to the topic
     * Provide contextually relevant next steps, recommendations, or future directions
     * Tie everything together in a way that's meaningful for the specific subject matter
   
   - The flow should feel natural and tailored to the specific topic, not forced into a template
   
4. LANGUAGE & TONE:
   - Language must be ${languageDescription}
   - Tone must be ${toneDescription}
   - Content should work for any field (business, education, technology, marketing, science, etc.)
   - Write as a master/expert in the specific topic area - demonstrate professional expertise while keeping content clear and accessible, like a well-crafted PowerPoint presentation

Return ONLY a valid JSON object with this exact structure:
{
  "slides": [
    {
      "type": "title",
      "title": "Title text",
      "subtitle": "Subtitle text"
    },
    {
      "type": "content",
      "title": "Slide title",
      "bulletPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
    }
    // ... more content slides
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


import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";

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
        { error: "User not found", message: "User account not found" },
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
1. Adaptive narrative flow: Structure MUST adapt to the specific topic and field. Analyze the topic and choose the most appropriate flow:
   - For problem-solving topics: problem → analysis → solution → implementation → conclusion
   - For educational topics: overview → concepts → examples → applications → conclusion
   - For product/service topics: value proposition → features → benefits → use cases → conclusion
   - For strategic topics: current state → vision → strategy → roadmap → conclusion
   - For creative topics: inspiration → process → techniques → examples → conclusion
   - For analytical topics: context → data → insights → implications → conclusion
   - For how-to topics: overview → step-by-step → tips → common mistakes → conclusion
   - Adapt creatively - not every topic needs problems, solutions, methods, or tools. Choose what fits!
   
2. Creative, engaging introduction: FIRST content slide MUST be an introduction, but NEVER use generic titles like "Introduction" or "Overview". Use creative, engaging titles that pose thought-provoking questions, make bold statements, present intriguing insights, or challenge conventional thinking. Examples: "Why Most Presentations Fail Before They Start", "The Hidden Power of First Impressions", "What If Everything You Knew Was Wrong?"
   
3. Creative, topic-specific conclusion: LAST content slide MUST be a conclusion, but NEVER use generic titles like "Conclusion", "Summary", or generic phrases like "Your Next Move". Create a conclusion title that directly relates to and reflects the specific topic/idea. It should feel like a natural extension of the topic, not a generic template. The conclusion should:
   - Summarize key takeaways specific to the topic
   - Include a clear call to action relevant to the topic
   - Provide contextually relevant next steps or recommendations
   - Tie everything together in a way that's meaningful for the specific subject matter
   
4. Real-time data and statistics: When appropriate for the topic, include current data, statistics, or real-time information. NOT all topics need this - use judgment:
   - Topics about prevalence, trends, or current events: Include relevant statistics
   - Educational "what is" topics: May not need statistics
   - How-to or process topics: May not need statistics
   - Analytical or research topics: Should include data
   - CRITICAL DATA REQUIREMENTS:
     * Data MUST be CURRENT/RECENT - use the most up-to-date information available
     * ALWAYS cite data in this format: "Statistic or number (Source Name, Year)" - e.g., "0.67% (Ethiopian Public Health Institute, 2025)", "610,000 people (UNAIDS, 2023)"
     * Include specific numbers, percentages, and metrics - avoid vague statements
     * Data MUST ONLY come from trustworthy, authoritative sources:
       - Main authoritative sources (government agencies, official organizations, research institutions)
       - Trustworthy media channels (reputable news outlets, verified publications)
       - Respective stakeholders (official industry bodies, recognized experts, official reports)
     * Never use outdated data or data from unreliable sources
     * When presenting data, include context: show comparisons, trends, disparities, or implications
     * Include both positive progress AND challenges/concerns when relevant - provide balanced perspective

5. Scientific and evidence-based content: When solutions, tools, methods, or examples are provided, use scientific, evidence-based approaches when the topic requires it (health, science, research, etc.). Examples should be realistic and demonstrate actual utilization. Show HOW to implement or use solutions/tools/examples. Make it practical and applicable to real-world scenarios.

6. Topic-specific treatment: Different topics require different approaches. "What is HIV" (educational) vs "HIV prevalence in Africa" (analytical) should be structured differently. Educational topics focus on understanding and concepts. Prevalence/statistical topics focus on data, trends, and analysis. Always analyze the specific intent and nature of the topic.

7. Actionable content: Provide specific, practical tips and actionable advice - avoid vague motivation or generic statements. Include concrete examples, case studies, exercises, or activities that make content tangible and applicable, showing HOW to utilize them.

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
   - "bulletPoints": An array of 3-5 bullet points (strings), each being:
     * Specific, detailed, and informative (not vague or generic)
     * Include specific numbers, percentages, or metrics when presenting data
     * When citing data: Use format "Statistic (Source Name, Year)" - e.g., "0.67% (Ethiopian Public Health Institute, 2025)"
     * Practical with concrete examples, case studies, or real-world context when relevant
     * Show HOW to utilize or implement when applicable
     * Include context, comparisons, or implications when presenting statistics
     * Balance positive progress with challenges/concerns when relevant
     * Each bullet should be substantial enough to be meaningful, not just a phrase

3. NARRATIVE STRUCTURE:
   - FIRST content slide: MUST be a creative, engaging introduction (never generic "Introduction")
     * Use a thought-provoking title that hooks the audience
     * Make them curious about what comes next
     * Set the stage for the presentation
   
   - MIDDLE slides: Adapt the flow based on the topic's nature:
     * Analyze what type of content this is (educational, problem-solving, strategic, creative, analytical, how-to, etc.)
     * Choose the most appropriate flow structure for that type
     * Include only relevant sections (not every topic needs problems, solutions, methods, or tools)
     * For analytical/data-driven topics, structure may include: overview → breakdowns/categories → progress/achievements → challenges/concerns → risk factors → response/strategies
     * Each slide should build logically on the previous one
     * Include practical examples, activities, case studies, or real-world context where relevant
     * When topic requires it, include CURRENT real-time data/statistics in format "Statistic (Source Name, Year)", ONLY from trustworthy authoritative sources
     * Present data with context: show comparisons, disparities, trends, or implications
     * Include both achievements/progress AND challenges/concerns for balanced perspective
   
   - LAST content slide: MUST be a creative, topic-specific conclusion (never generic "Conclusion" or generic phrases)
     * Create a conclusion title that directly relates to and reflects the specific topic/idea
     * The title should feel like a natural extension of the topic, not a generic template
     * Use an impactful title that inspires action relevant to the topic
     * Summarize key takeaways specific to the topic
     * Include a clear call to action relevant to the topic (e.g., "Renew commitment from...", "Protect funding for...", "Implement strategies to...")
     * Provide contextually relevant next steps, recommendations, or future directions
     * Tie everything together in a way that's meaningful for the specific subject matter
   
   - The flow should feel natural and tailored to the specific topic, not forced into a template

4. CONTENT QUALITY:
   - Make content specific, detailed, and actionable - avoid vague or generic statements
   - When appropriate, include real-time data/statistics with these CRITICAL requirements:
     * Data MUST be CURRENT/RECENT - use the most up-to-date information available
     * ALWAYS cite data in format: "Statistic or number (Source Name, Year)" - e.g., "0.67% (Ethiopian Public Health Institute, 2025)", "610,000 people (UNAIDS, 2023)"
     * Include specific numbers, percentages, and metrics - avoid vague statements like "many" or "some"
     * Data MUST ONLY come from trustworthy sources: authoritative sources (government agencies, official organizations, research institutions), trustworthy media channels, or respective stakeholders
     * Present data with context: show comparisons, disparities, trends, or implications
     * Include both positive progress/achievements AND challenges/concerns when relevant - provide balanced perspective
   - Use scientific/evidence-based approaches when the topic requires it (health, science, research topics)
   - Show HOW to implement/utilize solutions, tools, and examples in practical scenarios
   - Include practical examples, case studies, exercises, or real-world context where appropriate
   - Balance different perspectives relevant to the topic
   - Ensure each slide builds logically on the previous one
   - Make bullet points substantial and informative - each should provide meaningful information, not just a phrase

5. LANGUAGE & TONE:
   - Language must be ${languageDescription}
   - Tone must be ${toneDescription}
   - Content should work for any field (business, education, technology, marketing, science, etc.)

Return ONLY a valid JSON object with this structure:
{
  "slides": [
    {
      "type": "title",
      "title": "Use user input exactly OR expand it (fix typos/grammar, add context, but never delete words)",
      "subtitle": "Brief compelling tagline"
    },
    {
      "type": "content",
      "title": "Creative Introduction Title (NOT 'Introduction') - e.g., 'Ethiopia's HIV Epidemic at a Glance (2024-2025)'",
      "bulletPoints": [
        "Specific statistic with citation: '0.67% (Source Name, Year)'",
        "Another detailed point with specific numbers and context",
        "Additional engaging point that sets the stage for the presentation"
      ]
    },
    {
      "type": "content",
      "title": "Middle slide title (adapt to topic flow, include data/statistics when relevant)",
      "bulletPoints": [
        "Detailed point with specific data: 'Statistic (Source Name, Year)' and context/comparison",
        "Another substantial point showing disparities, trends, or implications",
        "Actionable point with practical examples or real-world context"
      ]
    }
    // ... more content slides following the adaptive narrative flow
    // Include real-time data/statistics when topic requires it (prevalence, trends, analytical topics)
    // CRITICAL: Data MUST be CURRENT, cited as "Statistic (Source Name, Year)", and from trustworthy sources only
    // Include specific numbers, percentages, and metrics - avoid vague statements
    // Present data with context: comparisons, disparities, trends, implications
    // Include both progress/achievements AND challenges/concerns for balanced perspective
    // Provide scientific/evidence-based solutions when appropriate
    // Show HOW to implement/utilize examples and solutions
    {
      "type": "content",
      "title": "Topic-Specific Conclusion Title (NOT generic 'Conclusion' - must relate to topic, e.g., 'Sustaining Momentum to End HIV/AIDS in Ethiopia')",
      "bulletPoints": [
        "Key takeaway summary specific to the topic",
        "Another important insight or finding",
        "Clear call to action relevant to the topic (e.g., 'Renew commitment from...', 'Protect funding for...')",
        "Contextually relevant next steps or recommendations"
      ]
    }
  ],
  "metadata": {
    "topic": "${description}",
    "totalSlides": ${numberOfSlides},
    "tone": "${toneDescription}",
    "language": "${languageDescription}"
  }
}

REMEMBER:
- Title slide: Use exact user input OR expand it (fix typos/grammar, add context) - NEVER delete words
- First content slide = Creative introduction (never generic)
- Middle slides = Adaptive flow based on topic type, include data when relevant, show HOW to implement
- Last content slide = Topic-specific conclusion (relates to the topic, not generic)
- Different topics treated differently (educational vs analytical vs how-to, etc.)
- Scientific/evidence-based approaches when topic requires it
- Flow should feel natural and topic-specific, not template-based`;

    // 8. Generate outline with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
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


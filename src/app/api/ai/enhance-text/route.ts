import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "~/server/db";
import { env } from "~/env";

const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

export type AIAction = 
  | "improve"
  | "shorten"
  | "expand"
  | "professional"
  | "casual"
  | "fix-grammar"
  | "simplify"
  | "make-bold"
  | "add-emoji"
  | "translate";

// Helper to count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

const ACTION_PROMPTS: Record<AIAction, string> = {
  "improve": "You are editing text for a presentation slide. Improve this text to make it clearer, more engaging, and better written while keeping the same meaning. Keep it concise and suitable for a slide. Return only the improved text without any HTML tags or formatting.",
  "shorten": "You are editing text for a presentation slide. Make this text more concise while keeping the key message. Remove unnecessary words. Slides should be brief and impactful. Return only the shortened text without any HTML tags.",
  "expand": "You are editing text for a presentation slide. Expand this text with more details and context while keeping it relevant and engaging. IMPORTANT: The expanded text must NOT exceed twice the original word count. Keep it suitable for a presentation slide. Return only the expanded text without any HTML tags.",
  "professional": "You are editing text for a presentation slide. Rewrite this text in a professional, formal tone suitable for business presentations. Return only the rewritten text without any HTML tags.",
  "casual": "You are editing text for a presentation slide. Rewrite this text in a friendly, casual tone while keeping the message clear. Return only the rewritten text without any HTML tags.",
  "fix-grammar": "You are editing text for a presentation slide. Fix any grammar, spelling, or punctuation errors in this text. Return only the corrected text without any HTML tags.",
  "simplify": "You are editing text for a presentation slide. Simplify this text to make it easier to understand. Use simpler words and shorter sentences. Return only the simplified text without any HTML tags.",
  "make-bold": "You are editing text for a presentation slide. Make this text more impactful and bold. Use stronger words and more confident language suitable for a presentation. Return only the enhanced text without any HTML tags.",
  "add-emoji": "You are editing text for a presentation slide. Add 1-2 relevant emojis to this text to make it more engaging and visually appealing. Return only the text with emojis, no HTML tags.",
  "translate": "You are editing text for a presentation slide. Translate this text to English if it's not in English, or improve the English if it already is. Return only the translated/improved text without any HTML tags.",
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // AI text enhancement costs 1 credit
    const CREDIT_COST = 1;
    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: CREDIT_COST,
          available: user.credits,
        },
        { status: 403 }
      );
    }

    const { text, action, customPrompt } = await req.json() as { 
      text: string; 
      action: AIAction;
      customPrompt?: string;
    };

    if (!text || !action) {
      return NextResponse.json(
        { error: "Text and action are required" },
        { status: 400 }
      );
    }

    let systemPrompt = customPrompt || ACTION_PROMPTS[action];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // For expand action, add word count constraint
    const originalWordCount = countWords(text);
    const maxWordCount = originalWordCount * 2;
    
    if (action === "expand") {
      systemPrompt = `You are editing text for a presentation slide. Expand this text with more details and context while keeping it relevant and engaging. CRITICAL CONSTRAINT: The original text has ${originalWordCount} words. Your expanded text MUST NOT exceed ${maxWordCount} words (2x the original). Keep it suitable for a presentation slide. Return only the expanded text without any HTML tags.`;
    }

    let enhancedText: string;
    
    // Try Gemini first
    if (gemini) {
      try {
        console.log("[enhance-text] Using Gemini API...");
        const model = gemini.getGenerativeModel({ 
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        });

        const prompt = action === "expand" 
          ? `${systemPrompt}\n\nExpand this text (currently ${originalWordCount} words, max ${maxWordCount} words allowed):\n\n${text}`
          : `${systemPrompt}\n\n${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        enhancedText = response.text()?.trim() || text;
      } catch (geminiError) {
        console.warn("[enhance-text] Gemini failed, falling back to OpenAI:", geminiError);
        // Fallback to OpenAI
        throw new Error("OpenAI fallback disabled");
        enhancedText = completion.choices[0]?.message?.content?.trim() || text;
      }
    } else {
      // No Gemini, use OpenAI
      throw new Error("OpenAI fallback disabled");
      enhancedText = completion.choices[0]?.message?.content?.trim() || text;
    }

    // Deduct credit
    await db.user.update({
      where: { id: user.id },
      data: { credits: { decrement: CREDIT_COST } },
    });

    // Invalidate cache
    const { serverCache } = await import("~/lib/server-cache");
    serverCache.invalidatePattern(`user-${user.id}`);

    return NextResponse.json({ 
      success: true,
      text: enhancedText,
      creditsUsed: CREDIT_COST,
      creditsRemaining: user.credits - CREDIT_COST,
    });
  } catch (error) {
    console.error("AI enhance error:", error);
    return NextResponse.json(
      { error: "Enhancement failed" },
      { status: 500 }
    );
  }
}


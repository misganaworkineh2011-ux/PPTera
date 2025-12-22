import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

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

const ACTION_PROMPTS: Record<AIAction, string> = {
  "improve": "You are editing text for a presentation slide. Improve this text to make it clearer, more engaging, and better written while keeping the same meaning. Keep it concise and suitable for a slide. Return only the improved text without any HTML tags or formatting.",
  "shorten": "You are editing text for a presentation slide. Make this text more concise while keeping the key message. Remove unnecessary words. Slides should be brief and impactful. Return only the shortened text without any HTML tags.",
  "expand": "You are editing text for a presentation slide. Expand this text with more details and context while keeping it relevant and engaging. Keep it suitable for a presentation slide - not too long. Return only the expanded text without any HTML tags.",
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

    const systemPrompt = customPrompt || ACTION_PROMPTS[action];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim() || text;

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

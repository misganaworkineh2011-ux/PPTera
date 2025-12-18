import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import PptxGenJS from "pptxgenjs";
import { db } from "~/server/db";
import { env } from "~/env";
import { calculateSlideCredits, CREDIT_COSTS } from "~/lib/credits";
import { generateSlug } from "~/lib/utils";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

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

    const { topic, slides } = await req.json();
    
    // Calculate credits needed: 4 credits per slide
    const creditsNeeded = calculateSlideCredits(slides);

    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: creditsNeeded,
          available: user.credits,
          costPerSlide: CREDIT_COSTS.SLIDE,
        },
        { status: 403 }
      );
    }

    // Generate content with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a presentation expert. Generate structured slide content in JSON format with a 'slides' array.",
        },
        {
          role: "user",
          content: `Create ${slides} slides about "${topic}". Return a JSON object with a "slides" array. Each slide should have: title (string), content (array of 3-5 bullet points as strings). First slide should be a title slide with the topic name and a brief subtitle.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(
      completion.choices[0]?.message?.content || '{"slides":[]}'
    );
    const slideData = content.slides || [];

    // Create PowerPoint
    const pptx = new PptxGenJS();

    slideData.forEach((slide: any, index: number) => {
      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: "FFFFFF" };

      // Title
      pptSlide.addText(slide.title || "Untitled", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: index === 0 ? 44 : 32,
        bold: true,
        color: "1F4788",
        align: index === 0 ? "center" : "left",
      });

      // Content - format bullet points properly
      if (slide.content && Array.isArray(slide.content)) {
        const bulletPoints = slide.content.map((point: string) => ({
          text: point,
          options: { bullet: true, fontSize: 18, color: "363636" },
        }));

        pptSlide.addText(bulletPoints, {
          x: 0.5,
          y: index === 0 ? 2.5 : 2,
          w: 9,
          h: 4,
        });
      }
    });

    const buffer = (await pptx.write({
      outputType: "arraybuffer",
    })) as ArrayBuffer;

    // Calculate actual credits used based on slides generated
    const actualSlideCount = slideData.length;
    const creditsUsed = calculateSlideCredits(actualSlideCount);

    // OPTIMIZATION: Batch all database operations in a single transaction
    // This reduces 4 sequential DB calls to 1 atomic operation
    const [presentation] = await db.$transaction([
      // Create presentation
      db.presentation.create({
        data: {
          title: topic,
          content: content,
          slides: slideData,
          userId: user.id,
        },
      }),
      // Deduct credits atomically (4 credits per slide)
      db.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditsUsed } },
      }),
    ]);

    // OPTIMIZATION: Invalidate user cache after credit change
    const { serverCache } = await import("~/lib/server-cache");
    serverCache.invalidatePattern(`user-${user.id}`);

    // Non-critical operations can happen after response (fire and forget)
    // Using Promise.all for parallel execution, but not awaiting
    const slug = generateSlug(topic);
    Promise.all([
      db.notification.create({
        data: {
          userId: user.id,
          type: "success",
          title: "Presentation created",
          message: `Your presentation "${topic}" is ready to view. Used ${creditsUsed} credits (${actualSlideCount} slides × ${CREDIT_COSTS.SLIDE} credits).`,
          link: `/presentation/${slug}-${presentation.id}`,
        },
      }),
      db.activity.create({
        data: {
          userId: user.id,
          type: "create",
          description: `Created presentation "${topic}" (${actualSlideCount} slides, ${creditsUsed} credits)`,
          presentationId: presentation.id,
        },
      }),
    ]).catch((err) => console.error("Non-critical DB operation failed:", err));

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${topic.replace(/[^a-z0-9]/gi, "-")}.pptx"`,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

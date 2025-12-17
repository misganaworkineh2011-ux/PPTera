import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import PptxGenJS from "pptxgenjs";
import { db } from "~/server/db";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );
    }

    const { topic, slides } = await req.json();

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

    // Save to database
    const presentation = await db.presentation.create({
      data: {
        title: topic,
        content: content,
        slides: slideData,
        userId: user.id,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "success",
        title: "Presentation created",
        message: `Your presentation "${topic}" is ready to view`,
        link: `/presentation/${presentation.id}`,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: "create",
        description: `Created presentation "${topic}"`,
        presentationId: presentation.id,
      },
    });

    // Deduct credits
    await db.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 },
    });

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

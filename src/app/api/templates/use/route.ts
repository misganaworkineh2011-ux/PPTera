import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { getCuratedTemplate, type TemplateSlide } from "~/lib/templates/curated";

/**
 * POST — start a deck from a template. Creates a completed Outline from the
 * template skeleton and returns its id; the client sends the user into the
 * normal outline → generate flow (smart layouts, images, premium components).
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await request.json();
    const curatedId = typeof body?.curatedId === "string" ? body.curatedId : null;
    const templateId = typeof body?.templateId === "string" ? body.templateId : null;

    let slides: TemplateSlide[] | null = null;
    let topic = "New presentation";

    if (curatedId) {
      const tpl = getCuratedTemplate(curatedId);
      if (!tpl) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      slides = tpl.slides;
      topic = tpl.name;
    } else if (templateId) {
      const tpl = await db.template.findUnique({ where: { id: templateId } });
      if (!tpl || (tpl.userId !== authUser.id && !tpl.isPublic)) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      const config = (tpl.config ?? {}) as { slides?: TemplateSlide[] };
      slides = Array.isArray(config.slides) ? config.slides : null;
      topic = tpl.name;
    }

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: "Template has no slides" }, { status: 400 });
    }

    const outline = await db.outline.create({
      data: {
        userId: authUser.id,
        slides: JSON.parse(JSON.stringify(slides)),
        metadata: {
          topic,
          totalSlides: slides.length,
          tone: "professional",
          language: "english",
          source: "template",
        },
        status: "completed",
      },
      select: { id: true },
    });

    return NextResponse.json({ outlineId: outline.id });
  } catch (error) {
    console.error("Error using template:", error);
    return NextResponse.json({ error: "Failed to use template" }, { status: 500 });
  }
}

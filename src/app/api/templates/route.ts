import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { CURATED_TEMPLATES, type TemplateSlide } from "~/lib/templates/curated";
import type { SlideData } from "~/components/presentation/types";

// GET — curated templates + the user's saved templates
export async function GET() {
  try {
    const authUser = await requireAuth();
    const userTemplates = await db.template.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, category: true, config: true, createdAt: true },
    });

    return NextResponse.json({
      curated: CURATED_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        slideCount: t.slides.length,
        // Slide-flow preview for the gallery card
        flow: t.slides.filter((s) => s.type === "content").map((s) => s.title),
      })),
      mine: userTemplates.map((t) => {
        const config = (t.config ?? {}) as { slides?: Array<{ type?: string; title?: string }> };
        const slides = Array.isArray(config.slides) ? config.slides : [];
        return {
          id: t.id,
          name: t.name,
          category: t.category,
          slideCount: slides.length,
          flow: slides
            .filter((s) => s?.type === "content" && typeof s?.title === "string")
            .map((s) => s.title as string),
          createdAt: t.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Error listing templates:", error);
    return NextResponse.json({ error: "Failed to list templates" }, { status: 500 });
  }
}

/**
 * POST — save an existing presentation as a reusable template.
 * Stores a structure-only skeleton (titles, kickers, item labels, layout
 * hints) so reuse regenerates fresh content in the same shape.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await request.json();
    const presentationId = String(body?.presentationId ?? "");
    if (!presentationId) {
      return NextResponse.json({ error: "presentationId is required" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id: presentationId },
      select: { userId: true, title: true, slides: true },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }
    if (presentation.userId !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const slides = (Array.isArray(presentation.slides)
      ? presentation.slides
      : []) as unknown as SlideData[];

    const skeleton: TemplateSlide[] = slides.map((s, i) => ({
      type: s.type === "title" || i === 0 ? "title" : "content",
      title: s.title || `Slide ${i + 1}`,
      subtitle: s.subtitle,
      kicker: s.kicker,
      contentLayoutHint: s.contentLayout
        ? undefined // specific style ids aren't hints; derive category below
        : undefined,
      bulletPoints:
        s.transformedContent?.items?.map((it) =>
          it.label ? `${it.label}: ${it.text}` : `${it.text}`,
        ) ??
        s.bulletPoints?.map((bp) =>
          typeof bp === "string" ? bp : ((bp as { text?: string }).text ?? ""),
        ) ??
        s.sections?.map((sec) => `${sec.heading}: ${sec.description}`) ??
        [],
    }));

    const name =
      typeof body?.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 80)
        : `${presentation.title} (template)`;
    const category =
      typeof body?.category === "string" && body.category.trim()
        ? body.category.trim().slice(0, 40)
        : "My templates";

    const template = await db.template.create({
      data: {
        name,
        category,
        previewUrl: "",
        config: JSON.parse(JSON.stringify({ slides: skeleton })),
        isPublic: false,
        userId: authUser.id,
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}

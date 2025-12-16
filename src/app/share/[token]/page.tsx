import { notFound } from "next/navigation";
import { db } from "~/server/db";
import PresentationViewer from "~/app/presentation/[slug]/PresentationViewer";
import { type SlideData } from "~/components/presentation/types";

export default async function SharedPresentationPage({
  params,
}: {
  params: { token: string };
}) {
  const presentation = await db.presentation.findUnique({
    where: { shareToken: params.token },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!presentation || !presentation.isPublic) {
    notFound();
  }

  // Parse slides and content
  let slides: SlideData[] = [];

  try {
    const rawSlides = presentation.slides;
    if (typeof rawSlides === "string") {
      slides = JSON.parse(rawSlides) as SlideData[];
    } else if (Array.isArray(rawSlides)) {
      slides = rawSlides as unknown as SlideData[];
    }
  } catch (e) {
    console.error("Error parsing slides:", e);
  }

  let content: {
    theme?: string;
    themeConfig?: Record<string, unknown>;
    imageSource?: string;
    metadata?: Record<string, unknown>;
  } = {};

  try {
    const rawContent = presentation.content;
    if (typeof rawContent === "string") {
      content = JSON.parse(rawContent);
    } else if (rawContent && typeof rawContent === "object") {
      content = rawContent as typeof content;
    }
  } catch (e) {
    console.error("Error parsing content:", e);
  }

  return (
    <PresentationViewer
      presentation={{
        id: presentation.id,
        title: presentation.title,
        description: presentation.description,
        slides: slides,
        content: content,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt,
      }}
      mode="view"
      isOwner={false}
      isPublicView={true}
    />
  );
}

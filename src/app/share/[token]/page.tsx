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
          subscriptionPlan: true,
        },
      },
    },
  });

  if (!presentation || !presentation.isPublic) {
    notFound();
  }

  // Check if watermark should be shown (free users)
  const showWatermark = !presentation.user?.subscriptionPlan || 
    !["plus", "pro", "ultra"].includes(presentation.user.subscriptionPlan);

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
    <div className="relative">
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
      
      {/* Watermark for free users */}
      {showWatermark && (
        <a
          href="https://www.pptmaster.app"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-black/80 transition shadow-lg"
        >
          Made with PPTMaster
        </a>
      )}
    </div>
  );
}

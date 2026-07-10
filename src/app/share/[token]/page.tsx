import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { db } from "~/server/db";
import PresentationViewer from "~/app/presentation/[slug]/PresentationViewer";
import PasswordProtectedView from "~/components/presentation/share/PasswordProtectedView";
import { type SlideData } from "~/components/presentation/types";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const presentation = await db.presentation.findUnique({
    where: { shareToken: params.token },
  });

  if (!presentation || !presentation.isPublic) {
    return {
      title: "Presentation Not Found | PPTera",
    };
  }

  // Parse slides to get title slide image
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

  // Get title slide (first slide) image
  const titleSlide = slides[0];
  const ogImage = titleSlide?.image?.url || titleSlide?.images?.[0]?.url || "/og-image.jpeg";
  
  const title = `${presentation.title}`;
  const description = presentation.description || `View "${presentation.title}" presentation created with PPTera`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: presentation.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

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

  // Check Expiration
  if (presentation.shareExpiresAt && new Date() > presentation.shareExpiresAt) {
    notFound();
  }

  // Update View Count & Log Activity
  try {
    const isBot = false; // Simple check if needed
    if (!isBot) {
      await db.presentation.update({
        where: { id: presentation.id },
        data: { viewCount: { increment: 1 } },
      });

      await db.activity.create({
        data: {
          type: "view",
          description: `Presentation viewed via public link`,
          userId: presentation.userId,
          presentationId: presentation.id,
          metadata: { source: "public_link" },
        },
      });
    }
  } catch (err) {
    console.error("Failed to track view activity", err);
  }

  // Check if password protected
  const isPasswordProtected = !!presentation.sharePassword;

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
      {isPasswordProtected ? (
        <PasswordProtectedView 
          presentationId={presentation.id}
          correctPassword={presentation.sharePassword!}
          presentationData={{
            id: presentation.id,
            title: presentation.title,
            description: presentation.description,
            slides: slides,
            content: content,
            createdAt: presentation.createdAt,
            updatedAt: presentation.updatedAt,
          }}
          showWatermark={showWatermark}
        />
      ) : (
        <>
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
              href="https://www.pptera.com"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-black/80 transition shadow-lg"
            >
              <img 
                src="/logo.png" 
                alt="PPTera" 
                className="w-5 h-5 object-contain"
              />
              Made with PPTera
            </a>
          )}
        </>
      )}
    </div>
  );
}

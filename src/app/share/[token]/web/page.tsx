import { notFound, redirect } from "next/navigation";
import { type Metadata } from "next";
import { db } from "~/server/db";
import { getThemeById } from "~/lib/themes";
import { getGoogleFontsUrl } from "~/app/presentation/[slug]/components/types";
import WebPageView from "~/components/presentation/share/WebPageView";
import { type SlideData } from "~/components/presentation/types";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const presentation = await db.presentation.findUnique({
    where: { shareToken: params.token },
    select: { title: true, description: true, isPublic: true, slides: true },
  });

  if (!presentation || !presentation.isPublic) {
    return { title: "Presentation Not Found | PPTMaster" };
  }

  const slides = (Array.isArray(presentation.slides)
    ? presentation.slides
    : []) as unknown as SlideData[];
  const ogImage =
    slides[0]?.image?.url || slides[0]?.images?.[0]?.url || "/og-image.jpeg";
  const description =
    presentation.description ||
    `Read "${presentation.title}" as a web page — created with PPTMaster`;

  return {
    title: presentation.title,
    description,
    openGraph: {
      title: presentation.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: presentation.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: presentation.title,
      description,
      images: [ogImage],
    },
  };
}

// Gamma-style "publish to web": the shared deck rendered as a scrolling,
// responsive webpage instead of a slide canvas.
export default async function SharedWebPage({
  params,
}: {
  params: { token: string };
}) {
  const presentation = await db.presentation.findUnique({
    where: { shareToken: params.token },
    include: {
      user: { select: { subscriptionPlan: true } },
    },
  });

  if (!presentation || !presentation.isPublic) {
    notFound();
  }
  if (presentation.shareExpiresAt && new Date() > presentation.shareExpiresAt) {
    notFound();
  }
  // Password-protected decks use the deck view's password gate
  if (presentation.sharePassword) {
    redirect(`/share/${params.token}`);
  }

  // Count the page view (per-slide engagement arrives via beacons)
  try {
    await db.presentation.update({
      where: { id: presentation.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (err) {
    console.error("Failed to count web view", err);
  }

  let slides: SlideData[] = [];
  try {
    const rawSlides = presentation.slides;
    slides =
      typeof rawSlides === "string"
        ? (JSON.parse(rawSlides) as SlideData[])
        : ((rawSlides as unknown as SlideData[]) ?? []);
  } catch (e) {
    console.error("Error parsing slides:", e);
  }
  if (slides.length === 0) notFound();

  let content: { theme?: string } = {};
  try {
    const rawContent = presentation.content;
    content =
      typeof rawContent === "string"
        ? JSON.parse(rawContent)
        : ((rawContent as typeof content) ?? {});
  } catch {
    // fall through to default theme
  }

  const theme = getThemeById(content.theme ?? "");
  const fontsUrl = getGoogleFontsUrl(theme);
  const showWatermark =
    !presentation.user?.subscriptionPlan ||
    !["plus", "pro", "ultra"].includes(presentation.user.subscriptionPlan);

  return (
    <WebPageView
      presentationId={presentation.id}
      title={presentation.title}
      slides={slides}
      theme={theme}
      fontsUrl={fontsUrl}
      showWatermark={showWatermark}
    />
  );
}

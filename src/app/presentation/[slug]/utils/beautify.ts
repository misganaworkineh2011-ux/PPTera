import { selectLayout, type LayoutSelectionContext } from "~/lib/presentation/smart-layout";
import type { SlideData, ContentLayoutType } from "~/components/presentation/types";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";

/**
 * Beautify: re-run the smart layout engine over an existing deck.
 *
 * Rebuilds each content slide's contentLayout / slideLayout / imageSize with
 * full deck context (so the diversity scoring applies across the whole deck),
 * while leaving all text, images, charts, embeds and manual offsets untouched.
 * Great for imported or older decks that predate the premium layout system.
 */
export async function beautifyDeck(slides: SlideData[]): Promise<SlideData[]> {
  const context: LayoutSelectionContext = {
    slideIndex: 0,
    totalSlides: slides.length,
    previousLayouts: [],
    categoryUsage: new Map(),
    styleUsage: new Map(),
  };

  const result: SlideData[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;

    // Title slides keep their layout — only content slides are restyled.
    if (slide.type === "title" || i === 0) {
      result.push(slide);
      continue;
    }

    // Derive bullets for content analysis from whatever the slide carries.
    const bulletPoints: string[] =
      slide.bulletPoints && slide.bulletPoints.length > 0
        ? slide.bulletPoints.map((bp) =>
            typeof bp === "string" ? bp : ((bp as { text?: string }).text ?? ""),
          )
        : slide.transformedContent?.items?.length
          ? slide.transformedContent.items.map((it) =>
              it.label ? `${it.label}: ${it.text}` : `${it.text}`,
            )
          : (slide.sections ?? []).map(
              (s) => `${s.heading}: ${s.description}`,
            );

    const hasImage = Boolean(slide.image) || (slide.images?.length ?? 0) > 0;

    context.slideIndex = i;
    try {
      const selection = await selectLayout({
        slide: {
          type: "content",
          title: slide.title,
          subtitle: slide.subtitle,
          bulletPoints,
          semanticIntent: slide.semanticIntent,
          visualStrategy: slide.visualStrategy,
          // No hint: let content + diversity scoring choose freely.
          assets: {
            image: hasImage
              ? {
                  required: true,
                  orientation: "landscape" as const,
                  pexelsPromptHint: "",
                  aiPromptHint: "",
                }
              : undefined,
          },
        },
        context,
        options: { timeout: 2000 },
      });

      context.previousLayouts.push({
        slideIndex: i,
        category: selection.category,
        style: selection.style,
        slideLayout: selection.slideLayout,
      });
      const used = context.categoryUsage.get(selection.category) ?? 0;
      context.categoryUsage.set(selection.category, used + 1);

      result.push({
        ...slide,
        contentLayout: selection.style as ContentLayoutType,
        // Only steer image placement when the slide actually has an image;
        // never let beautify drop an existing image.
        slideLayout:
          hasImage && selection.slideLayout !== "no-image"
            ? (selection.slideLayout as SlideLayoutType)
            : slide.slideLayout,
        imageSize: hasImage
          ? ((selection.recommendedImageSize ?? slide.imageSize) as ImageSize | undefined)
          : slide.imageSize,
        imageShape: hasImage
          ? ((selection.recommendedImageShape ?? slide.imageShape) as ImageShape | undefined)
          : slide.imageShape,
      });
    } catch {
      // Selection failure = keep the slide as-is; beautify must never break a deck.
      result.push(slide);
    }
  }

  return result;
}

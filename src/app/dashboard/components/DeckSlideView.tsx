"use client";

import dynamic from "next/dynamic";
import SlideScaler from "~/components/presentation/SlideScaler";
import { TitleSlide } from "~/app/presentation/[slug]/components/TitleSlide";
import { type Theme } from "~/lib/themes";
import { coverUsesFullBleed, type SlideData } from "~/components/presentation/types";

// Heavy renderer loads on demand — only when a card actually shows a slide.
const SlideRenderer = dynamic(() => import("~/components/presentation/SlideRenderer"), {
  ssr: false,
});

/**
 * Read-only miniature of ONE real slide (true theme + layout), shared by the
 * static card cover and the hover preview. Fills its positioned parent.
 */
export default function DeckSlideView({
  slide,
  theme,
  index,
  totalSlides,
}: {
  slide: SlideData;
  theme: Theme;
  index: number;
  totalSlides: number;
}) {
  const isTitleCover = slide.type === "title" && !slide.slideLayout;
  const coverFullBleed = coverUsesFullBleed(slide.coverLayout);
  const titleImageUrl =
    slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          theme.pageBackgroundGradient || theme.pageBackground || theme.colors.background,
      }}
    >
      {isTitleCover ? (
        <>
          {coverFullBleed && titleImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={titleImageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <SlideScaler>
            <TitleSlide
              slide={slide}
              index={index}
              totalSlides={totalSlides}
              theme={theme}
              hasImage={!!titleImageUrl && coverFullBleed}
              isOwner={false}
              isFullscreen={false}
              isHovered={false}
              isEditing={false}
              editingText={null}
              onStartEditing={() => {}}
              onUpdateContent={() => {}}
              onFinishEditing={() => {}}
            />
          </SlideScaler>
        </>
      ) : (
        <SlideScaler>
          <SlideRenderer
            slide={slide}
            index={index}
            totalSlides={totalSlides}
            theme={theme}
            isOwner={false}
            isFullscreen={false}
            isHovered={false}
            isEditing={false}
            editingText={null}
            onStartEditing={() => {}}
            onUpdateContent={() => {}}
            onFinishEditing={() => {}}
            onAddBullet={() => {}}
            onDeleteBullet={() => {}}
          />
        </SlideScaler>
      )}
    </div>
  );
}

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { SlideData, SlideImage } from "./types";
import type { ImageShape, SlideLayoutType } from "~/lib/layouts/slide";
import { getImageShapeClipPath } from "~/lib/layouts/slide";
import SlideImageDesign from "./SlideImageDesign";
import ImageHoverToolbar from "./ImageHoverToolbar";
import ImageDragZones from "./ImageDragZones";

interface SlideSideImageLayoutsProps {
  layout: "left-content" | "right-content";
  slide: SlideData;
  index: number;
  hasImage: boolean;
  allImages: SlideImage[];
  colors: {
    bg: string;
    orb1: string;
    orb2: string;
    borderLine: string;
    accent: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  canEdit: boolean;
  isTitleSlide: boolean;
  imageShape: ImageShape;
  isThemeDark: boolean;
  hoveredImageIndex: number | null;
  setHoveredImageIndex: (index: number | null) => void;
  isDraggingImage: boolean;
  setIsDraggingImage: (value: boolean) => void;
  hasMultipleImages: boolean;
  onOpenImageModal?: (slideIndex: number, imageIndex?: number) => void;
  onRemoveImage?: (slideIndex: number, imageIndex: number) => void;
  onChangeImageShape?: (slideIndex: number, shape: ImageShape) => void;
  onChangeImagePosition?: (slideIndex: number, position: SlideLayoutType) => void;
  onReorderImages?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  renderTitle: (className: string) => ReactNode;
  renderDescription?: () => ReactNode;
  renderEnhanced: () => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
}

export default function SlideSideImageLayouts({
  layout,
  slide,
  index,
  hasImage,
  allImages,
  colors,
  useGradientClasses,
  customBgStyle,
  canEdit,
  isTitleSlide,
  imageShape,
  isThemeDark,
  hoveredImageIndex,
  setHoveredImageIndex,
  isDraggingImage,
  setIsDraggingImage,
  hasMultipleImages,
  onOpenImageModal,
  onRemoveImage,
  onChangeImageShape,
  onChangeImagePosition,
  onReorderImages,
  renderTitle,
  renderDescription,
  renderEnhanced,
  renderIndicator,
}: SlideSideImageLayoutsProps) {
  const firstImage = allImages[0];
  const isLeftContent = layout === "left-content";

  const bgClass = isLeftContent ? `bg-gradient-to-br ${colors.bg}` : `bg-gradient-to-bl ${colors.bg}`;
  const orbTop = isLeftContent ? colors.orb1 : colors.orb2;
  const orbBottom = isLeftContent ? colors.orb2 : colors.orb1;
  const indicatorPosition = isLeftContent ? "top-left" : "top-right";
  const imagePosition = isLeftContent ? "right" : "left";
  const clipClass = isLeftContent ? "slide-clip-left" : "slide-clip-right";
  const clipShape = getImageShapeClipPath(imageShape, imagePosition === "right" ? "right" : "left");

  return (
    <div className="h-full relative overflow-hidden">
      <div className={`absolute inset-0 ${useGradientClasses ? bgClass : ""}`} style={customBgStyle} />
      <div className={`absolute top-0 ${isLeftContent ? "right-0" : "left-0"} w-96 h-96 ${orbTop} rounded-full blur-3xl hidden sm:block`} />
      <div className={`absolute bottom-0 ${isLeftContent ? "left-0" : "right-0"} w-80 h-80 ${orbBottom} rounded-full blur-3xl hidden sm:block`} />

      {renderIndicator(indicatorPosition)}

      <div className={`relative h-full flex ${isLeftContent ? "flex-col sm:flex-row" : "flex-col-reverse sm:flex-row"} items-stretch`}>
        {isLeftContent ? (
          <>
            <div className={`flex flex-col justify-center pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-8 md:pb-12 pl-4 sm:pl-8 md:pl-12 pr-4 sm:pr-6 md:pr-8 ${hasImage ? "w-full sm:w-[60%]" : "w-full"}`}>
              {renderTitle("text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8")}
              {renderDescription ? renderDescription() : null}
              {!isTitleSlide && renderEnhanced()}
            </div>
            {hasImage && firstImage && (
              <div
                className={`w-full sm:w-[40%] relative overflow-hidden flex-shrink-0 min-h-[200px] sm:min-h-0 ${clipClass}`}
                onMouseEnter={() => canEdit && setHoveredImageIndex(0)}
                onMouseLeave={() => setHoveredImageIndex(null)}
              >
                <SlideImageDesign
                  image={firstImage}
                  alt={firstImage.alt || slide.title}
                  shape={imageShape}
                  orientation="right"
                  accent={colors.accent}
                  isDark={isThemeDark}
                  imgCursor={canEdit && onChangeImagePosition ? "grab" : "default"}
                  draggable={canEdit && !!onChangeImagePosition}
                  onDragStart={(e) => {
                    if (!canEdit || !onChangeImagePosition) return;
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", "image-drag");
                    setIsDraggingImage(true);
                  }}
                  onDragEnd={() => setIsDraggingImage(false)}
                />
                {canEdit && hoveredImageIndex === 0 && onOpenImageModal && onRemoveImage && onChangeImageShape && !isDraggingImage && (
                  <ImageHoverToolbar
                    slideIndex={index}
                    imageIndex={0}
                    currentShape={imageShape}
                    currentPosition="right"
                    onChangeImage={() => onOpenImageModal(index, 0)}
                    onRemoveImage={() => onRemoveImage(index, 0)}
                    onChangeShape={(shape) => onChangeImageShape(index, shape)}
                    onChangePosition={onChangeImagePosition ? (position) => onChangeImagePosition(index, position) : undefined}
                    onMoveImage={hasMultipleImages && onReorderImages ? (direction) => {
                      const newIndex = direction === "left" ? Math.max(0, -1) : Math.min(allImages.length - 1, 1);
                      if (newIndex !== 0) onReorderImages(index, 0, newIndex);
                    } : undefined}
                    theme={isThemeDark ? "dark" : "light"}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {hasImage && firstImage && (
              <div
                className={`w-full sm:w-[40%] relative overflow-hidden flex-shrink-0 min-h-[200px] sm:min-h-0 ${clipClass}`}
                onMouseEnter={() => canEdit && setHoveredImageIndex(0)}
                onMouseLeave={() => setHoveredImageIndex(null)}
              >
                <SlideImageDesign
                  image={firstImage}
                  alt={firstImage.alt || slide.title}
                  shape={imageShape}
                  orientation="left"
                  accent={colors.accent}
                  isDark={isThemeDark}
                  imgCursor={canEdit && onChangeImagePosition ? "grab" : "default"}
                  draggable={canEdit && !!onChangeImagePosition}
                  onDragStart={(e) => {
                    if (!canEdit || !onChangeImagePosition) return;
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", "image-drag");
                    setIsDraggingImage(true);
                  }}
                  onDragEnd={() => setIsDraggingImage(false)}
                />
                {canEdit && hoveredImageIndex === 0 && onOpenImageModal && onRemoveImage && onChangeImageShape && !isDraggingImage && (
                  <ImageHoverToolbar
                    slideIndex={index}
                    imageIndex={0}
                    currentShape={imageShape}
                    currentPosition="left"
                    onChangeImage={() => onOpenImageModal(index, 0)}
                    onRemoveImage={() => onRemoveImage(index, 0)}
                    onChangeShape={(shape) => onChangeImageShape(index, shape)}
                    onChangePosition={onChangeImagePosition ? (position) => onChangeImagePosition(index, position) : undefined}
                    onMoveImage={hasMultipleImages && onReorderImages ? (direction) => {
                      const newIndex = direction === "left" ? Math.max(0, -1) : Math.min(allImages.length - 1, 1);
                      if (newIndex !== 0) onReorderImages(index, 0, newIndex);
                    } : undefined}
                    theme={isThemeDark ? "dark" : "light"}
                  />
                )}
              </div>
            )}
            <div className={`flex flex-col justify-center pt-4 sm:pt-16 md:pt-20 pb-4 sm:pb-8 md:pb-12 pl-4 sm:pl-6 md:pl-8 pr-4 sm:pr-8 md:pr-12 ${hasImage ? "w-full sm:w-[60%]" : "w-full"}`}>
              {renderTitle("text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8")}
              {renderDescription ? renderDescription() : null}
              {!isTitleSlide && renderEnhanced()}
            </div>
          </>
        )}
      </div>

      {isDraggingImage && onChangeImagePosition && (
        <ImageDragZones
          isVisible={isDraggingImage}
          currentPosition={imagePosition}
          onDropPosition={(position) => {
            onChangeImagePosition(index, position);
            setIsDraggingImage(false);
          }}
          theme={isThemeDark ? "dark" : "light"}
        />
      )}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      <style jsx>{`
        .${clipClass} { clip-path: none; }
        @media (min-width: 640px) {
          .${clipClass} { clip-path: ${clipShape}; }
        }
      `}</style>
    </div>
  );
}

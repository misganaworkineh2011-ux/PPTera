"use client";

import type { SlideData, SlideImage } from "./types";
import type { ImageShape, SlideLayoutType } from "~/lib/layouts/slide";
import SlideImg from "./SlideImage";
import ImageHoverToolbar from "./ImageHoverToolbar";

interface ImageBaseProps {
  images: SlideImage[];
  slide: SlideData;
  colors: {
    accentBorder: string;
    surface: string;
    overlay: string;
    border: string;
  };
  canEdit: boolean;
  hoveredImageIndex: number | null;
  setHoveredImageIndex: (index: number | null) => void;
  index: number;
  imageShape: ImageShape;
  isThemeDark: boolean;
  hasMultipleImages: boolean;
  onOpenImageModal?: (slideIndex: number, imageIndex?: number) => void;
  onRemoveImage?: (slideIndex: number, imageIndex: number) => void;
  onChangeImageShape?: (slideIndex: number, shape: ImageShape) => void;
  onChangeImagePosition?: (slideIndex: number, position: SlideLayoutType) => void;
  onReorderImages?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
}

interface SlideImageBlockProps extends ImageBaseProps {
  className?: string;
  size?: "small" | "medium" | "large";
  imageIndex?: number;
}

export function SlideImageBlock({
  images,
  slide,
  colors,
  canEdit,
  hoveredImageIndex,
  setHoveredImageIndex,
  index,
  imageShape,
  isThemeDark,
  hasMultipleImages,
  onOpenImageModal,
  onRemoveImage,
  onChangeImageShape,
  onChangeImagePosition,
  onReorderImages,
  className = "",
  size = "large",
  imageIndex = 0,
}: SlideImageBlockProps) {
  const img = images[imageIndex];
  if (!img) return null;

  const sizeClass = size === "small" ? "max-h-[50%]" : size === "medium" ? "max-h-[70%]" : "max-h-[85%]";
  const isImageHovered = hoveredImageIndex === imageIndex;
  const isPlaceholder = img.source === "placeholder" || !img.url;

  return (
    <div
      className={`relative ${sizeClass} ${className}`}
      onMouseEnter={() => canEdit && setHoveredImageIndex(imageIndex)}
      onMouseLeave={() => setHoveredImageIndex(null)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
      <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
        {isPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900/50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-zinc-400">Loading image...</span>
            </div>
          </div>
        ) : (
          <>
            <SlideImg image={img} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${colors.overlay} via-transparent to-transparent`} />
          </>
        )}
      </div>

      {!isPlaceholder && canEdit && isImageHovered && onOpenImageModal && onRemoveImage && onChangeImageShape && (
        <ImageHoverToolbar
          slideIndex={index}
          imageIndex={imageIndex}
          currentShape={imageShape}
          currentPosition={slide.slideLayout?.replace("image-", "") as "left" | "right" | "top" | "bottom" | undefined}
          onChangeImage={() => onOpenImageModal(index, imageIndex)}
          onRemoveImage={() => onRemoveImage(index, imageIndex)}
          onChangeShape={(shape) => onChangeImageShape(index, shape)}
          onChangePosition={onChangeImagePosition ? (position) => onChangeImagePosition(index, position) : undefined}
          onMoveImage={hasMultipleImages && onReorderImages ? (direction) => {
            const newIndex = direction === "left" ? Math.max(0, imageIndex - 1) : Math.min(images.length - 1, imageIndex + 1);
            if (newIndex !== imageIndex) onReorderImages(index, imageIndex, newIndex);
          } : undefined}
          theme={isThemeDark ? "dark" : "light"}
        />
      )}
    </div>
  );
}

interface SlideImageGalleryProps extends ImageBaseProps {
  className?: string;
  layout?: "grid" | "row" | "stack";
}

export function SlideImageGallery({
  images,
  slide,
  colors,
  canEdit,
  hoveredImageIndex,
  setHoveredImageIndex,
  index,
  imageShape,
  isThemeDark,
  hasMultipleImages,
  onOpenImageModal,
  onRemoveImage,
  onChangeImageShape,
  onChangeImagePosition,
  onReorderImages,
  className = "",
  layout = "grid",
}: SlideImageGalleryProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <SlideImageBlock
        images={images}
        slide={slide}
        colors={colors}
        canEdit={canEdit}
        hoveredImageIndex={hoveredImageIndex}
        setHoveredImageIndex={setHoveredImageIndex}
        index={index}
        imageShape={imageShape}
        isThemeDark={isThemeDark}
        hasMultipleImages={hasMultipleImages}
        onOpenImageModal={onOpenImageModal}
        onRemoveImage={onRemoveImage}
        onChangeImageShape={onChangeImageShape}
        onChangeImagePosition={onChangeImagePosition}
        onReorderImages={onReorderImages}
        className={className}
      />
    );
  }

  if (layout === "row") {
    return (
      <div className={`flex gap-3 ${className}`}>
        {images.slice(0, 3).map((img, idx) => {
          const isPlaceholder = img.source === "placeholder" || !img.url;
          return (
            <div key={idx} className="flex-1 relative rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
              <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
                {isPlaceholder ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900/50">
                    <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <SlideImg image={img} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <div className={`relative ${className}`} style={{ height: "100%" }}>
        {images.slice(0, 3).map((img, idx) => {
          const isPlaceholder = img.source === "placeholder" || !img.url;
          return (
            <div
              key={idx}
              className={`absolute rounded-lg overflow-hidden shadow-xl border ${colors.border}`}
              style={{
                width: `${85 - idx * 10}%`,
                height: `${85 - idx * 10}%`,
                top: `${idx * 8}%`,
                left: `${idx * 8}%`,
                zIndex: images.length - idx,
              }}
            >
              {isPlaceholder ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900/50">
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <SlideImg image={img} alt={img.alt || slide.title} className="w-full h-full object-cover" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const gridCols = images.length === 2 ? "grid-cols-2" : images.length === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={`grid ${gridCols} gap-3 ${className}`}>
      {images.slice(0, 4).map((img, idx) => {
        const isPlaceholder = img.source === "placeholder" || !img.url;
        return (
          <div key={idx} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: images.length <= 2 ? "16/9" : "4/3" }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.accentBorder} rounded-lg`} />
            <div className={`absolute inset-[1px] ${colors.surface} rounded-lg overflow-hidden`}>
              {isPlaceholder ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900/50">
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <SlideImg image={img} alt={img.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

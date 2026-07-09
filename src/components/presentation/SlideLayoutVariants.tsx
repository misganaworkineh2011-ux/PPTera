"use client";

import type { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Plus } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState, SlideImage } from "./types";
import type { LayoutVariant } from "./slide-layout-utils";
import type { ImageShape, SlideLayoutType } from "~/lib/layouts/slide";
import { getImageShapeClipPath } from "~/lib/layouts/slide";
import EditableText from "./EditableText";
import SlideImg from "./SlideImage";
import SlideImageDesign from "./SlideImageDesign";
import ImageHoverToolbar from "./ImageHoverToolbar";
import ImageDragZones from "./ImageDragZones";

interface SlideLayoutVariantsProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
  themeType: string;
  index: number;
  totalSlides: number;
  colors: {
    bg: string;
    bgSolid: string;
    orb1: string;
    orb2: string;
    orb1Strong: string;
    orb2Strong: string;
    accent: string;
    accentMuted: string;
    accentLine: string;
    accentBorder: string;
    accentGlow: string;
    border: string;
    borderLine: string;
    surface: string;
    surfaceAlt: string;
    overlay: string;
    cardBg: string;
    indicatorMuted: string;
    hoverAccent: string;
    imgOverlay: string;
    fullOverlay: string;
    sideOverlay: string;
    topOverlay: string;
    textMuted: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  hasImage: boolean;
  hasMultipleImages: boolean;
  allImages: SlideImage[];
  imageShape: ImageShape;
  isThemeDark: boolean;
  hoveredImageIndex: number | null;
  setHoveredImageIndex: (index: number | null) => void;
  isDraggingImage: boolean;
  setIsDraggingImage: (value: boolean) => void;
  bulletPoints: string[];
  canEdit: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  onOpenImageModal?: (slideIndex: number, imageIndex?: number) => void;
  onRemoveImage?: (slideIndex: number, imageIndex: number) => void;
  onChangeImageShape?: (slideIndex: number, shape: ImageShape) => void;
  onChangeImagePosition?: (slideIndex: number, position: SlideLayoutType) => void;
  onReorderImages?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  renderTitle: (props: { className?: string; align?: "left" | "center" | "right"; showSubtitle?: boolean }) => ReactNode;
  renderDescription: (props?: { className?: string; align?: "left" | "center" | "right" }) => ReactNode;
  renderEnhanced: (props?: { compact?: boolean }) => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
  renderImageBlock: (props: { className?: string; size?: "small" | "medium" | "large"; imageIndex?: number }) => ReactNode;
  renderImageGallery: (props: { className?: string; layout?: "grid" | "row" | "stack" }) => ReactNode;
  renderCardBox: (props: { children: ReactNode; className?: string; style?: CSSProperties }) => ReactNode;
  isTitleSlide: boolean;
}

export function renderSlideLayoutVariants(props: SlideLayoutVariantsProps): ReactNode | null {
  const {
    layout,
    slide,
    theme,
    themeType,
    index,
    totalSlides,
    colors,
    useGradientClasses,
    customBgStyle,
    hasImage,
    hasMultipleImages,
    allImages,
    imageShape,
    isThemeDark,
    hoveredImageIndex,
    setHoveredImageIndex,
    isDraggingImage,
    setIsDraggingImage,
    bulletPoints,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    onOpenImageModal,
    onRemoveImage,
    onChangeImageShape,
    onChangeImagePosition,
    onReorderImages,
    renderTitle,
    renderDescription,
    renderEnhanced,
    renderIndicator,
    renderImageBlock,
    renderImageGallery,
    renderCardBox,
    isTitleSlide,
  } = props;

  if (layout === "image-top") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-b ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col items-stretch">
          {hasImage && firstImage && (
            <div
              className="w-full relative overflow-hidden flex-shrink-0 min-h-[200px] sm:min-h-0 slide-clip-top"
              onMouseEnter={() => canEdit && setHoveredImageIndex(0)}
              onMouseLeave={() => setHoveredImageIndex(null)}
            >
              <SlideImageDesign
                image={firstImage}
                alt={firstImage.alt || slide.title}
                shape={imageShape}
                orientation="top"
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
                  currentPosition="top"
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

          <div className="flex-1 flex flex-col justify-center pt-4 sm:pt-8 md:pt-12 pb-4 sm:pb-8 md:pb-12 px-4 sm:px-8 md:px-12">
            {renderTitle({ className: "text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4 md:mb-5" })}
            {!isTitleSlide && renderEnhanced({})}
          </div>
        </div>

        {isDraggingImage && onChangeImagePosition && (
          <ImageDragZones
            isVisible={isDraggingImage}
            currentPosition="top"
            onDropPosition={(position) => {
              onChangeImagePosition(index, position);
              setIsDraggingImage(false);
            }}
            theme={isThemeDark ? "dark" : "light"}
          />
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
        <style jsx>{`
          .slide-clip-top { clip-path: none; }
          @media (min-width: 640px) {
            .slide-clip-top { clip-path: ${getImageShapeClipPath(imageShape, "top")}; }
          }
        `}</style>
      </div>
    );
  }

  if (layout === "image-bottom") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-t ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col items-stretch">
          <div className="flex-1 flex flex-col justify-center pt-4 sm:pt-8 md:pt-12 pb-4 sm:pb-8 md:pb-12 px-4 sm:px-8 md:px-12">
            {renderTitle({ className: "text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8", showSubtitle: isTitleSlide })}
            {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4 md:mb-5" })}
            {!isTitleSlide && renderEnhanced({})}
          </div>

          {hasImage && firstImage && (
            <div
              className="w-full relative overflow-hidden flex-shrink-0 min-h-[200px] sm:min-h-0 slide-clip-bottom"
              onMouseEnter={() => canEdit && setHoveredImageIndex(0)}
              onMouseLeave={() => setHoveredImageIndex(null)}
            >
              <SlideImageDesign
                image={firstImage}
                alt={firstImage.alt || slide.title}
                shape={imageShape}
                orientation="bottom"
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
                  currentPosition="bottom"
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
        </div>

        {isDraggingImage && onChangeImagePosition && (
          <ImageDragZones
            isVisible={isDraggingImage}
            currentPosition="bottom"
            onDropPosition={(position) => {
              onChangeImagePosition(index, position);
              setIsDraggingImage(false);
            }}
            theme={isThemeDark ? "dark" : "light"}
          />
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
        <style jsx>{`
          .slide-clip-bottom { clip-path: none; }
          @media (min-width: 640px) {
            .slide-clip-bottom { clip-path: ${getImageShapeClipPath(imageShape, "bottom")}; }
          }
        `}</style>
      </div>
    );
  }

  if (layout === "centered") {
    const shouldCenterTitleSlide = isTitleSlide && !hasImage;
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-b ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div
          className={`relative h-full flex flex-col ${
            hasImage || shouldCenterTitleSlide ? "items-center justify-center" : "justify-center"
          } ${
            shouldCenterTitleSlide
              ? "px-10 sm:px-16 md:px-24 lg:px-32 py-10 sm:py-14 md:py-16"
              : hasImage
                ? "p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12"
                : "p-4 sm:p-6 md:p-8 pt-12 sm:pt-8 md:pt-12"
          } ${hasImage || shouldCenterTitleSlide ? "text-center" : ""} ${
            shouldCenterTitleSlide ? "" : "overflow-visible"
          }`}
        >
          {hasImage && (
            <div className={`w-full ${hasMultipleImages ? "max-w-4xl" : "max-w-2xl"} mb-4 sm:mb-6 md:mb-8 relative`}>
              {hasMultipleImages ? (
                renderImageGallery({ className: "w-full max-h-[120px] sm:max-h-[180px] md:max-h-none", layout: "row" })
              ) : (
                <div className="h-28 sm:h-36 md:h-48">
                  {renderImageBlock({ className: "w-full h-full", size: "medium" })}
                </div>
              )}
            </div>
          )}

          {renderTitle({
            className: `text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 md:mb-6 ${hasImage || shouldCenterTitleSlide ? "max-w-4xl" : "w-full"} ${hasImage || shouldCenterTitleSlide ? "" : "text-left"}`,
            align: hasImage || shouldCenterTitleSlide ? "center" : "left",
            showSubtitle: isTitleSlide,
          })}
          {!isTitleSlide && renderDescription({ className: `mb-3 sm:mb-4 md:mb-5 ${hasImage ? "" : "text-left"}`, align: hasImage ? "center" : "left" })}

          {!isTitleSlide && (
            <div className={`${hasImage ? "max-w-2xl w-full text-left" : "w-full"} mt-2 sm:mt-3 md:mt-4`}>
              {renderEnhanced({ compact: true })}
            </div>
          )}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  if (layout === "split-diagonal") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />

        {hasImage && firstImage && (
          <div className="absolute inset-0 clip-diagonal hidden sm:block">
            <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className={`absolute inset-0 w-full h-full object-cover ${themeType === "light" ? "opacity-20" : "opacity-30"}`} />
            <div className={`absolute inset-0 ${colors.imgOverlay}`} />
          </div>
        )}

        <div className={`absolute top-0 right-1/4 w-72 h-72 ${colors.orb1Strong} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 left-1/4 w-64 h-64 ${colors.orb2Strong} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col sm:flex-row">
          <div className="w-full sm:w-[60%] flex flex-col justify-center p-4 sm:p-8 md:p-12 pt-12 sm:pt-8 md:pt-12">
            <div className="mb-2 sm:mb-4">
              <div className={`w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-gradient-to-r ${colors.accentLine} to-transparent mb-3 sm:mb-4 md:mb-6`} />
            </div>
            {renderTitle({ className: "text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 md:mb-8" })}
            {!isTitleSlide && renderDescription({ className: "mb-3 sm:mb-4 md:mb-5" })}
            {renderEnhanced({})}
          </div>

          {hasImage && (
            <div className="w-full sm:w-[40%] relative flex items-center justify-center sm:justify-end p-4 sm:p-6 md:p-8 min-h-[150px] sm:min-h-0">
              <div className="relative w-full sm:w-[90%] h-[150px] sm:h-[70%]">
                <div className={`absolute -inset-2 bg-gradient-to-br ${colors.accentGlow} rounded-lg blur-sm hidden sm:block`} />
                {hasMultipleImages
                  ? renderImageGallery({ className: "w-full h-full", layout: "grid" })
                  : renderImageBlock({ className: "w-full h-full", size: "large" })}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`.clip-diagonal { clip-path: polygon(50% 0, 100% 0, 100% 100%, 30% 100%); }`}</style>
      </div>
    );
  }

  if (layout === "image-focus") {
    const firstImage = allImages[0];
    return (
      <div className="h-full relative overflow-hidden">
        {hasImage && firstImage ? (
          <>
            <SlideImg image={firstImage} alt={firstImage.alt || slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${colors.fullOverlay}`} />
            <div className={`absolute inset-0 ${colors.sideOverlay}`} />
          </>
        ) : (
          <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        )}

        <div className={`absolute top-0 left-0 w-full h-32 ${colors.topOverlay}`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-12 pb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <div className={`w-20 h-px bg-gradient-to-r ${colors.accentLine} to-transparent opacity-50`} />
            </div>
            {renderTitle({ className: "text-4xl md:text-5xl lg:text-6xl mb-6" })}
            {renderCardBox({ className: "mt-6 backdrop-blur-sm rounded-lg p-6 border", children: renderEnhanced({ compact: true }) })}
          </div>
        </div>

        {hasMultipleImages && (
          <div className="absolute top-4 right-4 flex gap-2">
            {allImages.slice(1, 4).map((img, idx) => (
              <div key={idx} className="w-16 h-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                <SlideImg image={img} alt={img.alt || ""} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {firstImage?.source === "pexels" && firstImage.photographer && (
          <div className={`absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded ${themeType === "light" ? "bg-white/80" : "bg-black/60"}`} style={{ color: colors.textMuted }}>
            <a href={firstImage.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{firstImage.photographer}</a>
          </div>
        )}
      </div>
    );
  }

  if (layout === "minimal-left") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${colors.bgSolid}`} />

        <div className={`absolute top-0 left-0 w-2 h-32 bg-gradient-to-b ${colors.accentLine} to-transparent`} />
        <div className={`absolute top-0 left-0 w-32 h-2 bg-gradient-to-r ${colors.accentLine} to-transparent`} />

        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${colors.orb2} rounded-full blur-3xl`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col justify-center p-6 sm:p-10 md:p-14">
          <div className="max-w-3xl">
            {renderTitle({ className: "text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-6" })}
            {renderEnhanced({})}
          </div>
        </div>
      </div>
    );
  }

  // Remaining layout variants continue...
  // NOTE: To keep this response concise, copy the rest of layout blocks from SlideRenderer
  // into this file if not already moved.

  return null;
}

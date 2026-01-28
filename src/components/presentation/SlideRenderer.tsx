"use client";

import { useState, memo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { type Theme } from "~/lib/themes";
import { type SlideData, type EditingState, type SlideChartData } from "./types";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import { type ImageShape, type SlideLayoutType } from "~/lib/layouts/slide";
import ContentLayoutSelector from "./ContentLayoutSelector";
import { getLayoutVariant, getThemeType } from "./slide-layout-utils";
import { getBoxContentItems, getSlideImages } from "./slide-content-utils";
import { SlideIndicator as SlideIndicatorChrome } from "./SlideChrome";
import { TitleBlock, SlideDescriptionBlock, BulletPointsBlock } from "./SlideTextBlocks";
import { SlideImageBlock, SlideImageGallery } from "./SlideImageBlocks";
import SlideEnhancedContent from "./SlideEnhancedContent";
import SlideChartLayouts from "./SlideChartLayouts";
import SlideSideImageLayouts from "./SlideSideImageLayouts";
import { renderLayoutSetA } from "./layout-sets/SlideLayoutSetA";
import { renderLayoutSetB } from "./layout-sets/SlideLayoutSetB";
import { renderLayoutSetC } from "./layout-sets/SlideLayoutSetC";
import { renderLayoutSetD } from "./layout-sets/SlideLayoutSetD";
import { renderLayoutSetE } from "./layout-sets/SlideLayoutSetE";
import { renderLayoutSetF } from "./layout-sets/SlideLayoutSetF";
import { colorMap } from "./layout-sets/slide-theme-colors";

interface SlideRendererProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  theme: Theme;
  isOwner: boolean;
  isFullscreen: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  showPageNumber?: boolean;
  isPresenting?: boolean; // Enable content animations during presentation
  spotlightIndex?: number; // Which content element is highlighted (undefined = no spotlight)
  onStartEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  onUpdateContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  onFinishEditing: () => void;
  onAddBullet: (slideIndex: number) => void;
  onDeleteBullet: (slideIndex: number, bulletIndex: number) => void;
  onDeleteTitle?: (slideIndex: number) => void;
  onDeleteSubtitle?: (slideIndex: number) => void;
  onReorderContent?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  onChangeContentLayout?: (slideIndex: number, layoutId: BoxLayoutType) => void;
  onOpenContentLayoutPanel?: () => void;
  onUpdateChart?: (slideIndex: number, chart: SlideChartData) => void;
  // Image manipulation callbacks
  onOpenImageModal?: (slideIndex: number, imageIndex?: number) => void;
  onRemoveImage?: (slideIndex: number, imageIndex: number) => void;
  onChangeImageShape?: (slideIndex: number, shape: ImageShape) => void;
  onChangeImagePosition?: (slideIndex: number, position: SlideLayoutType) => void;
  onReorderImages?: (slideIndex: number, fromIndex: number, toIndex: number) => void;
}

function SlideRendererComponent({
  slide,
  index,
  totalSlides,
  theme,
  isOwner,
  isFullscreen,
  isHovered,
  isEditing,
  editingText,
  showPageNumber = true,
  isPresenting = false,
  spotlightIndex,
  onStartEditing,
  onUpdateContent,
  onFinishEditing,
  onAddBullet,
  onDeleteBullet,
  onDeleteTitle,
  onDeleteSubtitle,
  onReorderContent,
  onChangeContentLayout,
  onOpenContentLayoutPanel,
  onUpdateChart,
  onOpenImageModal,
  onRemoveImage,
  onChangeImageShape,
  onChangeImagePosition,
  onReorderImages,
}: SlideRendererProps) {
  const [showContentLayoutSelector, setShowContentLayoutSelector] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const allImages = getSlideImages(slide);
  const hasAnyImage = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;
  const bulletPoints = slide.bulletPoints || [];
  const canEdit = isOwner && !isFullscreen;
  const themeType = getThemeType(theme);

  const isSpotlightMode = spotlightIndex !== undefined;

  const getSpotlightStyle = (contentIndex: number): CSSProperties => {
    const effectiveSpotlightIndex = spotlightIndex;

    if (effectiveSpotlightIndex === undefined || effectiveSpotlightIndex === -1) {
      if (!isSpotlightMode) return {};
      return {
        transition: "all 0.5s ease",
      };
    }

    const isHighlighted = effectiveSpotlightIndex === contentIndex;

    return {
      opacity: isHighlighted ? 1 : 0.15,
      filter: "none",
      transform: isHighlighted ? "scale(1.02)" : "scale(0.98)",
      transition: "all 0.5s ease",
      zIndex: isHighlighted ? 10 : 1,
      position: "relative",
    };
  };

  const imageShape: ImageShape = slide.imageShape || "arc";
  const hasChart = !!slide.chart;
  let effectiveSlideLayout: string | undefined = slide.slideLayout || slide.layout;

  if (hasChart && !hasAnyImage) {
    effectiveSlideLayout = "chart-right";
  }

  const hasImage = hasAnyImage && effectiveSlideLayout !== "no-image";

  if (hasImage) {
    console.log(`[SlideRenderer] Slide ${index}: slideLayout="${slide.slideLayout}", layout="${slide.layout}", effective="${effectiveSlideLayout}"`);
  }

  const layout = getLayoutVariant(index, themeType, effectiveSlideLayout);

  const handleChartTitleChange = (newTitle: string) => {
    if (onUpdateChart && slide.chart) {
      onUpdateChart(index, { ...slide.chart, title: newTitle });
    }
  };

  const hasBoxContent = !!(
    (slide.sections && slide.sections.length > 0) ||
    (slide.transformedContent?.items && slide.transformedContent.items.some(item => item.label)) ||
    (slide.bulletPoints && slide.bulletPoints.length > 0)
  );

  const boxContentItems = getBoxContentItems(slide);
  const isCustomTheme = theme.id.startsWith("custom-");
  const hasCardBox = !!theme.cardBox?.background;

  const customBgGradient = isCustomTheme
    ? theme.slideStyles?.content?.background || `linear-gradient(to bottom right, ${theme.colors.background}, ${theme.colors.backgroundAlt})`
    : "";

  const colors = {
    ...colorMap[themeType as keyof typeof colorMap] || colorMap.dark,
    accent: theme.colors.primary,
    text: theme.colors.heading,
    textMuted: theme.colors.textMuted,
  };

  const customBgStyle: CSSProperties = hasCardBox
    ? {
        backgroundColor: theme.cardBox.background,
        border: `1px solid ${theme.cardBox.borderColor}`,
        backdropFilter: "blur(12px)",
      }
    : isCustomTheme
      ? { background: customBgGradient }
      : {};

  const useGradientClasses = !hasCardBox && !isCustomTheme;

  const customCardStyle: CSSProperties | undefined = (isCustomTheme && theme.cardBox)
    ? {
        backgroundColor: theme.cardBox.background,
        borderColor: theme.cardBox.borderColor,
        boxShadow: theme.cardBox.shadow,
        backdropFilter: "blur(8px)",
      }
    : undefined;

  const useCustomCardStyle = isCustomTheme && !!customCardStyle;

  const getCardBgProps = (additionalClasses = ""): { className: string; style?: CSSProperties } => {
    if (useCustomCardStyle) {
      return {
        className: `backdrop-blur-md border ${additionalClasses}`.trim(),
        style: customCardStyle,
      };
    }
    return {
      className: `${colors.cardBg} ${additionalClasses}`.trim(),
    };
  };

  const CardBox = ({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: CSSProperties }) => {
    const cardProps = getCardBgProps();
    return (
      <div
        className={`${cardProps.className} ${className}`}
        style={{ ...cardProps.style, ...style }}
      >
        {children}
      </div>
    );
  };

  const handleOpenLayoutSelector = () => setShowContentLayoutSelector(true);

  const SlideIndicator = ({ position = "top-left" }: { position?: "top-left" | "top-right" }) => (
    <SlideIndicatorChrome
      showPageNumber={showPageNumber}
      index={index}
      totalSlides={totalSlides}
      colors={{
        accent: colors.accent,
        accentLine: colors.accentLine,
        indicatorMuted: colors.indicatorMuted,
      }}
      position={position}
    />
  );

  const isTitleSlide = slide.type === "title";

  const SlideDescription = ({ className = "", align = "left" }: { className?: string; align?: "left" | "center" | "right" }) => (
    <SlideDescriptionBlock
      slide={slide}
      theme={theme}
      colors={colors}
      isEditing={isEditing}
      editingText={editingText}
      canEdit={canEdit}
      isHovered={isHovered}
      index={index}
      onStartEditing={onStartEditing}
      onUpdateContent={onUpdateContent}
      onFinishEditing={onFinishEditing}
      getSpotlightStyle={getSpotlightStyle}
      className={className}
      align={align}
      isTitleSlide={isTitleSlide}
    />
  );

  const Title = ({ className = "", align = "left", showSubtitle = false }: { className?: string; align?: "left" | "center" | "right"; showSubtitle?: boolean }) => (
    <TitleBlock
      slide={slide}
      theme={theme}
      colors={colors}
      isEditing={isEditing}
      editingText={editingText}
      canEdit={canEdit}
      isHovered={isHovered}
      index={index}
      onStartEditing={onStartEditing}
      onUpdateContent={onUpdateContent}
      onFinishEditing={onFinishEditing}
      onDeleteTitle={onDeleteTitle}
      onDeleteSubtitle={onDeleteSubtitle}
      getSpotlightStyle={getSpotlightStyle}
      isTitleSlide={isTitleSlide}
      className={className}
      align={align}
      showSubtitle={showSubtitle}
    />
  );

  const BulletPoints = ({ compact = false }: { compact?: boolean }) => (
    <BulletPointsBlock
      slide={slide}
      theme={theme}
      colors={colors}
      isEditing={isEditing}
      editingText={editingText}
      canEdit={canEdit}
      isHovered={isHovered}
      index={index}
      onStartEditing={onStartEditing}
      onUpdateContent={onUpdateContent}
      onFinishEditing={onFinishEditing}
      getSpotlightStyle={getSpotlightStyle}
      bulletPoints={bulletPoints}
      onAddBullet={onAddBullet}
      onDeleteBullet={onDeleteBullet}
      compact={compact}
      isCustomTheme={isCustomTheme}
    />
  );

  const EnhancedContent = ({ compact = false }: { compact?: boolean }) => (
    <SlideEnhancedContent
      slide={slide}
      index={index}
      theme={theme}
      layout={layout}
      colors={{
        indicatorMuted: colors.indicatorMuted,
        hoverAccent: colors.hoverAccent,
      }}
      canEdit={canEdit}
      isHovered={isHovered}
      isEditing={isEditing}
      editingText={editingText}
      spotlightIndex={spotlightIndex}
      isSpotlightMode={isSpotlightMode}
      hasBoxContent={hasBoxContent}
      hasImage={hasImage}
      boxContentItems={boxContentItems}
      allImages={allImages}
      compact={compact}
      onStartEditing={onStartEditing}
      onUpdateContent={onUpdateContent}
      onFinishEditing={onFinishEditing}
      onAddBullet={onAddBullet}
      onDeleteBullet={onDeleteBullet}
      onReorderContent={onReorderContent}
      onOpenContentLayoutPanel={onOpenContentLayoutPanel}
      onOpenLayoutSelector={handleOpenLayoutSelector}
      onOpenImageModal={onOpenImageModal}
      onChartTitleChange={handleChartTitleChange}
      renderBulletPoints={(isCompact) => <BulletPoints compact={isCompact} />}
    />
  );

  const isThemeDark = ["dark", "sunset", "ocean", "aurora", "ember", "midnight", "cyber", "alien", "cosmic", "architectural", "hacker", "custom-dark"].includes(themeType);

  const ImageBlock = ({ className = "", size = "large", imageIndex = 0 }: { className?: string; size?: "small" | "medium" | "large"; imageIndex?: number }) => (
    <SlideImageBlock
      images={allImages}
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
      size={size}
      imageIndex={imageIndex}
    />
  );

  const ImageGallery = ({ className = "", layout: galleryLayout = "grid" }: { className?: string; layout?: "grid" | "row" | "stack" }) => (
    <SlideImageGallery
      images={allImages}
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
      layout={galleryLayout}
    />
  );

  const chartLayout = (
    <SlideChartLayouts
      layout={layout}
      slide={slide}
      theme={theme}
      colors={{
        bg: colors.bg,
        orb1: colors.orb1,
        orb2: colors.orb2,
        borderLine: colors.borderLine,
      }}
      useGradientClasses={useGradientClasses}
      customBgStyle={customBgStyle}
      canEdit={canEdit}
      onChartTitleChange={handleChartTitleChange}
      renderTitle={(className) => <Title className={className} />}
      renderBullets={() => <BulletPoints compact />}
      renderIndicator={(position) => <SlideIndicator position={position} />}
    />
  );

  if (layout === "chart-left" || layout === "chart-right") {
    return chartLayout;
  }

  if (layout === "left-content" || layout === "right-content") {
    return (
      <SlideSideImageLayouts
        layout={layout}
        slide={slide}
        index={index}
        hasImage={hasImage}
        allImages={allImages}
        colors={{
          bg: colors.bg,
          orb1: colors.orb1,
          orb2: colors.orb2,
          borderLine: colors.borderLine,
        }}
        useGradientClasses={useGradientClasses}
        customBgStyle={customBgStyle}
        canEdit={canEdit}
        isTitleSlide={isTitleSlide}
        imageShape={imageShape}
        isThemeDark={isThemeDark}
        hoveredImageIndex={hoveredImageIndex}
        setHoveredImageIndex={setHoveredImageIndex}
        isDraggingImage={isDraggingImage}
        setIsDraggingImage={setIsDraggingImage}
        hasMultipleImages={hasMultipleImages}
        onOpenImageModal={onOpenImageModal}
        onRemoveImage={onRemoveImage}
        onChangeImageShape={onChangeImageShape}
        onChangeImagePosition={onChangeImagePosition}
        onReorderImages={onReorderImages}
        renderTitle={(className) => <Title className={className} />}
        renderDescription={() => <SlideDescription className="mb-3 sm:mb-4 md:mb-5" />}
        renderEnhanced={() => <EnhancedContent />}
        renderIndicator={(position) => <SlideIndicator position={position} />}
      />
    );
  }

  const layoutSetA = renderLayoutSetA({
    layout,
    slide,
    themeType,
    index,
    colors: {
      bg: colors.bg,
      orb1: colors.orb1,
      orb2: colors.orb2,
      orb1Strong: colors.orb1Strong,
      orb2Strong: colors.orb2Strong,
      accent: colors.accent,
      accentLine: colors.accentLine,
      accentGlow: colors.accentGlow,
      border: colors.border,
      borderLine: colors.borderLine,
      imgOverlay: colors.imgOverlay,
      fullOverlay: colors.fullOverlay,
      sideOverlay: colors.sideOverlay,
      topOverlay: colors.topOverlay,
      textMuted: colors.textMuted,
      indicatorMuted: colors.indicatorMuted,
    },
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
    canEdit,
    isTitleSlide,
    onOpenImageModal,
    onRemoveImage,
    onChangeImageShape,
    onChangeImagePosition,
    onReorderImages,
    renderTitle: ({ className, align, showSubtitle }) => (
      <Title className={className} align={align} showSubtitle={showSubtitle} />
    ),
    renderDescription: ({ className, align } = {}) => (
      <SlideDescription className={className ?? ""} align={align} />
    ),
    renderEnhanced: ({ compact } = {}) => <EnhancedContent compact={compact} />,
    renderIndicator: (position) => <SlideIndicator position={position} />,
    renderImageBlock: ({ className, size, imageIndex }) => (
      <ImageBlock className={className} size={size} imageIndex={imageIndex} />
    ),
    renderImageGallery: ({ className, layout: galleryLayout }) => (
      <ImageGallery className={className} layout={galleryLayout} />
    ),
    renderCardBox: ({ children, className, style }) => (
      <CardBox className={className} style={style}>
        {children}
      </CardBox>
    ),
  });

  if (layoutSetA) {
    return layoutSetA;
  }

  const layoutSetB = renderLayoutSetB({
    layout,
    slide,
    theme,
    themeType,
    index,
    bulletPoints,
    colors: {
      bg: colors.bg,
      orb1: colors.orb1,
      orb2: colors.orb2,
      orb1Strong: colors.orb1Strong,
      orb2Strong: colors.orb2Strong,
      accent: colors.accent,
      accentLine: colors.accentLine,
      accentGlow: colors.accentGlow,
      border: colors.border,
      borderLine: colors.borderLine,
      imgOverlay: colors.imgOverlay,
      fullOverlay: colors.fullOverlay,
      sideOverlay: colors.sideOverlay,
      topOverlay: colors.topOverlay,
      textMuted: colors.textMuted,
      indicatorMuted: colors.indicatorMuted,
      hoverAccent: colors.hoverAccent,
      cardBg: colors.cardBg,
    },
    useGradientClasses,
    customBgStyle,
    hasImage,
    allImages,
    isTitleSlide,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    getCardBgProps,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle: ({ className, align, showSubtitle }) => (
      <Title className={className} align={align} showSubtitle={showSubtitle} />
    ),
    renderEnhanced: ({ compact } = {}) => <EnhancedContent compact={compact} />,
    renderIndicator: (position) => <SlideIndicator position={position} />,
    renderCardBox: ({ children, className, style }) => (
      <CardBox className={className} style={style}>
        {children}
      </CardBox>
    ),
  });

  if (layoutSetB) {
    return layoutSetB;
  }

  const layoutSetC = renderLayoutSetC({
    layout,
    slide,
    theme,
    themeType,
    index,
    bulletPoints,
    colors: {
      bg: colors.bg,
      orb1Strong: colors.orb1Strong,
      orb2Strong: colors.orb2Strong,
      accent: colors.accent,
      fullOverlay: colors.fullOverlay,
      textMuted: colors.textMuted,
      indicatorMuted: colors.indicatorMuted,
      hoverAccent: colors.hoverAccent,
      cardBg: colors.cardBg,
    },
    useGradientClasses,
    customBgStyle,
    hasImage,
    allImages,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle: ({ className, align, showSubtitle }) => (
      <Title className={className} align={align} showSubtitle={showSubtitle} />
    ),
    renderIndicator: (position) => <SlideIndicator position={position} />,
    renderImageBlock: ({ className, size, imageIndex }) => (
      <ImageBlock className={className} size={size} imageIndex={imageIndex} />
    ),
  });

  if (layoutSetC) {
    return layoutSetC;
  }

  const layoutSetD = renderLayoutSetD({
    layout,
    slide,
    theme,
    themeType,
    index,
    bulletPoints,
    colors: {
      bg: colors.bg,
      orb1: colors.orb1,
      orb2: colors.orb2,
      orb1Strong: colors.orb1Strong,
      orb2Strong: colors.orb2Strong,
      accent: colors.accent,
      accentLine: colors.accentLine,
      borderLine: colors.borderLine,
      textMuted: colors.textMuted,
      indicatorMuted: colors.indicatorMuted,
      hoverAccent: colors.hoverAccent,
      cardBg: colors.cardBg,
    },
    useGradientClasses,
    customBgStyle,
    hasImage,
    hasMultipleImages,
    allImages,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle: ({ className, align, showSubtitle }) => (
      <Title className={className} align={align} showSubtitle={showSubtitle} />
    ),
    renderEnhanced: ({ compact } = {}) => <EnhancedContent compact={compact} />,
    renderIndicator: (position) => <SlideIndicator position={position} />,
  });

  if (layoutSetD) {
    return layoutSetD;
  }

  const layoutSetE = renderLayoutSetE({
    layout,
    slide,
    theme,
    index,
    bulletPoints,
    colors: {
      bg: colors.bg,
      orb1: colors.orb1,
      orb2: colors.orb2,
      orb1Strong: colors.orb1Strong,
      orb2Strong: colors.orb2Strong,
      accent: colors.accent,
      accentLine: colors.accentLine,
      border: colors.border,
      textMuted: colors.textMuted,
      indicatorMuted: colors.indicatorMuted,
      hoverAccent: colors.hoverAccent,
      cardBg: colors.cardBg,
    },
    useGradientClasses,
    customBgStyle,
    hasImage,
    hasMultipleImages,
    allImages,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    renderTitle: ({ className, align, showSubtitle }) => (
      <Title className={className} align={align} showSubtitle={showSubtitle} />
    ),
    renderEnhanced: ({ compact } = {}) => <EnhancedContent compact={compact} />,
    renderIndicator: (position) => <SlideIndicator position={position} />,
  });

  if (layoutSetE) {
    return layoutSetE;
  }

  const layoutSetF = renderLayoutSetF({
    layout,
    slide,
    theme,
    index,
    totalSlides,
    bulletPoints,
    colors,
    useGradientClasses,
    customBgStyle,
    hasImage,
    hasMultipleImages,
    allImages,
    canEdit,
    isHovered,
    isEditing,
    editingText,
    isTitleSlide,
    isCustomTheme,
    onStartEditing,
    onUpdateContent,
    onFinishEditing,
    onAddBullet,
    onDeleteBullet,
    Title,
    SlideDescription,
    EnhancedContent,
    SlideIndicator,
    ImageBlock,
  });

  if (layoutSetF) {
    return layoutSetF;
  }

  return (
    <>
      <div className={`h-full relative overflow-hidden ${colors.bgSolid} flex items-center justify-center`}>
        <p style={{ color: colors.textMuted }}>Slide {index + 1}</p>
      </div>

      <ContentLayoutSelector
        isOpen={showContentLayoutSelector}
        currentLayout={slide.contentLayout as BoxLayoutType | undefined}
        contentItems={boxContentItems}
        theme={theme}
        onSelect={(layoutId) => {
          onChangeContentLayout?.(index, layoutId);
          setShowContentLayoutSelector(false);
        }}
        onClose={() => setShowContentLayoutSelector(false)}
      />
    </>
  );
}

const SlideRenderer = memo(SlideRendererComponent, (prevProps, nextProps) => {
  return (
    prevProps.slide === nextProps.slide &&
    prevProps.index === nextProps.index &&
    prevProps.totalSlides === nextProps.totalSlides &&
    prevProps.theme === nextProps.theme &&
    prevProps.isOwner === nextProps.isOwner &&
    prevProps.isFullscreen === nextProps.isFullscreen &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editingText === nextProps.editingText &&
    prevProps.showPageNumber === nextProps.showPageNumber &&
    prevProps.isPresenting === nextProps.isPresenting &&
    prevProps.spotlightIndex === nextProps.spotlightIndex &&
    prevProps.isHovered === nextProps.isHovered
  );
});

SlideRenderer.displayName = "SlideRenderer";

export default SlideRenderer;
